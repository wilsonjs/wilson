import type { Document, PaginationHelper, UserFrontmatter } from '@wilson/types'

export type {
  StaticPageProps,
  DynamicPageProps,
  PageFrontmatter,
  UserConfig,
  Document,
  PaginationHelper,
  PropsWithPagination,
  GetStaticPaths,
  GetStaticPathsResult,
} from '@wilson/types'

/**
 * Used to access all files that are under the page directory or match a given
 * pattern.
 *
 * #### Examples
 *
 *  - `getDocuments()`
 *     .md and .mdx files in the page dir
 *
 *  - `getDocuments('blog')`
 *     .md and .mdx files in page dir subfolder "_blog_"
 *
 * @param pattern Pattern to match in the page directory
 * @returns An array of documents
 */
export function getDocuments(pattern?: string): Document[] {
  return []
}

/**
 * Creates a pagination helper function that is invoked with an array of
 * arbitrary items to paginate and a pagination options object that defines
 *
 * - The pagination page size
 * - The dynamic parameter in the page's filename that is used for pagination
 * - The formatter used to fill that dynamic parameter
 *
 * @param pageRelativePath Page path relative to the configured `pagesDir`
 * @returns Pagination helper function
 */
export function createPaginationHelper(
  pageRelativePath: string,
): PaginationHelper {
  const paramMatches = [...pageRelativePath.matchAll(/\[([^\]]+)\]/g)]
  const defaultParam = paramMatches.length === 1 ? paramMatches[0][1] : 'page'

  return (items, options) => {
    const pageSize = options.pageSize ?? 10
    const pagesCount = Math.max(1, Math.ceil(items.length / pageSize))
    const param = options.param ?? defaultParam
    const urlPrefix = `/${pageRelativePath}`
      .replace(new RegExp(`\\[${param}\\]`), '')
      .replace(/\/\//, '/')
      .replace(/\.[^.]+$/, '')

    return Array.from({ length: pagesCount }, (val, i) => i + 1).map(
      (pageNumber) => {
        const firstItem = (pageNumber - 1) * pageSize

        const nextPage =
          pageNumber !== pagesCount
            ? urlPrefix + options.format(pageNumber + 1)
            : undefined
        const prevPage =
          pageNumber === 1
            ? undefined
            : urlPrefix + options.format(pageNumber - 1)

        return {
          params: { [param]: options.format(pageNumber) },
          props: {
            items: items.slice(firstItem, firstItem + pageSize),
            nextPage: nextPage?.replace(/\/$/, ''),
            prevPage: prevPage?.replace(/\/$/, ''),
          },
        }
      },
    )
  }
}
