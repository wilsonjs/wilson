/**
 * Returns if a path has dynamic parts.
 *
 * As an example, `foo/bar` is not dynamic while `blog/[page]` is.
 */
export default function isDynamicPagePath(path: string) {
  return /\[[^\]]+\]/.test(path)
}
