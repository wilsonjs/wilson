import type { ServerResponse } from 'http'
import type {
  Connect,
  ServerOptions,
  ViteDevServer,
  UserConfig as ViteUserConfig,
} from 'vite'
import { createServer as createViteServer, mergeConfig } from 'vite'
import { extname, resolve } from 'pathe'
import type { SiteConfig } from '@wilson/types'
import { resolveConfig } from './config'
import wilsonPlugins from './plugins'
import { fileExists } from './utils'

export async function createServer(
  root: string = process.cwd(),
  serverOptions: ServerOptions = {},
) {
  const config = await resolveConfig(root)

  const viteConfig = mergeConfig(config.vite, {
    plugins: wilsonPlugins(config),
    server: serverOptions,
  } as ViteUserConfig)

  return {
    server: await createViteServer(viteConfig),
  }
}

export function configureMiddleware(config: SiteConfig, server: ViteDevServer) {
  async function htmlFallbackMiddleware(
    req: Connect.IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction,
  ) {
    const url = req.url || ''
    if (url.startsWith('/@fs/')) return next()

    const filename = resolve(config.root, url.slice(1))
    if (await fileExists(filename)) return next()

    if (extname(url) === '.html') {
      res.statusCode = 200
      res.setHeader('content-type', 'text/html')
      let html = /* html */ `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta http-equiv="x-ua-compatible" content="ie=edge" />
            ${await config.getAdditionalHeadContent()}
          </head>
          <body>
            <div id="site"></div>
            <script type="module" src="/@virtual:wilson-client"></script>
          </body>
        </html>
      `
      html = await server.transformIndexHtml(url, html, req.originalUrl)
      res.end(html)
    } else {
      next()
    }
  }

  return () => {
    server.middlewares.use(htmlFallbackMiddleware)
  }
}
