import fs from 'fs'
import { relative } from 'pathe'
import type {
  PageFrontmatter,
  SiteConfig,
  UserFrontmatter,
} from '@wilson/types'

import utils from './utils'

/**
 * Enriches user frontmatter with meta data and anything added by `extendFrontmatter`.
 *
 * @param userFrontmatter User frontmatter
 * @param absolutePagePath Absolute path to page file
 * @param config Site configuration
 *
 * @returns Page frontmatter
 */
export default async function userToPageFrontmatter(
  userFrontmatter: UserFrontmatter,
  absolutePagePath: string,
  { root, extendFrontmatter }: Pick<SiteConfig, 'root' | 'extendFrontmatter'>,
): Promise<PageFrontmatter> {
  const filename = relative(root, absolutePagePath)

  const extended: UserFrontmatter =
    (await extendFrontmatter(filename, userFrontmatter)) ?? userFrontmatter

  const { meta: originalMeta, layout: fmLayout, ...rest } = extended
  const layout: string = typeof fmLayout === 'string' ? fmLayout : 'default'

  const meta = {
    filename,
    lastUpdated: fs.statSync(absolutePagePath).mtime,
    ...(utils.isObject(originalMeta) ? originalMeta : {}),
  }

  return { layout, meta, ...rest }
}
