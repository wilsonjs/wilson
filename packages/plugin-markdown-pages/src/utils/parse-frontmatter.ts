import type grayMatter from 'gray-matter'
import NodeCache from 'node-cache'

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
export default function parseFrontmatter(
  markdownCode: string,
  grayMatterFn: typeof grayMatter,
): MarkdownParseResult {
  const cachedResult = frontmatterCache.get<MarkdownParseResult>(markdownCode)

  if (cachedResult) {
    return cachedResult
  }

  const { content: markdown, data: frontmatter } = grayMatterFn(markdownCode)
  frontmatterCache.set<MarkdownParseResult>(markdownCode, {
    markdown,
    frontmatter,
  })

  return { markdown, frontmatter }
}
