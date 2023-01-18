import remarkParse from 'remark-parse'
import remarkToRehype from 'remark-rehype'
import type { Node } from 'unist'
import remarkStringify from 'remark-stringify'
import rehypeRaw from 'rehype-raw'
import type { Processor } from 'unified'
import { unified } from 'unified'
// @ts-expect-error declaration file doesn't exist
import toJsx from '@mapbox/hast-util-to-jsx'
import remarkRelativeAssets from '../remark-plugins/relative-assets'

/**
 * Transforms a markdown string to JSX
 * Returns a MarkdownTransformResult object with the resulting HTML code in the html property and additional information that was gathered during the transformation such as `headings` and `assetUrls`.
 *
 * @param markdownCode — The markdown code to parse
 * @returns — The MarkdownTransformResult object
 */
export default async function processMarkdown(
  markdownCode: string,
): Promise<{ assetUrls: string[]; jsx: string }> {
  const processor = unified()
    .use(remarkParse)
    // apply plugins that change MDAST
    .use(remarkStringify)
    .use(remarkToRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    // apply plugins that change HAST and gather additional information
    .use(remarkRelativeAssets)
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
