import type { PluginOption, ResolvedConfig } from 'vite'
import type { PagesApi, Options } from './types'
import { createApi } from './api'
import { handleHMR } from './hmr'
import {
  ROUTES_MODULE_ID,
  RESOLVED_ROUTES_MODULE_ID,
  DATA_MODULE_ID,
  RESOLVED_DATA_MODULE_ID,
} from './types'

export * from './types'
export { getPages } from './api'
export type { DynamicPageProps, RenderedPathInfo } from './types'

// TODO: show 404 in development for dynamic routes where the
// parameters are not in getRenderedPaths return values
// TODO: better typescript typing for page props
// TODO: enable production builds
export default function WilsonPages({
  extendRoutes,
  pageExtensions,
  pagesDir,
  srcDir,
}: Pick<Options, 'extendRoutes' | 'pageExtensions' | 'pagesDir' | 'srcDir'>): PluginOption {
  let api: PagesApi
  let options: Options
  let generatedRoutesModule: string | undefined
  let generatedDataModule: string | undefined

  return {
    name: 'wilson:pages',
    enforce: 'pre',
    configResolved(config: ResolvedConfig) {
      options = {
        root: config.root,
        srcDir,
        pagesDir,
        pageExtensions,
        extendRoutes,
      }
      api ||= createApi(options)
    },
    async configureServer(server) {
      options.server = server
      handleHMR(api, server, () => (generatedRoutesModule = undefined))
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
        return (generatedRoutesModule ||= await api.generateRoutesModule(id))
      if (id === RESOLVED_DATA_MODULE_ID)
        return (generatedDataModule ||= await api.generateDataModule(id))
    },
    // async transform(_code, id) {
    //   if (id.includes('vue&type=page')) return 'export default {};'
    // },
  }
}
