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
import debug from 'debug'
import type {
  PageFrontmatter,
  SiteConfig,
  UserFrontmatter,
} from '@wilson/types'
import { dirname, relative } from 'pathe'
import { promises as fs } from 'fs'
import { isObject } from '@wilson/utils'
import { format } from 'prettier'

/** Result of parsing frontmatter from markdown source code */
type FrontmatterParseResult = {
  /** Markdown source code without the parsed frontmatter */
  markdown: string
  /** The parsed frontmatter data */
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
 * Wilson markdown plugin
 */
export default function markdownPlugin(config: SiteConfig): PluginOption {
  return {
    name: 'wilson:markdown',
    enforce: 'pre',

    async transform(code: string, id: string): Promise<TransformResult> {
      if (!id.endsWith('.md')) {
        return null
      }

      const { markdown, frontmatter: userFrontmatter } = parseFrontmatter(code)
      const { jsx } = await processMarkdown(markdown)
      const frontmatter = await prepareFrontmatter(id, userFrontmatter, config)
      const layout = frontmatter.layout ?? 'default'
      const layoutPath = `${config.layoutsDir}/${layout}.tsx`
      const path = getRoute(relative(config.pagesDir, id))
      const componentName = createComponentName(path)

      const newCode = /* tsx */ `
        import { useTitle } from 'hoofd/preact';
        import Layout from '${layoutPath}';

        export const path = '${path}';
        export const frontmatter = ${JSON.stringify(frontmatter)};
        const props = { frontmatter, path };

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

async function prepareFrontmatter(
  absolutePath: string,
  userFrontmatter: UserFrontmatter,
  config: SiteConfig,
): Promise<PageFrontmatter> {
  const extendedFrontmatter = await config.extendFrontmatter(
    userFrontmatter,
    relative(config.root, absolutePath),
  )
  const {
    meta: originalMeta,
    layout: fmLayout,
    ...rest
  } = extendedFrontmatter ?? {}
  const layout: string | undefined =
    typeof fmLayout === 'string' ? fmLayout : undefined
  const meta = {
    filename: relative(config.root, absolutePath),
    lastUpdated: (await fs.stat(absolutePath)).mtime,
    ...(isObject(originalMeta) ? originalMeta : {}),
  }
  const frontmatter = { layout, meta, ...rest }
  return frontmatter
}

function getRoute(relativePath: string) {
  const reactRouterLike = relativePath
    .split('/')
    .filter((x) => x)
    .map((s) => s.toLowerCase())
    .join('/')
  const route = reactRouterLike
    .slice(0, reactRouterLike.lastIndexOf('.'))
    .replace(/index$/, '')
    .replace(/^\/|\/$/g, '')
    .replace(/(:[^/]+)$/, '$1?')
  return route === '' ? '/' : route
}

function createComponentName(path: string) {
  const withoutExtension = path.slice(0, path.lastIndexOf('.'))
  const pascalCased = withoutExtension
    .split('/')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')
  const variablesReplaced = pascalCased.replace(/\[([^\]]+)\]/g, '$$$1')
  const onlyAllowedChars = variablesReplaced.replace(/[^a-z0-9$_]/gi, '')
  return onlyAllowedChars.replace(
    /\$(.{1})/g,
    (s: string) => s.charAt(0) + s.charAt(1).toUpperCase(),
  )
}
