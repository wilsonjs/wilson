import { SiteConfig } from '@wilson/config'
import { getPages } from '@wilson/pages'
import type { Page } from '@wilson/pages'
import { existsSync } from 'fs'
import { join } from 'pathe'
import { withSpinner } from '../utils'
import { RollupOutput } from 'rollup'
import type { bundle } from './bundle'
import type { RenderToStringFn } from '../../client/app.server'

type RenderedPage = Page & { rendered: string }

export async function renderPages(
  config: SiteConfig,
  { clientResult }: Awaited<ReturnType<typeof bundle>>
): Promise<{ renderedPages: RenderedPage[] }> {
  const appPath = ['js', 'mjs', 'cjs']
    .map((ext) => join(config.tempDir, `app.${ext}`))
    .find(existsSync)

  if (!appPath) throw new Error(`Could not find the SSR build for the app in ${config.tempDir}`)

  const rendertoString: RenderToStringFn = (await import(appPath)).default
  const pages = await getPages()
  const clientChunks = clientResult.output

  const renderedPages: RenderedPage[] = []
  // TODO: render multiple urls for dynamic pages
  await withSpinner('rendering pages', async () => {
    for (const page of pages) {
      for (const instance of page.instances) {
        const renderedPage: RenderedPage = {
          ...page,
          rendered: await renderPage(config, clientChunks, instance, rendertoString),
        }
        renderedPages.push(renderedPage)
      }
    }
  })

  return { renderedPages }
}

export async function renderPage(
  config: SiteConfig,
  clientChunks: RollupOutput['output'],
  instance: Page['instances'][0],
  rendertoString: RenderToStringFn
) {
  const { html } = await rendertoString(instance.url)
  return `<!DOCTYPE html>
<html>
  <head>
    ${stylesheetTagsFrom(config, clientChunks)}
  </head>
  <body>
    <div id="app">${html}</div>
  </body>
</html>`

  //   // Remove comments from Vue renderer to allow plain text, RSS, or JSON output.
  //   content = content.replace(commentsRegex, "");
  //   // Skip HTML shell to allow Vue to render plain text, RSS, or JSON output.
  //   if (!route.outputFilename.endsWith(".html")) return content;
  //   const { headTags, htmlAttrs, bodyAttrs } = renderHeadToString(head);
  //   return `<!DOCTYPE html>
  //   <html ${htmlAttrs}>
  //     <head>
  //       ${headTags}
  //       ${stylesheetTagsFrom(config, clientChunks)}
  //       ${await scriptTagsFrom(config, islandsByPath[route.path])}
  //     </head>
  //     <body ${bodyAttrs}>
  //       <div id="app">${content}</div>
  //     </body>
  //   </html>`;
}

function stylesheetTagsFrom(config: SiteConfig, clientChunks: RollupOutput['output']) {
  return clientChunks
    .filter((chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css'))
    .map((chunk) => `<link rel="stylesheet" href="${config.base}${chunk.fileName}">`)
    .join('\n')
}
