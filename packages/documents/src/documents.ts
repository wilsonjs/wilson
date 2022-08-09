import { Plugin, ViteDevServer } from 'vite'
import type { SiteConfig, Document } from '@wilson/types'
import { findPage } from '@wilson/pages'
import { join, relative } from 'pathe'
import glob from 'fast-glob'
import { isPage } from '@wilson/utils'
import createDebug from 'debug'

const debug = createDebug('wilson:documents')

function parseQueryParams(url: string) {
  const index = url.indexOf('?')
  if (index < 0) return { path: url, query: {} }
  const query = Object.fromEntries(new URLSearchParams(url.slice(index)))
  return { path: url.slice(0, index), query }
}
const definitionRegex = /(function|const|let|var)[\s\n]+\bgetDocuments\b/
const usageRegex = /\bgetDocuments[\s\n]*\(([^)]*)\)/g
const DOCUMENTS_MODULE_ID = 'virtual:wilson-documents'

let server: ViteDevServer

interface DocumentModule {
  pattern: string
  hasDocument: (path: string) => boolean
}

const idsByPath: Record<string, Set<string>> = {}
const idsByPattern: Record<string, Set<string>> = {}
const pageToDependents: Record<string, Set<string>> = {}

async function generateDocumentsModule(
  pattern: string,
  config: SiteConfig,
): Promise<string> {
  const files = await glob(pattern, { cwd: config.root })
  const documents = files
    .map((file) => {
      const page = findPage((page) => page.rootPath === file)!

      if (!pageToDependents[page.absolutePath]) {
        pageToDependents[page.absolutePath] = new Set()
      }
      Array.from(idsByPattern[pattern]).forEach((id) =>
        pageToDependents[page.absolutePath].add(id),
      )

      return {
        frontmatter: page.frontmatter,
        path: page.rootPath,
        href: `/${page.route}`,
      } as Document
    })
    .filter(Boolean) as Document[]

  debug(`generated virtual documents module for pattern ${pattern}`)

  return /* js */ `
    export default ${JSON.stringify(documents)};
  `
}

export default function DocumentsPlugin(config: SiteConfig): Plugin {
  return {
    name: 'wilson:documents',
    configureServer(devServer) {
      server = devServer
    },
    get api() {
      return {
        getDependents(file: string) {
          return Array.from(pageToDependents[file] ?? new Set())
        },
      }
    },
    resolveId(id) {
      if (id.startsWith(DOCUMENTS_MODULE_ID)) return id
    },
    async load(id) {
      if (!id.startsWith(DOCUMENTS_MODULE_ID)) return
      const rawPath = parseQueryParams(id).query.pattern
      const path = relative(config.root, join('src', 'pages', rawPath))
      const pattern = path.includes('*') ? path : `${path}/**/*.{md,mdx}`
      idsByPattern[pattern] = new Set(idsByPath[rawPath])

      return {
        id,
        code: await generateDocumentsModule(pattern, config),
      }
    },
    async transform(code, id) {
      if (
        isPage(id, config.pagesDir, config.pageExtensions) &&
        !definitionRegex.test(code)
      ) {
        const paths: [string, string][] = []
        code = code.replace(usageRegex, (_, path) => {
          path = path.trim().slice(1, -1)
          const id = `_documents_${paths.length}`
          paths.push([id, path])
          return id
        })
        if (paths.length) {
          paths.forEach(([_, path]) => {
            ;(idsByPath[path] ??= new Set()).add(id)
          })

          const imports = paths.map(
            ([pathId, path]) =>
              `import ${pathId} from '${DOCUMENTS_MODULE_ID}?pattern=${path}'`,
          )

          debug(`transformed ${id} to import from virtual`)
          return `${imports.join(';')};${code}`
        }
      }
    },
  }
}
