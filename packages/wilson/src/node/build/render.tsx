import { existsSync } from 'fs'
import type { SiteConfig } from '@wilson/types'
import { join } from 'pathe'
import type { RollupOutput } from 'rollup'
import type { RenderToStringFn } from 'src/client/app.server'
import { withSpinner } from '../utils'
import type { bundle } from './bundle'
import type { PageToRender } from './pages'
import { getPagesToRender } from './pages'

export async function renderPages(
  config: SiteConfig,
  { clientResult }: Awaited<ReturnType<typeof bundle>>,
): Promise<PageToRender[]> {
  const appPath = ['js', 'mjs', 'cjs']
    .map((ext) => join(config.tempDir, `app.${ext}`))
    .find(existsSync)

  if (!appPath) throw new Error(`Could not find the SSR build for the app in ${config.tempDir}`)

  const rendertoString: RenderToStringFn = (await import(appPath)).default

  const pagesToRender = await withSpinner('resolving static paths', getPagesToRender)
  const clientChunks = clientResult.output

  await withSpinner('rendering pages', async () => {
    for (const page of pagesToRender)
      page.rendered = await renderPage(config, clientChunks, page, rendertoString)
  })

  return pagesToRender
}

export async function renderPage(
  config: SiteConfig,
  clientChunks: RollupOutput['output'],
  page: PageToRender,
  rendertoString: RenderToStringFn,
) {
  const { html } = await rendertoString(page.path)
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
