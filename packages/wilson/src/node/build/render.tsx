import { existsSync } from 'fs'
import type { Island, IslandsByPath, SiteConfig } from '@wilson/types'
import { join } from 'pathe'
import type { RollupOutput } from 'rollup'
import type { RenderToStringFn } from '../../client/app.server'
import { withSpinner } from '../utils'
import type { PageFrontmatter } from '../../../../types/dist/types'
import type { bundle } from './bundle'
import type { PageToRender, PageToRenderBase } from './pages'
import { getPagesToRender } from './pages'

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

  const pagesToRenderBases = await withSpinner(
    'resolving static paths',
    getPagesToRender,
    config,
  )
  const clientChunks = clientResult.output
  const islandsByPath: IslandsByPath = {}

  const pagesToRender = await withSpinner('rendering pages', async () => {
    return await Promise.all(
      pagesToRenderBases.map(async (pageBase): Promise<PageToRender> => {
        const { rendered, frontmatter, islands } = await renderPage(
          config,
          clientChunks,
          pageBase,
          rendertoString,
        )
        const page: PageToRender = { ...pageBase, rendered, frontmatter }
        islandsByPath[page.route] = islands
        return page
      }),
    )
  })

  return { pagesToRender, islandsByPath }
}

const frontmatterRegexp = /^<div><!-- frontmatter (?<json>.*?) --><\/div>/

export async function renderPage(
  config: SiteConfig,
  clientChunks: RollupOutput['output'],
  page: PageToRenderBase,
  renderToString: RenderToStringFn,
): Promise<{
  rendered: string
  islands: Island[]
  frontmatter: PageFrontmatter
}> {
  const { html, islands, head } = renderToString(page.route)
  const match = html.match(frontmatterRegexp)
  const frontmatter = JSON.parse(match!.groups!.json) as PageFrontmatter
  html.replace(frontmatterRegexp, '')

  // TODO: links and scripts
  return {
    rendered: /* html */ `
      <!DOCTYPE html>
      <html lang="${head.lang ?? config.defaultLanguage}">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta http-equiv="x-ua-compatible" content="ie=edge" />
          <title>${head.title}</title>
          ${metaTagsFrom(head.metas)}
          ${stylesheetTagsFrom(config, clientChunks)}
          ${await config.getAdditionalHeadContent()}
        </head>
        <body>
          <div id="site">${html}</div>
        </body>
      </html>
    `,
    islands,
    frontmatter,
  }
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

function metaTagsFrom(metas: Record<string, string>[]) {
  return metas
    .map((meta) => {
      const entries = Object.entries(meta)
      return `<meta ${entries[0][0]}="${entries[0][1]}" ${entries[1][0]}="${entries[1][1]}" />`
    })
    .join('\n')
}
