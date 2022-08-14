import type {
  DynamicPageExports,
  SiteConfig,
  StaticPageExports,
} from '@wilson/types'
import { isDynamicPagePath } from '@wilson/utils'
import glob from 'fast-glob'
import { join, relative } from 'pathe'
import { createPaginationHelper } from '..'
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
function pathToFilename(pagePathWithoutExt: string) {
  return `${(pagePathWithoutExt.endsWith('/')
    ? `${pagePathWithoutExt}index`
    : pagePathWithoutExt
  ).replace(/^\//g, '')}.html`
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

  for (const absolutePath of files) {
    const relativePath = relative(pagesDir, absolutePath)
    const withoutExt = relativePath.replace(/\.[^.]+$/, '')
    const isDynamic = isDynamicPagePath(withoutExt)

    if (isDynamic) {
      const { getRenderedPaths } = await getPageExports<DynamicPageExports>(
        absolutePath,
        pagesDir,
      )
      const paginate = createPaginationHelper(relativePath)
      const renderedPaths = (
        await getRenderedPaths({
          paginate,
          getPages: () => [],
        })
      ).map(({ params }) => {
        let url = withoutExt
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
      const outputFilename = pathToFilename(withoutExt)
      pagesToRender.push({
        path: withoutExt === 'index' ? '/' : withoutExt,
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
