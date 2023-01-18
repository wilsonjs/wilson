import { assetUrlPrefix } from '../remark-plugins/relative-assets'

/**
 * Replaces relative asset URL string attributes with JSX variable
 * interpolations.
 *
 * @param jsx JSX code with asset URL string attributes
 * @param assetUrls An array of asset URLs
 */
export default function replaceAssetUrls(jsx: string, assetUrls: string[]) {
  let result = `${jsx}`

  assetUrls.forEach((_, i) => {
    result = result.replace(
      new RegExp(`"${assetUrlPrefix}${i}"`, 'g'),
      `{${assetUrlPrefix}${i}}`,
    )
  })

  result = result.replace(
    /srcSet="((?:[^"\s,]+\s*(?:\s+(?:\d+w|[\d\.]+x))?(?:,\s*)?)+)"/g,
    (_, value) => {
      assetUrls.forEach((_, i) => {
        value = value.replace(
          new RegExp(`${assetUrlPrefix}${i}`, 'g'),
          `$\{${assetUrlPrefix}${i}}`,
        )
      })
      return `srcSet={\`${value}\`}`
    },
  )

  return result
}
