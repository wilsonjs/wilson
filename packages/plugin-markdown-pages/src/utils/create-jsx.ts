import type { PageFrontmatter, Translation } from '@wilson/types'

/**
 * Creates the JSX code for a markdown page.
 */
export default function createJsx(
  layoutPath: string,
  assetImports: string[],
  route: string,
  languageId: string,
  defaultLanguage: string,
  frontmatter: PageFrontmatter,
  translatedPages: Translation[],
  translationKeys: Record<string, string>,
  componentName: string,
  jsxWithReplacedAssetUrls: string,
) {
  return /* jsx */ `
    import { useTitle } from 'hoofd/preact';
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
        languageId === defaultLanguage
          ? 'url'
          : `'/${languageId}' + url.replace(/\\/$/, '')`
      },
      translations: ${JSON.stringify(translatedPages)},
      translate: (key) => (${JSON.stringify(translationKeys)}[key] ?? key),
    };

    function Title() {
      useTitle(frontmatter.title);
      return null;
    };

    export default function ${componentName}Page({ url, params: matches }) {
      return <Layout url={url} {...props}>
        {frontmatter.title && <Title />}
        ${jsxWithReplacedAssetUrls}
      </Layout>;
    };
  `
}
