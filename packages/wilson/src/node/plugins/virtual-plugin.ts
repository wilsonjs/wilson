import { Plugin } from 'vite'
import { LoadResult, ResolveIdResult } from 'rollup'
import { toRoot, transformJsx } from '../util.js'
import { getConfig } from '../config.js'
import { getPageSources } from '../state.js'
import { PageType, SelectPage, TaxonomyPage } from '../page.js'
import { dirname, relative } from 'path'
import { Language } from '../../types.js'

const virtualExportsPath = 'wilson/virtual'
const clientEntryPath = '/@wilson/client.js'
const pageEntryPath = (pageSourceIndex: number, pageIndex: number) =>
  `@wilson/page-source/${pageSourceIndex}/page/${pageIndex}`

/**
 * Provides virtual modules.
 */
const virtualPlugin = async (): Promise<Plugin> => {
  return {
    name: 'wilson-plugin-virtual',
    enforce: 'pre',

    resolveId(id: string): ResolveIdResult {
      if (id === virtualExportsPath || id === clientEntryPath) {
        return id
      }
    },

    /**
     * Provide virtual module content.
     */
    async load(id: string): Promise<LoadResult> {
      if (id === clientEntryPath) {
        return `import "wilson/dist/client/main.js";`
      }

      if (id === virtualExportsPath) {
        const pageSources = getPageSources()
        const {
          siteData,
          languages,
          layouts: { pageLayout },
          importMode,
        } = getConfig()

        const layoutImport = pageLayout
          ? `import Layout from '${relative(
              dirname(id),
              toRoot(`./src/layouts/${pageLayout}`)
            ).replace(/\\/g, '/')}';`
          : `import { Fragment as Layout } from 'preact';`

        const lazyPageImports = pageSources
          .map((pageSource, i) =>
            pageSource.pages.map((page: PageType, j: number) => {
              const path = pageEntryPath(i, j)
              const mode =
                typeof importMode === 'function'
                  ? importMode(
                      pageSource.relativePath,
                      page instanceof SelectPage || page instanceof TaxonomyPage
                        ? page.pagination.currentPage
                        : 1
                    )
                  : importMode
              if (mode === 'sync') {
                return `import PageSource${i}Page${j} from '${path}';`
              }
              return `const PageSource${i}Page${j} = lazy(() => import('${path}'));`
            })
          )
          .flat()
          .join('\n')

        const routes = pageSources
          .map((pageSource, i) =>
            pageSource.pages.map(
              (page: PageType, j: number) =>
                `<PageSource${i}Page${j} path="${page.route}" />`
            )
          )
          .flat()
          .join(',')

        const pageData = pageSources
          .map((pageSource) =>
            pageSource.pages.map((page) => ({
              route: page.route,
              language: pageSource.language,
            }))
          )
          .flat()

        const code = `
          import { h, createContext } from 'preact';
          import { useContext } from 'preact/hooks';
          import { lazy } from 'preact-iso';
          ${layoutImport}

          ${lazyPageImports}

          const routes = [${routes}];
          const siteData = ${JSON.stringify(siteData)};
          const pageData = ${JSON.stringify(pageData)};
          const languages = ${JSON.stringify(languages)};
          const LanguageContext = createContext(null);
          const LanguageProvider = LanguageContext.Provider
          const useCurrentLanguageCode = () => useContext(LanguageContext);
          const useAllLanguages = () => ${JSON.stringify(
            languages.map((language) => ({
              code: language.code,
              name: language.name,
            }))
          )};
          const useTranslation = (identifier) => {
            const currentLanguageCode = useCurrentLanguageCode();
            const currentLanguage = languages.find((language) => language.code === (currentLanguageCode ?? siteData.lang));
            return currentLanguage.translations[identifier];
          };

          export { routes, siteData, Layout, LanguageProvider, useCurrentLanguageCode, useAllLanguages, useTranslation, pageData };
        `

        return transformJsx(code)
      }
    },
  }
}

export default virtualPlugin
