import { promises as fs } from 'fs'
import { extname, relative } from 'pathe'
import type {
  PageFrontmatter,
  SiteConfig,
  UserFrontmatter,
} from '@wilson/types'
import { getFrontmatter as getTsxFrontmatter } from './typescript'
import { isObject } from '@wilson/utils'
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

async function prepareFrontmatter(
  absolutePath: string,
  userFrontmatter: UserFrontmatter,
  config: SiteConfig,
): Promise<PageFrontmatter> {
  const extendedFrontmatter = await config.extendFrontmatter(
    userFrontmatter,
    relative(config.root, absolutePath),
  )
  const {
    meta: originalMeta,
    layout: fmLayout,
    ...rest
  } = extendedFrontmatter ?? {}
  const layout: string | undefined =
    typeof fmLayout === 'string' ? fmLayout : undefined
  const meta = {
    filename: relative(config.root, absolutePath),
    lastUpdated: (await fs.stat(absolutePath)).mtime,
    ...(isObject(originalMeta) ? originalMeta : {}),
  }
  const frontmatter = { layout, meta, ...rest }
  return frontmatter
}

export async function parseFrontmatter(
  absolutePath: string,
  config: SiteConfig,
): Promise<PageFrontmatter> {
  const anyFrontmatter = await extractFrontmatter(absolutePath, config)
  return await prepareFrontmatter(absolutePath, anyFrontmatter, config)
}
