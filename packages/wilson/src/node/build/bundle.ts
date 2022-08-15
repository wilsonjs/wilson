import { fileURLToPath } from 'url'
import type { SiteConfig } from '@wilson/types'
import { basename, dirname, join, relative, resolve } from 'pathe'
import type { UserConfig as ViteUserConfig } from 'vite'
import { build, mergeConfig } from 'vite'
import type { OutputOptions, RollupOutput } from 'rollup'
import wilsonPlugins from '../plugin'
import glob from 'fast-glob'
import { isDynamicPagePath } from '@wilson/utils'

const _dirname = dirname(fileURLToPath(import.meta.url))
export const DIST_CLIENT_PATH = join(_dirname, '../client')
export const CLIENT_APP_PATH = join(DIST_CLIENT_PATH, 'app.client.js')
export const SERVER_APP_PATH = join(DIST_CLIENT_PATH, 'app.server.js')

type Entrypoints = Record<string, string>

function resolveEntrypoints(ssr: boolean): Entrypoints {
  return { app: ssr ? SERVER_APP_PATH : CLIENT_APP_PATH }
}

export async function bundle(config: SiteConfig) {
  const clientResult = await bundleWithVite(config, {
    ssr: false,
    outDir: config.outDir,
  })
  const serverResult = await bundleWithVite(config, {
    ssr: true,
    outDir: config.tempDir,
  })
  await bundleDynamicPages(config)
  return { clientResult, serverResult }
}

/**
 * Replaces opening bracket on start of given string and
 * closing bracket on end of given string with underscores.
 */
function replaceBrackets(string: string): string {
  return string.replace(/^\[/, '_').replace(/\]$/, '_')
}

/**
 * Returns output filename for vite build of the given page path.
 * @param absolutePath Absolute path of the page
 * @param pagesDir Path to the pages directory
 * @returns Output filename
 */
export function getOutputFilename(
  absolutePath: string,
  pagesDir: string,
): string {
  const relativePath = absolutePath.replace(new RegExp(`^${pagesDir}`), '')
  const dirName = dirname(relativePath).replace(/^\//, '') || '.'
  const directoryPart = dirName === '.' ? '' : `${replaceBrackets(dirName)}/`
  const baseName = basename(absolutePath)
  const filenamePart = replaceBrackets(
    baseName.slice(0, baseName.lastIndexOf('.')),
  )
  return `${directoryPart}${filenamePart}.js`
}

async function bundleDynamicPages(config: SiteConfig) {
  const entrypoints = await (await glob(join(config.pagesDir, '**/*.tsx')))
    .map((file) => relative(config.root, file))
    .filter((file) => isDynamicPagePath(file))

  if (entrypoints.length > 0)
    await bundleWithVite(config, {
      ssr: true,
      outDir: `${config.tempDir}/pages`,
      entrypoints,
      output: {
        entryFileNames: ({ facadeModuleId }) => {
          return getOutputFilename(facadeModuleId!, config.pagesDir)
        },
      },
    })
}

async function bundleWithVite(
  config: SiteConfig,
  options: {
    ssr: boolean
    outDir: string
    entrypoints?: string[]
    output?: OutputOptions
  },
) {
  const { ssr, entrypoints, outDir, output } = options
  const input = entrypoints ?? resolveEntrypoints(options.ssr)

  const viteConfig = mergeConfig(config.vite, {
    logLevel: config.vite.logLevel ?? 'warn',
    ssr: {
      external: ssr
        ? []
        : ['preact', 'preact-render-to-string', 'wouter-react'],
      noExternal: ['wilson'],
    },
    clearScreen: false,
    plugins: wilsonPlugins(config, ssr),
    build: {
      ssr,
      manifest: !ssr,
      ssrManifest: !ssr,
      minify: ssr ? false : 'esbuild',
      emptyOutDir: false,
      outDir,
      sourcemap: false,
      target: 'esnext',
      rollupOptions: {
        input,
        output,
        preserveEntrySignatures: 'allow-extension',
      },
    },
  } as ViteUserConfig)

  return (await build(viteConfig)) as RollupOutput
}
