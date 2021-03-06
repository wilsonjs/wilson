import Jimp from 'jimp'
import wlt from '@codepunkt/wasm-layout-text'
import { getConfig } from './config.js'
import { hexToRgb, toRoot } from './util.js'
import fs from 'fs/promises'
import { dirname } from 'path'
import { getPages } from './state.js'

export async function createOpengraphImages(): Promise<void> {
  const config = getConfig()

  const { background, texts } = config.opengraphImage ?? {
    background: '#ffffff',
    texts: [],
  }

  const width = 1200
  const height = 630

  const backgroundLayer = background.match(/[0-9A-Fa-f]{6}/g)
    ? new Jimp(width, height, background)
    : await Jimp.read(background)

  if (
    backgroundLayer.bitmap.height !== height ||
    backgroundLayer.bitmap.width !== width
  ) {
    throw new Error(`opengraph background image is not ${width} x ${height}!`)
  }

  for (const page of getPages()) {
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
              typeof text === 'function' ? text(page) : text,
              fontSize,
              new wlt.RgbColor(...hexToRgb(color)),
              await fs.readFile(font)
            ),
            new wlt.Dimension(width, height),
            new wlt.Dimension(maxWidth, maxHeight),
            new wlt.Position(x, y),
            new wlt.Alignment(hAlign, vAlign)
          )

          return new Jimp({ data: buffer, width, height })
        }
      )
    )

    let composite = backgroundLayer.clone()
    textLayers.forEach((textLayer) => {
      composite = composite.composite(textLayer, 0, 0)
    })
    const result = composite.quality(100)

    await result.writeAsync(toRoot(`./dist/${dirname(page.path)}/og-image.jpg`))
  }
}
