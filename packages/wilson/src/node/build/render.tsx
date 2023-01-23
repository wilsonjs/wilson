import { existsSync } from 'fs'
import type { Island, IslandsByPath, SiteConfig } from '@wilson/types'
import { join } from 'pathe'
import type { RollupOutput } from 'rollup'
import type { RenderToStringFn } from '../../client/app.server'
import { withSpinner } from '../utils'
import type { PageFrontmatter } from '../../../../types/dist/types'
import type { bundle } from './bundle'
import type { PageToRender } from './pages'
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

  const pagesToRender = await withSpinner(
    'resolving static paths',
    getPagesToRender,
    config,
  )
  const clientChunks = clientResult.output
  const islandsByPath: IslandsByPath = {}

  await withSpinner('rendering pages', async () => {
    for (const page of pagesToRender) {
      const { rendered, frontmatter, islands } = await renderPage(
        config,
        clientChunks,
        page,
        rendertoString,
      )
      page.rendered = rendered
      page.frontmatter = frontmatter
      islandsByPath[page.route] = islands
    }
  })

  return { pagesToRender, islandsByPath }
}

const frontmatterRegexp = /^<div><!-- frontmatter (?<json>.*?) --><\/div>/

function createMetaTags(metas: Record<string, string>[]) {
  return metas
    .map((meta) => {
      const entries = Object.entries(meta)
      return `<meta ${entries[0][0]}="${entries[0][1]}" ${entries[1][0]}="${entries[1][1]}" />`
    })
    .join('\n')
}

export async function renderPage(
  config: SiteConfig,
  clientChunks: RollupOutput['output'],
  page: PageToRender,
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

  // TODO: links, scripts and meta
  return {
    rendered: /* html */ `
      <!DOCTYPE html>
      <html lang="${head.lang ?? config.defaultLanguage}">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <title>${head.title}</title>
          ${createMetaTags(head.metas)}
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
