import type {
  DynamicPageExports,
  PaginationHelper,
  RenderedPath,
  StaticPageExports,
  UserFrontmatter,
} from '@wilson/types'
import { relative } from 'pathe'
import type { Options } from './types'
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
  options: Options,
): Promise<UserFrontmatter> {
  const { frontmatter } = await getPageExports<StaticPageExports>(
    options,
    absolutePath,
  )
  if (frontmatter !== undefined && !isObject(frontmatter)) {
    throw new Error(
      `page "${relative(
        options.pagesDir,
        absolutePath,
      )}" has frontmatter that is not an object`,
    )
  }
  return frontmatter ?? {}
}

const paginate: PaginationHelper = (items, options = {}) => {
  const format = options.format ?? ((no) => String(no))
  const pageSize = options.pageSize || 10
  const toPath = (no: number) => (no === 1 ? '' : format(no))
  const pagesCount = Math.max(1, Math.ceil(items.length / pageSize))

  return Array.from({ length: pagesCount }, (_, i) => i + 1).map(
    (pageNumber) => {
      const firstItem = (pageNumber - 1) * pageSize
      return {
        params: { page: toPath(pageNumber) },
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

export async function getRenderedPaths(
  options: Options,
  absolutePath: string,
  path: string,
  route: string,
): Promise<RenderedPath[]> {
  const { getRenderedPaths } = await getPageExports<DynamicPageExports>(
    options,
    absolutePath,
  )
  if (getRenderedPaths === undefined)
    throw new Error(`dynamic page "${path}" has no getRenderedPaths() export`)

  const renderedPaths = await getRenderedPaths({ paginate })
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
