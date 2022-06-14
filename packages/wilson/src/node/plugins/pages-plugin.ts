import { Plugin } from 'vite'
import { TransformResult, LoadResult, ResolveIdResult } from 'rollup'
import { dirname, relative } from 'path'
import { toRoot, transformJsx } from '../util.js'
import minimatch from 'minimatch'
import { getConfig } from '../config.js'
import {
  ContentPage,
  PageType,
  SelectPage,
  TaxonomyPage,
  TermsPage,
} from '../page.js'
import { getPageSources } from '../state.js'
import { MarkdownPageSource } from '../page-source.js'

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

      const translationPageSources = pageSource.frontmatter.langRef
        ? pageSources.filter(
            (s) =>
              typeof pageSource.frontmatter.langRef === 'string' &&
              s.frontmatter.langRef === pageSource.frontmatter.langRef
          )
        : []

      const {
        performance: { autoPrefetch },
        layouts: { nestedLayouts },
        siteData: { lang },
        languages,
      } = getConfig()

      const pageLang = page.frontmatter.lang ?? lang
      const translationPages = translationPageSources
        .map((s) => (s.pages.length === 1 ? s.pages[0] : s.pages[pageIndex]))
        .sort(
          (a, b) =>
            languages.findIndex((l) => l.lang === a.frontmatter.lang ?? lang) -
            languages.findIndex((l) => l.lang === b.frontmatter.lang ?? lang)
        )
      const translations = translationPages
        .map((p) => {
          const siteConfigLanguage = (languages ?? []).find(
            (l) => l.lang === p.frontmatter.lang
          )
          if (!siteConfigLanguage) return null
          return {
            title: siteConfigLanguage.label,
            url: p.route,
            isActive: p.frontmatter.lang === pageLang,
          }
        })
        .filter(Boolean)

      if (page === undefined) {
        throw new Error('kaput!')
      }

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
