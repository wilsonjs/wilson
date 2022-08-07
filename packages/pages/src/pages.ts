import type { Plugin, PluginOption, ViteDevServer } from 'vite'
import type { SiteConfig } from '@wilson/types'
import type { Options, PagesApi } from './types'
import { createApi, findPage } from './api'
import { handleHMR } from './hmr'
import {
  DATA_MODULE_ID,
  RESOLVED_DATA_MODULE_ID,
  RESOLVED_ROUTES_MODULE_ID,
  ROUTES_MODULE_ID,
} from './types'
import { generateDataModule, generateRoutesModule } from './virtual'
import { join, relative, resolve } from 'pathe'
import glob from 'fast-glob'
import micromatch from 'micromatch'

export {
  findPage,
  getPages,
  getPageByAbsolutePath,
  getPageByImportPath,
} from './api'

// TODO: allow dynamic params inside a path segment, e.g. src/pages/blog/page-[pageNo]
// might need to switch to preact-iso router for this, preact-router doesn't seem to
// support it
export default function WilsonPages(siteConfig: SiteConfig): Plugin {
  let api: PagesApi
  let options: Options
  let generatedRoutesModule: string | undefined
  let generatedDataModule: string | undefined

  return {
    name: 'wilson:pages',
    enforce: 'pre',
    configResolved() {
      options = siteConfig
      api ||= createApi(options)
      // @ts-ignore
      siteConfig.pagesApi = api
    },
    async configureServer(server) {
      options.server = server
      this.handleHotUpdate = handleHMR(api, server, () => {
        generatedDataModule = undefined
        generatedRoutesModule = undefined
      })
    },
    async buildStart() {
      await api.addAllPages()
    },
    async resolveId(id) {
      if (id === ROUTES_MODULE_ID) return RESOLVED_ROUTES_MODULE_ID
      if (id === DATA_MODULE_ID) return RESOLVED_DATA_MODULE_ID
    },
    async load(id) {
      if (id === RESOLVED_ROUTES_MODULE_ID)
        return (generatedRoutesModule ||= await generateRoutesModule(options))
      if (id === RESOLVED_DATA_MODULE_ID)
        return (generatedDataModule ||= await generateDataModule(
          options.extendRoutes,
        ))
    },
  }
}

// TODO: extract to own package?
// TODO: is this also required as plugin in packages/wilson?
interface DocumentModule {
  pattern: string
  hasDocument: (path: string) => boolean
}
function parseQueryParams(url: string) {
  const index = url.indexOf('?')
  if (index < 0) return { path: url, query: {} }
  const query = Object.fromEntries(new URLSearchParams(url.slice(index)))
  return { path: url.slice(0, index), query }
}
const fileCanUseDocuments = /(\.tsx)$/
const definitionRegex = /(function|const|let|var)[\s\n]+\bgetPages\b/
const usageRegex = /\bgetPages[\s\n]*\(([^)]*)\)/g
const PAGES_MODULE_ID = 'virtual:wilson-pages'
export function documents(config: SiteConfig): PluginOption {
  let server: ViteDevServer
  const modulesById: Record<string, DocumentModule> = Object.create(null)
  return {
    name: 'wilson:pages',
    configureServer(devServer) {
      server = devServer
    },
    resolveId(id) {
      if (id.startsWith(PAGES_MODULE_ID)) return id
    },
    async load(id) {
      if (!id.startsWith(PAGES_MODULE_ID)) return

      const rawPath = parseQueryParams(id).query.pattern
      const path = relative(config.root, join('src', 'pages', rawPath))
      const pattern = path.includes('*') ? path : `${path}/**/*.{md,mdx}`

      // allow vite to automatically detect added or removed files.
      if (server) {
        modulesById[id] = {
          pattern,
          hasDocument: (path) => micromatch.isMatch(path, pattern),
        }
      }

      const files = await glob(pattern, { cwd: config.root })
      const pages = files.map(
        (file) => findPage((page) => page.rootPath === file)!,
      )

      return /* js */ `
        export default ${JSON.stringify(pages)}
      `
    },
    async transform(code, id) {
      // ensure vite keeps track of files with the documents pattern that are added or removed.
      if (server && id.startsWith(PAGES_MODULE_ID)) {
        ;(server as any)._importGlobMap.set(id, [
          resolve(config.root, modulesById[id].pattern),
        ])
        return
      }
      // replace each usage of useDocuments with an import of a virtual module.
      if (fileCanUseDocuments.test(id) && !definitionRegex.test(code)) {
        const paths: [string, string][] = []
        code = code.replace(usageRegex, (_, path) => {
          path = path.trim().slice(1, -1)
          const id = `_documents_${paths.length}`
          paths.push([id, path])
          return id
        })
        if (paths.length) {
          const imports = paths.map(
            ([id, path]) =>
              `import ${id} from '${PAGES_MODULE_ID}?pattern=${path}'`,
          )
          return `${imports.join(';')};${code}`
        }
      }
    },
  }
}
