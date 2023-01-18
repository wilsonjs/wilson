import { relative } from 'pathe'
import { assetUrlPrefix } from '../remark-plugins/relative-assets'

/**
 * Returns an array of (relative) asset import strings
 *
 * @param assetUrls An array of asset URLs
 * @param relativePagePath Current page path relative to `pagesDir`
 */
export default function getAssetImports(
  assetUrls: string[],
  relativePagePath: string,
) {
  return assetUrls
    .map((assetUrl) =>
      assetUrl.startsWith('./')
        ? assetUrl
        : `./${relative(relativePagePath, assetUrl)}`,
    )
    .map((url, i) => `import ${assetUrlPrefix}${i} from '${url}';`)
}
