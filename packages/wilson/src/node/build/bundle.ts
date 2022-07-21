import { fileURLToPath } from 'url'
import type { SiteConfig } from '@wilson/types'
import { dirname, join, resolve } from 'pathe'
import glob from 'fast-glob'
import type { UserConfig as ViteUserConfig } from 'vite'
import { build, mergeConfig } from 'vite'
import type { RollupOutput } from 'rollup'
import wilsonPlugins from '../plugin'

const _dirname = dirname(fileURLToPath(import.meta.url))
export const DIST_CLIENT_PATH = join(_dirname, '../client')
export const CLIENT_APP_PATH = join(DIST_CLIENT_PATH, 'app.client.js')
export const SERVER_APP_PATH = join(DIST_CLIENT_PATH, 'app.server.js')

// Internal: Currently SSG supports a single stylesheet for all pages.
function resolveEntrypoints(ssr: boolean): Entrypoints {
  return { app: ssr ? SERVER_APP_PATH : CLIENT_APP_PATH }
}

type Entrypoints = Record<string, string>

export async function bundle(siteConfig: SiteConfig) {
  const clientResult = await bundleWithVite(siteConfig, { ssr: false })
  const serverResult = await bundleWithVite(siteConfig, { ssr: true })
  await bundleHtmlEntrypoints(siteConfig)
  return { clientResult, serverResult }
}

async function bundleHtmlEntrypoints(siteConfig: SiteConfig) {
  const entrypoints = glob.sync(resolve(siteConfig.pagesDir, './**/*.html'), {
    cwd: siteConfig.root,
    ignore: ['node_modules/**'],
  })

  if (entrypoints.length > 0) {
    await bundleWithVite(siteConfig, {
      htmlBuild: true,
      ssr: false,
    })
  }
}

async function bundleWithVite(
  siteConfig: SiteConfig,
  options: { ssr: boolean; htmlBuild?: boolean },
) {
  const entrypoints = resolveEntrypoints(options.ssr)
  const { htmlBuild = false, ssr } = options

  const config = mergeConfig(siteConfig.vite, {
    logLevel: 'warn',
    ssr: {
      external: ['vue', '@vue/server-renderer'],
      noExternal: ['wilson'],
    },
    plugins: wilsonPlugins(siteConfig),
    build: {
      ssr,
      cssCodeSplit: htmlBuild,
      manifest: !ssr,
      ssrManifest: !ssr,
      minify: ssr ? false : 'esbuild',
      emptyOutDir: ssr,
      outDir: ssr ? siteConfig.tempDir : siteConfig.outDir,
      sourcemap: false,
      rollupOptions: {
        input: entrypoints,
        preserveEntrySignatures: htmlBuild ? undefined : 'allow-extension',
        treeshake: htmlBuild,
      },
    },
  } as ViteUserConfig)

  return (await build(config)) as RollupOutput
}
