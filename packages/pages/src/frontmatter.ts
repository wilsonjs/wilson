import { promises as fs } from 'fs'
import { extname, relative } from 'pathe'
import type { PageFrontmatter, UserFrontmatter } from '@wilson/types'
import type { Options } from './types'
import { getFrontmatter as getTsxFrontmatter } from './typescript'
import { isObject } from '@wilson/utils'

// TODO: extendFrontmatter, for example to switch the layout
// of a 404 page inserted with extendRoutes away from default
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
  userFrontmatter: UserFrontmatter,
  options: Options,
): Promise<PageFrontmatter> {
  const extendedFrontmatter = await options.extendFrontmatter(
    userFrontmatter,
    relative(options.root, absolutePath),
  )
  const {
    meta: originalMeta,
    layout: fmLayout,
    ...rest
  } = extendedFrontmatter ?? {}
  const layout: string | undefined =
    typeof fmLayout === 'string' ? fmLayout : undefined
  const meta = {
    filename: relative(options.root, absolutePath),
    lastUpdated: (await fs.stat(absolutePath)).mtime,
    ...(isObject(originalMeta) ? originalMeta : {}),
  }
  const frontmatter = { layout, meta, ...rest }
  return frontmatter
}

export async function parseFrontmatter(
  absolutePath: string,
  options: Options,
): Promise<PageFrontmatter> {
  const anyFrontmatter = await extractFrontmatter(absolutePath, options)
  return await prepareFrontmatter(absolutePath, anyFrontmatter, options)
}
