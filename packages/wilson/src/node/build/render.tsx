import { existsSync } from 'fs'
import type { SiteConfig } from '@wilson/types'
import { join } from 'pathe'
import type { RollupOutput } from 'rollup'
import type { IslandDefinition, RenderToStringFn } from 'src/client/app.server'
import { withSpinner } from '../utils'
import type { bundle } from './bundle'
import type { PageToRender } from './pages'
import { getPagesToRender } from './pages'
import { IslandsByPath } from './build'

export async function renderPages(
  config: SiteConfig,
  { clientResult }: Awaited<ReturnType<typeof bundle>>,
): Promise<{ pagesToRender: PageToRender[]; islandsByPath: IslandsByPath }> {
  const appPath = ['js', 'mjs', 'cjs']
    .map((ext) => join(config.tempDir, `app.${ext}`))
    .find(existsSync)

  if (!appPath)
    throw new Error(
      `Could not find the SSR build for the app in ${config.tempDir}`,
    )

  const rendertoString: RenderToStringFn = (await import(appPath)).default

  const pagesToRender = await withSpinner(
    'resolving static paths',
    getPagesToRender,
  )
  const clientChunks = clientResult.output
  const islandsByPath: IslandsByPath = {}

  await withSpinner('rendering pages', async () => {
    for (const page of pagesToRender) {
      const { rendered, islands } = await renderPage(
        config,
        clientChunks,
        page,
        rendertoString,
      )
      page.rendered = rendered
      islandsByPath[page.path] = islands
    }
  })

  return { pagesToRender, islandsByPath }
}

export async function renderPage(
  config: SiteConfig,
  clientChunks: RollupOutput['output'],
  page: PageToRender,
  rendertoString: RenderToStringFn,
): Promise<{ rendered: string; islands: IslandDefinition[] }> {
  const { html, islands } = await rendertoString(page.path)
  return {
    rendered: /* html */ `
      <!DOCTYPE html>
      <html>
        <head>
          ${stylesheetTagsFrom(config, clientChunks)}
        </head>
        <body>
          <div id="app">${html}</div>
        </body>
      </html>
    `,
    islands,
  }

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

function stylesheetTagsFrom(
  config: SiteConfig,
  clientChunks: RollupOutput['output'],
) {
  return clientChunks
    .filter(
      (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css'),
    )
    .map(
      (chunk) =>
        `<link rel="stylesheet" href="${config.base}${chunk.fileName}">`,
    )
    .join('\n')
}
