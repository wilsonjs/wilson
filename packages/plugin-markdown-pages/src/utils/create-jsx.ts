import type { PageFrontmatter, SiteConfig, Translation } from '@wilson/types'

function createMetaTags(
  frontmatter: PageFrontmatter,
  config: Pick<SiteConfig, 'meta' | 'url'>,
  route: string,
) {
  return [
    JSON.stringify(
      config.meta.tags(
        frontmatter,
        `${config.url}/${route}`.replace(/(?<!https?:)\/{2}/g, '/'),
      ),
    ),
  ].join('\n,')
}

/**
 * Creates the JSX code for a markdown page.
 */
export default function createJsx(
  layoutPath: string,
  assetImports: string[],
  route: string,
  languageId: string,
  config: Pick<SiteConfig, 'defaultLanguage' | 'meta' | 'url'>,
  frontmatter: PageFrontmatter,
  translatedPages: Translation[],
  translationKeys: Record<string, string>,
  componentName: string,
  jsxWithReplacedAssetUrls: string,
) {
  return /* jsx */ `
    import { useHead, useTitle, useTitleTemplate } from 'hoofd/preact';
    import Layout from '${layoutPath}';
    ${assetImports.join('\n')}

    export const path = '${route}';
    export const language = '${languageId}';
    export const frontmatter = ${JSON.stringify(frontmatter)};

    const props = {
      frontmatter,
      path,
      language: '${languageId}',
      localizeUrl: (url) => ${
        languageId === config.defaultLanguage
          ? 'url'
          : `'/${languageId}' + url.replace(/\\/$/, '')`
      },
      translations: ${JSON.stringify(translatedPages)},
      translate: (key) => (${JSON.stringify(translationKeys)}[key] ?? key),
    };

    export default function ${componentName}Page({ url, params: matches }) {
      useTitleTemplate('${config.meta.titleTemplate}');
      useTitle(frontmatter.title);
      useHead({
        language,
        metas: ${createMetaTags(frontmatter, config, route)},
      });

      return (
        <Layout url={url} {...props}>
          ${jsxWithReplacedAssetUrls}
        </Layout>
      );
    };
  `
}
