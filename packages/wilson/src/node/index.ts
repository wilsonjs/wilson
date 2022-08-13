import type { Document, PaginationHelper, UserFrontmatter } from '@wilson/types'

export type {
  StaticPageProps,
  DynamicPageProps,
  GetRenderedPathsResult,
  PageFrontmatter,
  UserConfig,
  Document,
  PaginationHelper,
  PropsWithPagination,
  GetRenderedPathsFn,
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

interface PaginateOptions {
  pageSize?: number
  param?: string
  format?: (pageNumber: number) => string
}

// TODO write comment
// TODO auto-adapt default param 'page' for pages with one dynamic parameter
export const paginate: PaginationHelper = (items, options) => {
  const format = options.format ?? ((no) => String(no))
  const pageSize = options.pageSize ?? 10
  const param = options.param ?? 'page'
  const toPath = (no: number) => (no === 1 ? '' : format(no))
  const pagesCount = Math.max(1, Math.ceil(items.length / pageSize))

  return Array.from({ length: pagesCount }, (val, i) => i + 1).map(
    (pageNumber) => {
      const firstItem = (pageNumber - 1) * pageSize
      return {
        params: { [param]: toPath(pageNumber) },
        props: {
          items: items.slice(firstItem, firstItem + pageSize),
          nextPage:
            pageNumber !== pagesCount
              ? '/blog/' + toPath(pageNumber + 1)
              : undefined,
          prevPage:
            pageNumber === 1 ? undefined : '/blog/' + toPath(pageNumber - 1),
        },
      }
    },
  )
}
