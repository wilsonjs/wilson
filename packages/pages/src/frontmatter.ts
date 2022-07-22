import { promises as fs } from 'fs'
import { extname, relative } from 'pathe'
import type { PageFrontmatter, UserFrontmatter } from '@wilson/types'
import type { Options } from './types'
import { getFrontmatter as getTsxFrontmatter } from './typescript'
import { isObject } from './utils'

async function getMdFrontmatter(
  _absolutePath: string,
  _options: Options,
): Promise<UserFrontmatter> {
  // something something graymatter
  return {}
}

async function extractFrontmatter(
  absolutePath: string,
  options: Options,
): Promise<UserFrontmatter> {
  switch (extname(absolutePath)) {
    case '.tsx':
      return await getTsxFrontmatter(absolutePath, options)
    case '.md':
      return await getMdFrontmatter(absolutePath, options)
  }
  return {}
}

async function prepareFrontmatter(
  absolutePath: string,
  anyFrontmatter: UserFrontmatter,
  options: Options,
): Promise<PageFrontmatter> {
  const { meta: originalMeta, layout, ...frontmatter } = anyFrontmatter
  const meta = {
    filename: relative(options.root, absolutePath),
    lastUpdated: (await fs.stat(absolutePath)).mtime,
    ...(isObject(originalMeta) ? originalMeta : {}),
  }
  return { layout, meta, ...frontmatter }
}

export async function parseFrontmatter(
  absolutePath: string,
  options: Options,
): Promise<PageFrontmatter> {
  const anyFrontmatter = await extractFrontmatter(absolutePath, options)
  return await prepareFrontmatter(absolutePath, anyFrontmatter, options)
}
