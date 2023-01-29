import type { SiteConfig } from '@wilson/types'
import { isPropertyMeta } from '@wilson/utils'

/**
 * Creates description meta tags like `description` or `og:description`
 * for usage with hoofd `useHead`.
 */
export function createDescriptionMetaTags(
  frontmatterDescription: any,
  config: Pick<SiteConfig['meta'], 'descriptionMeta' | 'defaultDescription'>,
) {
  return config.descriptionMeta.names
    .map((name) =>
      JSON.stringify({
        ...(isPropertyMeta(name) ? { property: name } : { name }),
        content: frontmatterDescription ?? config.defaultDescription,
      }),
    )
    .join(',\n')
}

/**
 * Creates static meta tags for usage with hoofd `useHead`.
 */
export function createStaticMetaTags(
  config: Pick<SiteConfig['meta'], 'staticMeta'>,
) {
  return config.staticMeta
    .map((meta) =>
      JSON.stringify(
        isPropertyMeta(meta.name)
          ? { property: meta.name, content: meta.content }
          : meta,
      ),
    )
    .join(',\n')
}

/**
 * Creates title meta tags like `og:title` or `twitter:title`
 * for usage with hoofd `useHead`.
 */
export function createTitleMetaTags(
  frontmatterTitle: string,
  config: Pick<SiteConfig['meta'], 'titleMeta' | 'titleTemplate'>,
) {
  return config.titleMeta.names
    .map((name) =>
      JSON.stringify({
        ...(isPropertyMeta(name) ? { property: name } : { name }),
        content: config.titleMeta.useTitleTemplate
          ? config.titleTemplate.replace('%s', frontmatterTitle)
          : frontmatterTitle,
      }),
    )
    .join(',\n')
}
