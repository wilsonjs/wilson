import NodeCache from 'node-cache'
import grayMatter from 'gray-matter'
import remarkParse from 'remark-parse'
import remarkToRehype from 'remark-rehype'
import type { Node } from 'unist'
import remarkStringify from 'remark-stringify'
import rehypeRaw from 'rehype-raw'
import { unified, Processor } from 'unified'
import type { PluginOption } from 'vite'
import type { TransformResult } from 'rollup'
// @ts-ignore
import toJsx from '@mapbox/hast-util-to-jsx'
import type { SiteConfig, UserFrontmatter } from '@wilson/types'
import { relative } from 'pathe'
import { format } from 'prettier'
import {
  createComponentName,
  getRoutingInfo,
  userToPageFrontmatter,
} from '@wilson/utils'

/** Result of parsing markdown source code with frontmatter */
type MarkdownParseResult = {
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
 * Converts markdown to JSX
 * @param markdownCode
 */
export async function processMarkdown(
  markdownCode: string,
): Promise<{ jsx: string }> {
  const processor = unified()
    .use(remarkParse)
    // apply plugins that change MDAST
    .use(remarkStringify)
    .use(remarkToRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    // apply plugins that change HAST and gather additional information
    .use(function stringifyToJsx(this: Processor): void {
      this.Compiler = (tree: Node) => toJsx(tree)
    })

  const vfile = await processor.process(markdownCode)
  const jsx = (vfile.value as string)
    .replace(/^<div>/, '')
    .replace(/<\/div>$/, '')

  return { jsx }
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
      const { jsx } = await processMarkdown(markdown)
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

      const newCode = /* tsx */ `
        import { useTitle } from 'hoofd/preact';
        import Layout from '${layoutPath}';

        export const path = '${route}';
        export const frontmatter = ${JSON.stringify(frontmatter)};
        const props = { frontmatter, path, translations: ${JSON.stringify(
          Array.from(translations),
        )} };

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
