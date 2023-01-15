import { visit, CONTINUE } from 'unist-util-visit'
import { Element, Properties } from 'hast'
import { Transformer } from 'unified'

/**
 * Defines attributes on HTML/SVG elements that should be considered when
 * converting relative URLs to imports.
 */
export const assetUrlTagConfig: Record<string, string[]> = {
  video: ['src', 'poster'],
  source: ['src', 'srcSet'],
  img: ['src', 'srcSet'],
  image: ['xlink:href', 'href'],
  use: ['xlink:href', 'href'],
}

interface Options {
  assetUrlPrefix: string
}

const replaceSimpleAttribute = (
  attribute: string,
  assetUrls: string[],
  assetUrlPrefix: string,
  properties: Properties,
): void => {
  const attributeValue = properties[attribute] as string
  const index = assetUrls.findIndex((url) => url === attributeValue)
  if (index === -1) {
    properties[attribute] = `${assetUrlPrefix}${assetUrls.length}`
    assetUrls.push(attributeValue)
  } else {
    properties[attribute] = `${assetUrlPrefix}${index}`
  }
}

const replaceSrcSet = (
  assetUrls: string[],
  assetUrlPrefix: string,
  properties: Properties,
) => {
  const srcSet = (properties.srcSet as string)
    .split(',')
    .map((s) => s.trim().split(' ')) as Array<
    [url: string, width?: string, density?: string]
  >
  for (const src of srcSet) {
    const srcSetUrl = src[0]
    const index = assetUrls.findIndex((url) => url === srcSetUrl)
    if (index === -1) {
      src[0] = `${assetUrlPrefix}${assetUrls.length}`
      assetUrls.push(srcSetUrl)
    } else {
      src[0] = `${assetUrlPrefix}${index}`
    }
  }
  properties.srcSet = srcSet.map((s) => s.join(' ')).join(', ')
}

/**
 *
 */
const remarkRelativeAssets: (options: Options) => Transformer = ({
  assetUrlPrefix,
}) => {
  return (tree, file) => {
    const assetUrls: string[] = []
    visit(tree, 'element', visitor)
    ;(file.data as Record<string, unknown>).assetUrls = assetUrls

    function visitor(node: Element) {
      const attributes = assetUrlTagConfig[node.tagName]
      if (!attributes) return
      if (node.properties === undefined) return

      const properties = node.properties

      attributes.forEach((attribute) => {
        if (typeof properties[attribute] !== 'string') return
        if (attribute === 'srcSet') {
          replaceSrcSet(assetUrls, assetUrlPrefix, properties)
        } else {
          replaceSimpleAttribute(
            attribute,
            assetUrls,
            assetUrlPrefix,
            properties,
          )
        }
      })

      return CONTINUE
    }
  }
}

export default remarkRelativeAssets
