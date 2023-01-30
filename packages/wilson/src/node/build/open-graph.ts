import fs from 'fs/promises'
import { resolve } from 'path'
import type { SiteConfig } from '@wilson/types'
import Jimp from 'jimp'
import wlt from '@codepunkt/wasm-layout-text'
import { withSpinner } from '../utils'
import type { PageToRender } from './pages'

/**
 * Converts a 6-digit hex string to an RGB array.
 */
export const hexToRgb = (hex: string): [r: number, g: number, b: number] => {
  const hexCode = hex.replace(/^#/, '')
  const bigint = parseInt(hexCode, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return [r, g, b]
}

type PageToOpengraphConfiguration = Map<
  PageToRender,
  NonNullable<ReturnType<SiteConfig['createOpengraphImage']>>
>

export default async function createOpengraphImages(
  siteConfig: SiteConfig,
  pagesToRender: PageToRender[],
) {
  const opengraphConfigurations: PageToOpengraphConfiguration = new Map()

  for (const page of pagesToRender) {
    const result = siteConfig.createOpengraphImage(page.frontmatter)
    if (result !== null) {
      opengraphConfigurations.set(page, result)
    }
  }

  if (opengraphConfigurations.size === 0) return

  await withSpinner(
    'creating open graph images',
    async () => await createImages(siteConfig, opengraphConfigurations),
  )
}

async function createImages(
  siteConfig: SiteConfig,
  opengraphConfigurations: PageToOpengraphConfiguration,
) {
  const width = 1200
  const height = 630

  for (const [page, { background, texts }] of opengraphConfigurations) {
    const backgroundLayer = background.match(/[0-9A-Fa-f]{6}/g)
      ? new Jimp(width, height, background)
      : await Jimp.read(background)

    if (
      backgroundLayer.bitmap.height !== height ||
      backgroundLayer.bitmap.width !== width
    ) {
      throw new Error(`opengraph background image is not ${width} x ${height}!`)
    }

    const textLayers = await Promise.all(
      texts.map(
        async ({
          text,
          font,
          fontSize = 64,
          color = '#000000',
          x = 0,
          y = 0,
          maxWidth = width,
          maxHeight = height,
          horizontalAlign = 'left',
          verticalAlign = 'top',
        }) => {
          let hAlign, vAlign
          switch (horizontalAlign) {
            case 'left':
              hAlign = wlt.HorizontalAlign.Left
              break
            case 'center':
              hAlign = wlt.HorizontalAlign.Center
              break
            case 'right':
              hAlign = wlt.HorizontalAlign.Right
              break
            default:
              throw new Error(`Unknown horizontalAlign!`)
          }
          switch (verticalAlign) {
            case 'top':
              vAlign = wlt.VerticalAlign.Top
              break
            case 'center':
              vAlign = wlt.VerticalAlign.Center
              break
            case 'bottom':
              vAlign = wlt.VerticalAlign.Bottom
              break
            default:
              throw new Error(`Unknown verticalAlign!`)
          }

          const buffer = wlt.render(
            new wlt.Text(
              text,
              fontSize,
              new wlt.RgbColor(...hexToRgb(color)),
              await fs.readFile(font),
            ),
            new wlt.Dimension(width, height),
            new wlt.Dimension(maxWidth, maxHeight),
            new wlt.Position(x, y),
            new wlt.Alignment(hAlign, vAlign),
          )

          return new Jimp({ data: buffer, width, height })
        },
      ),
    )

    let composite = backgroundLayer.clone()
    textLayers.forEach((textLayer) => {
      composite = composite.composite(textLayer, 0, 0)
    })
    const result = composite.quality(100)
    const pageOutputPath = resolve(siteConfig.outDir, page.outputFilename)
    const isIndexPage = pageOutputPath.endsWith('index.html')

    await result.writeAsync(
      isIndexPage
        ? pageOutputPath.replace(/index\.html$/, 'og-image.jpg')
        : pageOutputPath.replace(/\.html$/, '/og-image.jpg'),
    )
  }
}
