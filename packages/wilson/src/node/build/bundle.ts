import { fileURLToPath } from 'url'
import type { SiteConfig } from '@wilson/types'
import { dirname, join } from 'pathe'
import type { UserConfig as ViteUserConfig } from 'vite'
import { build, mergeConfig } from 'vite'
import type { RollupOutput } from 'rollup'
import wilsonPlugins from '../plugin'

const _dirname = dirname(fileURLToPath(import.meta.url))
export const DIST_CLIENT_PATH = join(_dirname, '../client')
export const CLIENT_APP_PATH = join(DIST_CLIENT_PATH, 'app.client.js')
export const SERVER_APP_PATH = join(DIST_CLIENT_PATH, 'app.server.js')

type Entrypoints = Record<string, string>

function resolveEntrypoints(ssr: boolean): Entrypoints {
  return { app: ssr ? SERVER_APP_PATH : CLIENT_APP_PATH }
}

export async function bundle(siteConfig: SiteConfig) {
  const clientResult = await bundleWithVite(siteConfig, { ssr: false })
  const serverResult = await bundleWithVite(siteConfig, { ssr: true })
  return { clientResult, serverResult }
}

async function bundleWithVite(
  siteConfig: SiteConfig,
  options: { ssr: boolean; htmlBuild?: boolean },
) {
  const entrypoints = resolveEntrypoints(options.ssr)
  const { htmlBuild = false, ssr } = options

  const config = mergeConfig(siteConfig.vite, {
    logLevel: siteConfig.vite.logLevel ?? 'warn',
    ssr: {
      external: ssr
        ? []
        : ['preact', 'preact-router', 'preact-render-to-string'],
      noExternal: ['wilson'],
    },
    plugins: wilsonPlugins(siteConfig, ssr),
    build: {
      ssr,
      cssCodeSplit: htmlBuild,
      manifest: !ssr,
      ssrManifest: !ssr,
      minify: ssr ? false : 'esbuild',
      emptyOutDir: false,
      outDir: ssr ? siteConfig.tempDir : siteConfig.outDir,
      sourcemap: false,
      target: 'esnext',
      rollupOptions: {
        input: entrypoints,
        preserveEntrySignatures: htmlBuild ? undefined : 'allow-extension',
        treeshake: htmlBuild,
      },
    },
  } as ViteUserConfig)

  return (await build(config)) as RollupOutput
}
