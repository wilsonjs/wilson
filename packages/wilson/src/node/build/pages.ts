import type { RenderedPath } from '@wilson/pages'
import { getPages } from '@wilson/pages'

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
  return `${(path.endsWith('/') ? `${path}index` : path).replace(/^\//g, '')}.html`
}

/**
 * Converts a RenderedPath to a PageToRender.
 */
function toPageToRender({ url: path }: RenderedPath): PageToRender {
  return { path, outputFilename: pathToFilename(path), rendered: '' }
}

/**
 * Returns an array of all pages to render.
 *
 * Will have single entries for static pages, and multiple entries for dynamic pages
 * depending on the return values of their `getRenderedPaths` implementation.
 */
export async function getPagesToRender(): Promise<PageToRender[]> {
  return (await getPages()).map((page) => page.renderedPaths.map(toPageToRender)).flat()
}
