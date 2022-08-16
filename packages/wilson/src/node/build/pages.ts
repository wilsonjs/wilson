import type {
  DynamicPageExports,
  SiteConfig,
  StaticPageExports,
} from '@wilson/types'
import { getRouteForPage, isDynamicPagePath } from '@wilson/utils'
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
 * Converts a StaticPath path to a filename.
 *
 * - Removes starting slash
 * - Ensures .html extension
 * - Represents paths ending in "/" with index.html files
 */
function pathToFilename(cleanedPath: string) {
  return `${(cleanedPath.endsWith('/')
    ? `${cleanedPath}index`
    : cleanedPath
  ).replace(/^\//g, '')}.html`
}

/**
 * Returns an array of all pages to render.
 *
 * Will have single entries for static pages, and multiple entries for dynamic pages
 * depending on the return values of their `getStaticPaths` implementation.
 */
export async function getPagesToRender(
  config: SiteConfig,
): Promise<PageToRender[]> {
  const files = await glob(join(config.pagesDir, `**/*.{md,tsx}`))
  const pagesToRender = []

  for (const absolutePath of files) {
    const relativePath = relative(config.pagesDir, absolutePath)
    const path = getRouteForPage(relativePath, {
      ...config,
      replaceParams: false,
    })
    const isDynamic = isDynamicPagePath(path)

    if (isDynamic) {
      const { getStaticPaths } = await getPageExports<DynamicPageExports>(
        absolutePath,
        config.pagesDir,
      )
      const paginate = createPaginationHelper(relativePath)
      const staticPaths = (
        await getStaticPaths({
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

      pagesToRender.push(...staticPaths)
    } else {
      const outputFilename = pathToFilename(path)
      pagesToRender.push({
        path,
        outputFilename,
        rendered: '',
      })
    }
  }

  console.log({ pagesToRender })
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
