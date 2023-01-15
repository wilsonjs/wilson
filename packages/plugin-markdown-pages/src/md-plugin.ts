import NodeCache from 'node-cache'
import grayMatter from 'gray-matter'
import remarkParse from 'remark-parse'
import remarkToRehype from 'remark-rehype'
import type { Node } from 'unist'
import remarkStringify from 'remark-stringify'
import rehypeRaw from 'rehype-raw'
import type { Processor } from 'unified'
import { unified } from 'unified'
import type { PluginOption } from 'vite'
import type { TransformResult } from 'rollup'
// @ts-expect-error declaration file doesn't exist
import toJsx from '@mapbox/hast-util-to-jsx'
import type { SiteConfig, UserFrontmatter } from '@wilson/types'
import { relative } from 'pathe'
import { format } from 'prettier'
import {
  createComponentName,
  getRoutingInfo,
  userToPageFrontmatter,
} from '@wilson/utils'
import { getTranslationKeys } from '@wilson/client-utils'
import remarkRelativeAssets from './remark-plugins/relative-assets'

/** Result of parsing markdown source code with frontmatter */
interface MarkdownParseResult {
  /** Markdown source code without the parsed frontmatter */
  markdown: string
  /** The parsed frontmatter data */
  frontmatter: Record<string, any>
}

const frontmatterCache = new NodeCache()

/**
 * Parses frontmatter from a markdown string.
 *
 * Converts a markdown string with frontmatter into a MarkdownParseResult
 * object with `markdown` and `frontmatter` properties.
 *
 * @param markdownCode The markdown code to parse
 * @returns The MarkdownParseResult object
 */
export function parseFrontmatter(markdownCode: string): MarkdownParseResult {
  const cachedResult = frontmatterCache.get<MarkdownParseResult>(markdownCode)

  if (cachedResult) {
    return cachedResult
  }

  const { content: markdown, data: frontmatter } = grayMatter(markdownCode)
  frontmatterCache.set<MarkdownParseResult>(markdownCode, {
    markdown,
    frontmatter,
  })

  return { markdown, frontmatter }
}

/**
 * Asset URL prefix.
 */
export const assetUrlPrefix = '_assetUrl_'

/**
 * Transforms a markdown string to JSX
 * Returns a MarkdownTransformResult object with the resulting HTML code in the html property and additional information that was gathered during the transformation such as `headings` and `assetUrls`.
 *
 * @param markdownCode — The markdown code to parse
 * @returns — The MarkdownTransformResult object
 */
export async function processMarkdown(
  markdownCode: string,
): Promise<{ assetUrls: string[]; jsx: string }> {
  const processor = unified()
    .use(remarkParse)
    // apply plugins that change MDAST
    .use(remarkStringify)
    .use(remarkToRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    // apply plugins that change HAST and gather additional information
    .use(remarkRelativeAssets, { assetUrlPrefix })
    .use(function stringifyToJsx(this: Processor): void {
      this.Compiler = (tree: Node) => toJsx(tree)
    })

  const vfile = await processor.process(markdownCode)
  const jsx = (vfile.value as string)
    .replace(/^<div>/, '')
    .replace(/<\/div>$/, '')

  const assetUrls = vfile.data.assetUrls as string[]
  return { assetUrls, jsx }
}

/**
 * Wilson markdown pages plugin
 */
export default function markdownPagesPlugin(config: SiteConfig): PluginOption {
  return {
    name: 'wilson-plugin-markdown-pages',
    enforce: 'pre',

    async transform(code: string, id: string): Promise<TransformResult> {
      if (!id.endsWith('.md')) {
        return null
      }

      const { markdown, frontmatter: userFrontmatter } = parseFrontmatter(
        code,
      ) as { markdown: string; frontmatter: UserFrontmatter }
      let { jsx, assetUrls } = await processMarkdown(markdown)

      // replace relative asset URL string attributes with react-style variable
      // interpolations
      assetUrls.forEach((_, i) => {
        jsx = jsx.replace(
          new RegExp(`"${assetUrlPrefix}${i}"`, 'g'),
          `{${assetUrlPrefix}${i}}`,
        )
      })
      jsx = jsx.replace(
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

      // change assetUrls to URLs that work for relative javascript imports
      const relativeAssetImports = assetUrls
        .map((assetUrl) => {
          return assetUrl.startsWith('./')
            ? assetUrl
            : `./${relative(relativePath, assetUrl)}`
        })
        .map((url, i) => `import ${assetUrlPrefix}${i} from '${url}';`)

      const frontmatter = await userToPageFrontmatter(
        userFrontmatter,
        id,
        config,
      )
      const relativePath = relative(config.pagesDir, id)
      const layout = frontmatter.layout
      const layoutPath = `${config.layoutsDir}/${layout}.tsx`
      const { route, translations } = getRoutingInfo(relativePath, config)
      const componentName = createComponentName(relativePath)
      const { languageId, translationKeys } = getTranslationKeys(
        id,
        config.languages,
        config.defaultLanguage,
      )

      const newCode = /* tsx */ `
        import { useTitle } from 'hoofd/preact';
        import Layout from '${layoutPath}';
        ${relativeAssetImports.join('\n')}

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
          translations: ${JSON.stringify(translations)},
          translate: (key) => (${JSON.stringify(translationKeys)}[key] ?? key),
        };

        function Title() {
          useTitle(frontmatter.title);
          return null;
        };

        export default function ${componentName}Page({ url, params: matches }) {
          return <Layout url={url} {...props}>
            {frontmatter.title && <Title />}
            ${jsx}
          </Layout>;
        };
      `

      return format(newCode, { filepath: 'markdown.tsx' })
    },
  }
}
