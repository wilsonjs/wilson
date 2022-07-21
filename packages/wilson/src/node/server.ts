import type { ServerOptions, UserConfig as ViteUserConfig } from 'vite'
import { createServer as createViteServer, mergeConfig } from 'vite'
import { resolveConfig } from './config'
import wilsonPlugins from './plugin'
// import { initializePages } from "./pages";

export async function createServer(
  root: string = process.cwd(),
  serverOptions: ServerOptions = {},
) {
  const siteConfig = await resolveConfig(root)

  const viteConfig = mergeConfig(siteConfig.vite, {
    plugins: wilsonPlugins(siteConfig),
    server: serverOptions,
  } as ViteUserConfig)

  return {
    siteConfig,
    viteConfig,
    server: await createViteServer(viteConfig),
  }
}
