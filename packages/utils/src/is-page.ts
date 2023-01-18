/**
 * Check if file at given absolute path is a page.
 *
 * @param absolutePath Path to the file
 * @param pagesDir Path to the pages directory
 * @param pageExtensions Array of valid page extensions
 */
export default function isPage(
  absolutePath: string,
  pagesDir: string,
  pageExtensions: string[],
): boolean {
  return (
    absolutePath.startsWith(pagesDir) &&
    new RegExp(`(${pageExtensions.join('|')})$`).test(absolutePath)
  )
}
