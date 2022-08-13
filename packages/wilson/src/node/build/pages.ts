import type {
  DynamicPageExports,
  RenderedPath,
  SiteConfig,
  StaticPageExports,
} from '@wilson/types'
import { isDynamicPagePath } from '@wilson/utils'
import glob from 'fast-glob'
import { basename, dirname, join, relative } from 'pathe'
import { paginate } from '..'
import { getOutputFilename } from './bundle'

/**
 * A page that is about to be rendered to a static .html file.
 */
export interface PageToRender {
  path: string
  outputFilename: string
  rendered: string
}

/**
 * Converts a RenderedPath path to a filename.
 *
 * - Removes starting slash
 * - Ensures .html extension
 * - Represents paths ending in "/" with index.html files
 */
function pathToFilename(path: string) {
  return `${(path.endsWith('/') ? `${path}index` : path).replace(
    /^\//g,
    '',
  )}.html`
}

/**
 * Replaces opening bracket on start of given string and
 * closing bracket on end of given string with underscores.
 */
function replaceBrackets(string: string): string {
  return string.replace(/^\[/, '_').replace(/\]$/, '_')
}

/**
 * Returns an array of all pages to render.
 *
 * Will have single entries for static pages, and multiple entries for dynamic pages
 * depending on the return values of their `getRenderedPaths` implementation.
 */
// TODO misses renderedPaths of dynamic pages
export async function getPagesToRender({
  pagesDir,
}: SiteConfig): Promise<PageToRender[]> {
  const files = await glob(join(pagesDir, `**/*.{md,tsx}`))
  const pagesToRender = []

  for (const file of files) {
    const path = relative(pagesDir, file.replace(/\.[^.]+$/, ''))
    const isDynamic = isDynamicPagePath(path)

    if (isDynamic) {
      const { getRenderedPaths: get } =
        await getPageExports<DynamicPageExports>(file, pagesDir)
      const renderedPaths = (
        await get({
          paginate,
          getPages: () => [],
        })
      ).map(({ params }) => {
        let url = path
        Object.entries(params).forEach(([key, value]) => {
          url = url.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
        })
        const outputFilename = pathToFilename(url)
        return {
          path: url.replace(/\/$/, ''),
          outputFilename,
          rendered: '',
        }
      })

      pagesToRender.push(...renderedPaths)
    } else {
      const outputFilename = pathToFilename(path)
      pagesToRender.push({
        path: path === 'index' ? '/' : path,
        outputFilename,
        rendered: '',
      })
    }
  }

  return pagesToRender
}

/**
 * Returns the module exports of a page.
 *
 * @param absolutePath Absolute path of the page to retrieve exports from
 * @returns Exports of the page
 */
export async function getPageExports<T extends StaticPageExports>(
  absolutePath: string,
  pagesDir: string,
): Promise<T> {
  const outputFilename = getOutputFilename(absolutePath, pagesDir)
  const importPath = join(process.cwd(), '.wilson/pages', outputFilename)
  const pageExports = (await import(importPath)) as T
  return pageExports
}
