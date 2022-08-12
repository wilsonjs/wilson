import { promises as fs } from 'fs'
import { extname } from 'pathe'
import type {
  PageFrontmatter,
  SiteConfig,
  UserFrontmatter,
} from '@wilson/types'
import { getFrontmatter as getTsxFrontmatter } from './typescript'
import { userToPageFrontmatter } from '@wilson/utils'
import { parseFrontmatter as parseMarkdownFrontmatter } from '@wilson/markdown'

async function getMdFrontmatter(
  absolutePath: string,
): Promise<UserFrontmatter> {
  const code = await fs.readFile(absolutePath, 'utf-8')
  return parseMarkdownFrontmatter(code).frontmatter
}

async function extractFrontmatter(
  absolutePath: string,
  config: SiteConfig,
): Promise<UserFrontmatter> {
  switch (extname(absolutePath)) {
    case '.tsx':
      return await getTsxFrontmatter(absolutePath, config)
    case '.md':
      return await getMdFrontmatter(absolutePath)
  }
  return {}
}

export async function parseFrontmatter(
  absolutePath: string,
  config: SiteConfig,
): Promise<PageFrontmatter> {
  const anyFrontmatter = await extractFrontmatter(absolutePath, config)
  return await userToPageFrontmatter(anyFrontmatter, absolutePath, config)
}
