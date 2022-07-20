import { basename, extname } from 'pathe'
import grayMatter from 'gray-matter'
// import { parse as parseSFC } from 'vue/compiler-sfc'

import type { RawFrontmatter } from './types'

const dateRegex = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<slug>.*)(?<ext>\.\w+)$/

export async function parseFrontmatter(
  filename: string,
  content: string,
  language?: string,
): Promise<RawFrontmatter> {
  try {
    const matter = grayMatter(content, { language }).data || {}
    return prepareFrontmatter(filename, matter)
  } catch (err: any) {
    err.message = `Invalid frontmatter for ${filename}\n${err.message}`
    throw err
  }
}

// Internal: Extracts layout, route, and meta data from the frontmatter.
function prepareFrontmatter(filename: string, matter: Record<string, any>): RawFrontmatter {
  let { templateAttrs, layout, meta: rawMeta, route, ...frontmatter } = matter

  // Users can explicitly provide route to avoid unwanted behavior.
  if (!route) {
    const { name, path, redirect, alias } = frontmatter
    route = clearUndefined({ name, path, redirect, alias, templateAttrs })
  }

  // Skip layout for non-HTML files, such as RSS feeds.
  if (layout === undefined) {
    const ext = extname(route.path) || '.html'
    layout = ext !== '.html' ? false : undefined
  }

  // Add filename, date, and id.
  const meta = { filename, ...rawMeta }
  const { year, month, day, slug } = extractGroups(basename(filename), dateRegex)
  if (slug) {
    meta.date = new Date(year, month - 1, day)
    meta.slug = slug
  }

  return { layout, meta, route, ...frontmatter }
}

/**
 * Clear undefined fields from an object. It mutates the object
 */
export function clearUndefined<T extends object>(obj: T): T {
  for (const key in obj) {
    if (obj[key] === undefined) delete obj[key]
  }
  return obj
}

function extractGroups(val: string, regex: RegExp): any {
  return (regex.exec(val)?.groups as any) || {}
}
