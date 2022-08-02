/* eslint-disable no-restricted-syntax */
import { build as viteBuild, mergeConfig as mergeViteConfig } from 'vite'
import type { UserConfig as ViteUserConfig, Plugin } from 'vite'
import type { SiteConfig } from '@wilson/types'
import { extendManualChunks } from './chunks'
import wilsonPlugins from '../plugin'
import { IslandsByPath } from 'src/client/app.server'

export const VIRTUAL_PREFIX = 'wilson_island_'

export async function bundleIslands(
  config: SiteConfig,
  islandsByPath: IslandsByPath,
) {
  const entrypoints = Object.create(null)
  const islandComponents = Object.create(null)

  for (const path in islandsByPath) {
    islandsByPath[path].forEach((island) => {
      island.entryFilename = `${path.replace(/\//g, '_')}_${island.id}`
      entrypoints[island.entryFilename] = island.hydrationScript
      islandComponents[island.componentPath] = island.componentPath
    })
  }

  const entryFiles = [
    ...Object.keys(entrypoints),
    ...Object.keys(islandComponents),
  ].sort()

  if (Object.keys(entryFiles).length === 0) return

  const chunkFileNames = 'assets/[name].[hash].js'
  await viteBuild(
    mergeViteConfig(config.vite, {
      logLevel: config.vite.logLevel ?? 'warn',
      publicDir: false,
      build: {
        emptyOutDir: false,
        outDir: config.outDir,
        manifest: true,
        minify: 'esbuild',
        rollupOptions: {
          input: entryFiles,
          output: {
            entryFileNames: chunkFileNames,
            chunkFileNames,
            manualChunks: extendManualChunks(config),
          },
        },
      },
      plugins: [
        virtualEntrypointsPlugin(config.root, entrypoints),
        wilsonPlugins(config, true),
      ],
    } as ViteUserConfig),
  )
}

function virtualEntrypointsPlugin(
  root: string,
  entrypoints: Record<string, string>,
): Plugin {
  return {
    name: 'wilson:entrypoints',
    resolveId(id) {
      if (id in entrypoints) return VIRTUAL_PREFIX + id
    },
    async load(id) {
      if (id.startsWith(VIRTUAL_PREFIX))
        return entrypoints[id.slice(VIRTUAL_PREFIX.length)]
    },
  }
}
