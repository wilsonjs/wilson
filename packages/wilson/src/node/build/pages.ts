import type { RenderedPath, SiteConfig } from '@wilson/types'
import { isDynamicPagePath } from '@wilson/utils'
import glob from 'fast-glob'
import { basename, dirname, join, relative } from 'pathe'

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
export async function getPagesToRender({
  pagesDir,
}: SiteConfig): Promise<PageToRender[]> {
  const files = await glob(join(pagesDir, `**/*.{md,tsx}`))
  return files
    .map((file) => {
      const path = relative(pagesDir, file.replace(/\.[^.]+$/, ''))
      const outputFilename = pathToFilename(path)
      return {
        path: path === 'index' ? '/' : path,
        outputFilename,
        rendered: '',
      }
    })
    .filter((page) => {
      console.log(page)
      return !isDynamicPagePath(page.path)
    })
  // return (await getPages())
  //   .map((page) => page.renderedPaths.map(toPageToRender))
  //   .flat()
}
