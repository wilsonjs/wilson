import NodeCache from 'node-cache'
import grayMatter from 'gray-matter'
import remarkParse from 'remark-parse'
import remarkToRehype from 'remark-rehype'
import type { Node } from 'unist'
import remarkStringify from 'remark-stringify'
import rehypeRaw from 'rehype-raw'
import { unified, Processor } from 'unified'
import type { VFile } from 'vfile'
// @ts-ignore
import toJsx from '@mapbox/hast-util-to-jsx'

/**
 * Result of parsing frontmatter from markdown source code.
 */
type FrontmatterParseResult = {
  /**
   * Markdown source code without the parsed frontmatter.
   */
  markdown: string
  /**
   * The parsed frontmatter data.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  frontmatter: Record<string, any>
}

const frontmatterCache = new NodeCache()

/**
 * Parses frontmatter from a markdown string.
 *
 * Converts a markdown string with frontmatter into a FrontmatterParseResult
 * object with `markdown` and `frontmatter` properties.
 *
 * @param markdownCode The markdown code to parse
 * @returns The FrontmatterParseResult object
 */
export function parseFrontmatter(markdownCode: string): FrontmatterParseResult {
  const cachedResult =
    frontmatterCache.get<FrontmatterParseResult>(markdownCode)

  if (cachedResult) {
    return cachedResult
  }

  const { content: markdown, data: frontmatter } = grayMatter(markdownCode)
  frontmatterCache.set<FrontmatterParseResult>(markdownCode, {
    markdown,
    frontmatter,
  })

  return { markdown, frontmatter }
}

export async function processMarkdown(markdownCode: string): Promise<VFile> {
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
  return vfile
}
