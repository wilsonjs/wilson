import type { ModuleGraph, Plugin, ViteDevServer } from 'vite'
import { debug, slash } from './utils'
import type { PagesApi } from './types'
import { RESOLVED_DATA_MODULE_ID, RESOLVED_ROUTES_MODULE_ID } from './types'
import { Awaitable, SiteConfig } from '@wilson/types'

type ClearRoutesFn = () => void

export function handleHMR(
  api: PagesApi,
  server: ViteDevServer,
  config: SiteConfig,
  clearRoutes: ClearRoutesFn,
): Plugin['handleHotUpdate'] {
  onPage('add', async (path) => {
    const page = await api.addPage(path)
    debug.hmr('add %s %O', path, page)
    return true
  })

  onPage('unlink', (path) => {
    api.removePage(path)
    debug.hmr('remove', path)
    return true
  })

  return async ({ file }) => {
    const path = slash(file)
    if (api.isPage(path)) {
      const { changed, needsReload } = await api.updatePage(path)

      const dependents: string[] =
        config.namedPlugins.documents.api.getDependents(file)
      for (const dependent of dependents) {
        await api.updatePage(dependent)
      }

      if (changed) debug.hmr('change', path)
      if (needsReload) fullReload(server, clearRoutes)
    }
  }

  function onPage(
    eventName: string,
    handler: (path: string) => Awaitable<void | boolean>,
  ) {
    server.watcher.on(eventName, async (path) => {
      path = slash(path)
      if (api.isPage(path) && (await handler(path)))
        fullReload(server, clearRoutes)
    })
  }
}

function fullReload(server: ViteDevServer, clearRoutes: ClearRoutesFn) {
  invalidateVirtualModules(server)
  clearRoutes()
  debug.hmr('full reload')
  server.ws.send({ type: 'full-reload' })
}

function invalidateModule(id: string, moduleGraph: ModuleGraph): void {
  const module = moduleGraph.getModuleById(id)
  if (module) moduleGraph.invalidateModule(module)
}

function invalidateVirtualModules({ moduleGraph }: ViteDevServer) {
  invalidateModule(RESOLVED_ROUTES_MODULE_ID, moduleGraph)
  invalidateModule(RESOLVED_DATA_MODULE_ID, moduleGraph)
}
