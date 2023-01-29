/**
 * Returns if a `<meta>` tag name should be used in a meta tag with attribute
 * `property`.
 */
export default function isPropertyMeta(name: string): boolean {
  return name.startsWith('og:')
}
