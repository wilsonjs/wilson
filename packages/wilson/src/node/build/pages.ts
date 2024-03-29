import type {
  DynamicPageExports,
  PageFrontmatter,
  SiteConfig,
  StaticPageExports,
} from '@wilson/types'
import utils from '@wilson/utils'
import glob from 'fast-glob'
import { join, relative } from 'pathe'
import { getOutputFilename } from './bundle'

/**
 * A page that is about to be rendered to a static .html file.
 */
export interface PageToRenderBase {
  route: string
  outputFilename: string
}

export interface PageToRender extends PageToRenderBase {
  frontmatter: PageFrontmatter
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
    : `${cleanedPath}/index`
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
): Promise<PageToRenderBase[]> {
  const files = await glob(join(config.pagesDir, `**/*.{md,tsx}`))
  const pagesToRender = []

  for (const absolutePath of files) {
    const isTypeScript = absolutePath.endsWith('.tsx')
    const relativePath = relative(config.pagesDir, absolutePath)
    const { route } = utils.getRoutingInfo(relativePath, {
      ...config,
      replaceParams: false,
    })
    const isDynamic = isTypeScript && utils.isDynamicPagePath(route)

    if (isDynamic) {
      const { staticPaths } = await getPageExports<DynamicPageExports>(
        absolutePath,
        config.pagesDir,
      )

      pagesToRender.push(
        ...staticPaths.map(({ params }) => {
          let url = route
          Object.entries(params).forEach(([key, value]) => {
            url = url.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
          })
          const outputFilename = pathToFilename(url)
          return {
            route: url.replace(/\/$/, ''),
            outputFilename,
          }
        }),
      )
    } else {
      const outputFilename = pathToFilename(route)
      pagesToRender.push({
        route,
        outputFilename,
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
