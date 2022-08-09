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
