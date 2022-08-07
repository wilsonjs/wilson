import { Page } from '@wilson/types'

export type {
  StaticPageProps,
  DynamicPageProps,
  GetRenderedPathsResult,
  PageFrontmatter,
  UserConfig,
} from '@wilson/types'

export { useTitle } from 'hoofd/preact'

export function getPages(pagePathOrPattern?: string): Page[] {
  return []
}
