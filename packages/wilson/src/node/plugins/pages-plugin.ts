import { Plugin } from 'vite'
import { TransformResult, LoadResult, ResolveIdResult } from 'rollup'
import { dirname, relative } from 'path'
import { toRoot, transformJsx } from '../util.js'
import minimatch from 'minimatch'
import { getConfig } from '../config.js'
import { ContentPage, SelectPage, TaxonomyPage, TermsPage } from '../page.js'
import { getPageSources } from '../state.js'
import { MarkdownPageSource } from '../page-source.js'
import { TranslatedPagRef } from '../../types.js'

const virtualPageRegex = /^@wilson\/page-source\/(\d+)\/page\/(\d+)/

/**
 * Wrap pages into wrapper components for <head> meta etc.
 */
const pagesPlugin = async (): Promise<Plugin> => {
  return {
    name: 'wilson-plugin-pages',
    enforce: 'pre',

    resolveId(id: string): ResolveIdResult {
      const match = id.match(virtualPageRegex)
      if (match === null) return
      return id
    },

    /**
     * @todo is this required?
     */
    load(id: string): LoadResult {
      const match = id.match(virtualPageRegex)
      if (match === null) return
      return 'wat'
    },

    async transform(code: string, id: string): Promise<TransformResult> {
      const match = id.match(virtualPageRegex)
      if (match === null) return

      const pageSources = getPageSources()
      const pageSourceIndex = parseInt(match[1], 10)
      const pageSource = pageSources[pageSourceIndex]
      const pageIndex = parseInt(match[2], 10)
      const page = pageSource.pages[pageIndex]

      const translationPageSources = pageSources.filter((s) => {
        return (
          s.relativePath.replace(new RegExp(`^${s.language}\\/`), '') ===
          pageSource.relativePath.replace(
            new RegExp(`^${pageSource.language}\\/`),
            ''
          )
        )
      })

      const {
        performance: { autoPrefetch },
        layouts: { nestedLayouts },
        siteData: { lang },
        languages,
      } = getConfig()

      const translations = translationPageSources
        .sort(
          (a, b) =>
            languages.findIndex((l) => l.code === a.language ?? lang) -
            languages.findIndex((l) => l.code === b.language ?? lang)
        )
        .map((pageSource) => {
          const languageConfig = (languages ?? []).find(
            (language) => language.code === pageSource.language
          )
          if (typeof pageSource.language === 'undefined' || !languageConfig)
            return null
          const page =
            pageSource.pages.length === 1
              ? pageSource.pages[0]
              : pageSource.pages[pageIndex]
          return {
            url: page.route,
            languageCode: pageSource.language,
          }
        })
        .filter(Boolean) as TranslatedPagRef[]

      const nestedLayout =
        pageSource.frontmatter.layout ?? typeof nestedLayouts === 'undefined'
          ? undefined
          : nestedLayouts.find(({ pattern = '**' }) => {
              return minimatch(pageSource.relativePath, pattern)
            })?.layout

      const nestedLayoutImport = nestedLayout
        ? `import NestedLayoutOrFragment from '${relative(
            dirname(id),
            toRoot(`./src/layouts/${nestedLayout}`)
          ).replace(/\\/g, '/')}';`
        : `import { Fragment as NestedLayoutOrFragment } from 'preact';`

      const componentProps = `
        title="${page.title}"
        date={${+page.date}}
        translations={${JSON.stringify(translations)}}
        ${
          page instanceof ContentPage
            ? `taxonomies={${JSON.stringify(page.taxonomies)}}`
            : ''
        }
        ${
          pageSource instanceof MarkdownPageSource
            ? `headings={${JSON.stringify(pageSource.headings)}}`
            : ''
        }
        `

      const autoPrefetchUse = autoPrefetch.enabled ? '<AutoPretetch />' : ''
      const autoPrefetchDefinition = autoPrefetch.enabled
        ? `
            import { useAutoPrefetch } from 'wilson/dist/client/context/prefetch';

            const AutoPretetch = () => {
              useAutoPrefetch(${JSON.stringify(autoPrefetch)})
              return null;
            };
          `
        : ''

      const wrapper = `
        import 'preact/compat';
        import { h } from 'preact';
        import { useMeta, useTitle } from 'hoofd/preact';
        import { Layout, siteData } from 'wilson/virtual';
        import { Page } from '${pageSource.path}';
        ${nestedLayoutImport}
        ${autoPrefetchDefinition}

        export default function PageWrapper() {
          const pageUrl = siteData.siteUrl + '${page.route}';
          const title = '${page.title}';

          useMeta({ property: 'og:url', content: pageUrl });
          useMeta({ property: 'og:image', content: pageUrl + 'og-image.jpg' });
          useMeta({ property: 'og:image:secure_url', content: pageUrl + 'og-image.jpg' });
          useMeta({ property: 'og:title', content: title });
          useMeta({ property: 'og:type', content: '${
            pageSource.frontmatter.opengraphType
          }' });
          useMeta({ property: 'twitter:title', content: title });
          useTitle(title);

          return <Layout ${componentProps}>
            <NestedLayoutOrFragment ${componentProps}>
              ${autoPrefetchUse}
              <Page
                ${componentProps}
                ${
                  page instanceof TaxonomyPage || page instanceof SelectPage
                    ? `contentPages={${JSON.stringify(page.contentPages)}}
                      pagination={${JSON.stringify({
                        ...page.pagination,
                        ...page.paginationRoutes,
                      })}}`
                    : ''
                }
                ${
                  page instanceof TaxonomyPage
                    ? `selectedTerm="${page.selectedTerm}"`
                    : ''
                }
                ${
                  page instanceof TermsPage
                    ? `taxonomyTerms={${JSON.stringify(page.taxonomyTerms)}}`
                    : ''
                }
              />
            </NestedLayoutOrFragment>
          </Layout>;
        }
      `

      return {
        code: transformJsx(wrapper),
      }
    },
  }
}

export default pagesPlugin
