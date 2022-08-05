import preact from '@preact/preset-vite'
import type { SiteConfig } from '@wilson/types'
import pages from '@wilson/pages'
import debug from 'debug'
import { relative } from 'pathe'
import pc from 'picocolors'
import type { PluginOption, ViteDevServer } from 'vite'
import inspect from 'vite-plugin-inspect'
import { configureMiddleware, createServer } from './server'

/**
 * Watches wilson config and restarts dev server when it changes.
 * @param siteConfig Site configuration
 * @returns Plugin
 */
function devConfigWatch(siteConfig: SiteConfig): PluginOption {
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
function virtualClientEntrypoint(): PluginOption {
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
 * @param siteConfig Site configuration
 * @returns Plugin
 */
function htmlFallback(config: SiteConfig): PluginOption {
  let server

  return {
    name: 'wilson:html-fallback',
    configureServer(devServer) {
      server = devServer
      return configureMiddleware(config, server)
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
    preact({
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
              [
                '@wilson',
                {
                  islandsDir: config.islandsDir,
                  layoutsDir: config.layoutsDir,
                  pagesDir: config.pagesDir,
                },
              ],
            ]
          : [],
      },
    }),
    pages(config),
    config.mode === 'development' && inspect(),
    config.mode === 'development' && htmlFallback(config),
    config.mode === 'development' && devConfigWatch(config),
    virtualClientEntrypoint(),
  ].filter(Boolean)
}
