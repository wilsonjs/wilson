import type { Document } from '@wilson/types'

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

export { useTitle } from 'hoofd/preact'

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
