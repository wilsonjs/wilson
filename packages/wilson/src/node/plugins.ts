import preact from '@preact/preset-vite'
import type { SiteConfig } from '@wilson/types'
import debug from 'debug'
import { relative } from 'pathe'
import pc from 'picocolors'
import type { Plugin, PluginOption, ViteDevServer } from 'vite'
import inspect from 'vite-plugin-inspect'
import { configureMiddleware, createServer } from './server'
import markdownPagesPlugin from '@wilson/plugin-markdown-pages'
import typescriptPagesPlugin from '@wilson/plugin-typescript-pages'
import type { LoadResult } from 'rollup'
import { promises as fs } from 'fs'

/**
 * Watches wilson config and restarts dev server when it changes.
 * @param siteConfig Site configuration
 * @returns Plugin
 */
function devConfigWatch(siteConfig: SiteConfig): Plugin {
  async function handleChange(server: ViteDevServer, path: string) {
    if (path !== siteConfig.configPath) return
    restartServer(server)
  }

  async function restartServer(existingServer: ViteDevServer) {
    const { logger, root, server: serverOptions } = existingServer.config
    const configPath = relative(process.cwd(), siteConfig.configPath)
    logger.info(pc.green(`${configPath} changed, restarting server...`), {
      timestamp: true,
    })
    await existingServer.close()
    // @ts-expect-error __vite_start_time is not available on global type
    global.__vite_start_time = performance.now()
    const { server: newServer } = await createServer(root, serverOptions)
    await newServer.listen()
  }

  return {
    name: 'wilson:dev-config-watch',
    apply: 'serve',
    configureServer: (server) => {
      server.watcher.add(siteConfig.configPath)
      server.watcher.on('add', handleChange.bind(null, server))
      server.watcher.on('change', handleChange.bind(null, server))
    },
  }
}

/**
 * Provides the client entrypoint as a virtual module.
 * @returns Plugin
 */
function virtualClientEntrypoint(): Plugin {
  const VIRTUAL_MODULE_ID = '/@virtual:wilson-client'
  const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

  return {
    name: 'wilson:virtual-client-entrypoint',
    async resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },
    async load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID)
        return 'import "wilson/dist/client/app.client.js";'
    },
  }
}

/**
 * Configures an HTML fallback middleware for vite's dev server.
 *
 * @param siteConfig Site configuration
 * @returns Plugin
 */
function htmlFallback(config: SiteConfig): Plugin {
  let server

  return {
    name: 'wilson:html-fallback',
    apply: 'serve',
    configureServer(devServer) {
      server = devServer
      return configureMiddleware(config, server)
    },
  }
}

import { transform as transformSVG } from '@svgr/core'
import { transform } from 'sucrase'
export const transformJsx = (code: string): string => {
  return transform(code, {
    transforms: ['jsx', 'typescript'],
    production: true,
    jsxPragma: 'h',
    jsxFragmentPragma: 'Fragment',
  }).code
}
const svgCache = new Map()
function svg(): Plugin {
  return {
    name: 'wilson-plugin-svg',
    enforce: 'pre',

    async load(id): Promise<LoadResult> {
      if (!id.match(/\.svg\?component$/)) return

      id = id.replace(/\?component$/, '')
      let result = svgCache.get(id)

      if (!result) {
        const buffer = await fs.readFile(id)
        const jsx = await transformSVG(buffer.toString())
        result = `import { h } from 'preact';\n${transformJsx(jsx)}`
        svgCache.set(id, result)
      }

      return result
    },
  }
}

/**
 *
 * @param config Site's configuration
 * @returns Array of vite plugins used for wilson.
 */
export default function wilsonPlugins(
  config: SiteConfig,
  ssr: boolean = false,
): PluginOption[] {
  debug('wilson:config')(config)

  return [
    markdownPagesPlugin(config),
    typescriptPagesPlugin(config),
    preact({
      include: [/\.[tj]sx?$/, /\.md$/],
      devtoolsInProd: true,
      babel: {
        plugins: ssr
          ? [
              // adds __source to VNode
              '@babel/plugin-transform-react-jsx-development',
              // removes __source from every VNode that is not on a page or
              // that has no partial hydration props like `clientLoad` or where
              // the VNode is not imported as a default import from the islands
              // directory. adds islandPath that is used in app.server.tsx to
              // __source for every VNode in a page that has partial hydration
              // props and is imported as default import from islands directory.
              ['@wilson/island-path', config],
            ]
          : [],
      },
    }),
    htmlFallback(config),
    devConfigWatch(config),
    inspect(),
    virtualClientEntrypoint(),
    svg(),
  ].filter(Boolean)
}
