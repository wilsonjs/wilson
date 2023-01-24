import type { SiteConfig } from "@wilson/types"

/**
 * Creates additional title meta attributes like `og:title` or `twitter:title`
 * for usage with hoofd `useHead`.
 */
export default function createTitleMetas(
  frontmatterTitle: string,
  config: Pick<SiteConfig['site'], 'titleMeta' | 'titleTemplate'>,
) {
  return config.titleMeta.properties
    .map((property) => {
      const title = config.titleMeta.useTemplate
        ? config.titleTemplate.replace('%s', frontmatterTitle)
        : frontmatterTitle
      return `{ property: '${property}', content: '${title}' }`
    })
    .join(',\n')
}
