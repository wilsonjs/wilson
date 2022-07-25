import type { ServerOptions, UserConfig as ViteUserConfig } from 'vite'
import { mergeConfig, preview as vitePreview } from 'vite'
import { resolveConfig } from './config'
import wilsonPlugins from './plugin'

export async function preview(
  root: string = process.cwd(),
  serverOptions: ServerOptions = {},
) {
  const siteConfig = await resolveConfig(root)
  const viteConfig = mergeConfig(siteConfig.vite, {
    plugins: wilsonPlugins(siteConfig),
    preview: serverOptions,
  } as ViteUserConfig)

  const server = await vitePreview(viteConfig)
  server.printUrls()
}
