import type { Plugin } from 'vite'
import type { SiteConfig } from '@wilson/types'
import type { Options, PagesApi } from './types'
import { createApi } from './api'
import { handleHMR } from './hmr'
import {
  DATA_MODULE_ID,
  RESOLVED_DATA_MODULE_ID,
  RESOLVED_ROUTES_MODULE_ID,
  ROUTES_MODULE_ID,
} from './types'
import { generateDataModule, generateRoutesModule } from './virtual'

export { getPages, getPageByAbsolutePath, getPageByImportPath } from './api'

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
        return (generatedRoutesModule ||= await generateRoutesModule(
          options.extendRoutes,
        ))
      if (id === RESOLVED_DATA_MODULE_ID)
        return (generatedDataModule ||= await generateDataModule(
          options.extendRoutes,
        ))
    },
    // async transform(_code, id) {
    //   if (id.includes('vue&type=page')) return 'export default {};'
    // },
  }
}
