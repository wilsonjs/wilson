import { relative } from 'pathe'
import fs from 'fs'
import type {
  SiteConfig,
  UserFrontmatter,
  PageFrontmatter,
} from '@wilson/types'

/**
 * Check if variable is an object
 * @param maybeObject Variable that might be an object
 */
export function isObject(maybeObject: any): maybeObject is object {
  return (
    maybeObject !== null &&
    typeof maybeObject === 'object' &&
    !Array.isArray(maybeObject)
  )
}

/**
 * Check if file at given absolute path is a page.
 * @param absolutePath Path to the file
 * @param pagesDir Path to the pages directory
 * @param pageExtensions Array of valid page extensions
 */
export function isPage(
  absolutePath: string,
  pagesDir: string,
  pageExtensions: string[],
): boolean {
  return (
    absolutePath.startsWith(pagesDir) &&
    new RegExp(`(${pageExtensions.join('|')})$`).test(absolutePath)
  )
}

/**
 * Remove false, undefined and null from array.
 *
 * @param arr The array to remove from
 * @returns New array without false, undefined and null values
 */
export function compact<T>(arr: (false | undefined | null | T)[]): T[] {
  return arr.filter((x) => x) as T[]
}

/**
 * Creates a return value that is destructurable as both an object and an array.
 *
 * Usage example:
 *
 * ```ts
 * const obj = createDualUseDestructurable({ foo, bar } as const, [ foo, bar ] as const)
 * let { foo, bar } = obj
 * let [ foo, bar ] = obj
 * ```
 *
 * @param obj An object
 * @param arr An array
 * @returns Object that can also be destructured as an array
 */
export function createDualUseDestructurable<
  T extends Record<string, unknown>,
  A extends readonly any[],
>(obj: T, arr: A): T & A {
  const clone = { ...obj }

  Object.defineProperty(clone, Symbol.iterator, {
    enumerable: false,
    value() {
      let index = 0
      return {
        next: () => ({
          value: arr[index++],
          done: index > arr.length,
        }),
      }
    },
  })

  return clone as T & A
}

/**
 * Enriches user frontmatter with meta data and anything added by `extendFrontmatter`.
 *
 * @param userFrontmatter User frontmatter
 * @param absolutePagePath Absolute path to page file
 * @param config Site configuration
 *
 * @returns Page frontmatter
 */
export async function userToPageFrontmatter(
  userFrontmatter: UserFrontmatter,
  absolutePagePath: string,
  { root, extendFrontmatter }: SiteConfig,
): Promise<PageFrontmatter> {
  const filename = relative(root, absolutePagePath)

  const extended: UserFrontmatter =
    (await extendFrontmatter(filename, userFrontmatter)) ?? userFrontmatter

  const { meta: originalMeta, layout: fmLayout, ...rest } = extended
  const layout: string = typeof fmLayout === 'string' ? fmLayout : 'default'

  const meta = {
    filename,
    lastUpdated: fs.statSync(absolutePagePath).mtime,
    ...(isObject(originalMeta) ? originalMeta : {}),
  }

  return { layout, meta, ...rest }
}

/**
 * Returns if a path has dynamic parts.
 *
 * As an example, `foo/bar` is not dynamic while `blog/[page]` is.
 */
export function isDynamicPagePath(path: string) {
  return /\[[^\]]+\]/.test(path)
}

/**
 * Create a component name based on a route path.
 * @param path Route path
 * @returns Component name string
 */
export function createComponentName(path: string) {
  const withoutExtension = path.slice(0, path.lastIndexOf('.') + 1)
  const pascalCased = withoutExtension
    .split('/')
    .map((s) => s.split('.'))
    .flat()
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')

  const variablesReplaced = pascalCased.replace(
    /\[([^\]]+)\]/g,
    (_, match: string) =>
      `Dynamic${match.charAt(0).toUpperCase() + match.slice(1)}`,
  )

  const onlyAllowedChars = variablesReplaced.replace(/[^a-z0-9$_]/gi, '')

  return onlyAllowedChars.replace(
    /\$(.{1})/g,
    (s: string) => s.charAt(0) + s.charAt(1).toUpperCase(),
  )
}

export { default as getRoutingInfo } from './get-routing-info'
