import { ModuleNode, ViteDevServer } from 'vite'
import { debug, slash } from './utils'
import { Awaitable, ROUTES_MODULE_ID, PagesApi } from './types'

export function handleHMR(api: PagesApi, server: ViteDevServer, clearRoutes: () => void) {
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

  onPage('change', async (path) => {
    const { changed, needsReload } = await api.updatePage(path)
    if (changed) {
      invalidatePageFiles(path, server)
      debug.hmr('change', path)
      return needsReload
    }
  })

  function onPage(eventName: string, handler: (path: string) => Awaitable<void | boolean>) {
    server.watcher.on(eventName, async (path) => {
      path = slash(path)
      if (api.isPage(path) && (await handler(path))) fullReload()
    })
  }

  function fullReload() {
    invalidatePagesModule(server)
    clearRoutes()
    server.ws.send({ type: 'full-reload' })
  }
}

function invalidatePageFiles(path: string, { moduleGraph }: ViteDevServer) {
  moduleGraph.getModulesByFile(path)?.forEach((mod) => {
    moduleGraph.invalidateModule(mod)
  })
}

function invalidatePagesModule({ moduleGraph }: ViteDevServer) {
  const mod = moduleGraph.getModuleById(ROUTES_MODULE_ID)
  if (mod) moduleGraph.invalidateModule(mod)
}
