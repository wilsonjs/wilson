import type {
  DynamicPageExports,
  PaginationHelper,
  RenderedPath,
  SiteConfig,
  StaticPageExports,
  UserFrontmatter,
} from '@wilson/types'
import { relative } from 'pathe'
import { isObject } from '@wilson/utils'
import { getPageExports } from './vite'

/**
 * Reads and returns frontmatter from TypeScript page file.
 *
 * @param absolutePath Path to the page file
 * @param tempDir Wilson temp directory
 * @param pagesDir Wilson pages directory
 * @returns Frontmatter
 */
export async function getFrontmatter(
  absolutePath: string,
  config: SiteConfig,
): Promise<UserFrontmatter> {
  const { frontmatter } = await getPageExports<StaticPageExports>(
    config,
    absolutePath,
  )
  if (frontmatter !== undefined && !isObject(frontmatter)) {
    throw new Error(
      `page "${relative(
        config.pagesDir,
        absolutePath,
      )}" has frontmatter that is not an object`,
    )
  }
  return frontmatter ?? {}
}

const createPaginationHelper = (path: string): PaginationHelper => {
  const dynamicMatches = [...path.matchAll(/\[([^\]]+)\]/g)]
  const defaultParam =
    dynamicMatches.length === 1 ? dynamicMatches[0][1] : 'page'

  return (items, options = {}) => {
    const format = options.format ?? ((no) => String(no))
    const pageSize = options.pageSize ?? 10
    const param = options.param ?? defaultParam
    const toPath = (no: number) => (no === 1 ? '' : format(no))
    const pagesCount = Math.max(1, Math.ceil(items.length / pageSize))

    return Array.from({ length: pagesCount }, (_, i) => i + 1).map(
      (pageNumber) => {
        const firstItem = (pageNumber - 1) * pageSize
        return {
          params: { [param]: toPath(pageNumber) },
          props: {
            items: items.slice(firstItem, firstItem + pageSize),
            nextPage:
              pageNumber !== pagesCount
                ? `/blog/${toPath(pageNumber + 1)}`
                : undefined,
            prevPage:
              pageNumber === 1 ? undefined : `/blog/${toPath(pageNumber - 1)}`,
          },
        }
      },
    )
  }
}

export async function getRenderedPaths(
  config: SiteConfig,
  absolutePath: string,
  path: string,
  route: string,
): Promise<RenderedPath[]> {
  const { getRenderedPaths: get } = await getPageExports<DynamicPageExports>(
    config,
    absolutePath,
  )
  if (get === undefined)
    throw new Error(`dynamic page "${path}" has no getRenderedPaths() export`)

  const renderedPaths = await get({ paginate: createPaginationHelper(path) })
  if (!Array.isArray(renderedPaths))
    throw new Error(
      `getRenderedPaths() of dynamic page "${path}" must return an array`,
    )

  return renderedPaths.map((renderedPath) => {
    let url = route.replace(/\?$/, '')
    Object.entries(renderedPath.params).forEach(([key, value]) => {
      url = url.replace(new RegExp(`:${key}`, 'g'), value)
    })
    return {
      ...renderedPath,
      url,
    }
  })
}
