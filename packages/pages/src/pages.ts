import type { Plugin } from 'vite'
import type { SiteConfig } from '@wilson/types'
import { createApi, findPage } from './api'
import { handleHMR } from './hmr'
import {
  DATA_MODULE_ID,
  RESOLVED_DATA_MODULE_ID,
  RESOLVED_ROUTES_MODULE_ID,
  ROUTES_MODULE_ID,
} from './types'
import { generateDataModule, generateRoutesModule } from './virtual'

export {
  findPage,
  getPages,
  getPageByAbsolutePath,
  getPageByImportPath,
} from './api'

// TODO allow dynamic params inside a path segment, e.g. src/pages/blog/page-[pageNo]
// might need to switch to preact-iso router for this, preact-router doesn't seem to
// support it
export default function PagesPlugin(config: SiteConfig): Plugin {
  let api = createApi(config)
  let generatedRoutesModule: string | undefined
  let generatedDataModule: string | undefined

  return {
    name: 'wilson:pages',
    enforce: 'pre',
    get api() {
      return { findPage, ...api }
    },
    async configureServer(server) {
      this.handleHotUpdate = handleHMR(api, server, config, () => {
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
        return (generatedRoutesModule ||= await generateRoutesModule(config))
      if (id === RESOLVED_DATA_MODULE_ID)
        return (generatedDataModule ||= await generateDataModule(
          config.extendRoutes,
        ))
    },
  }
}
