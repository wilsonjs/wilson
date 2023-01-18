/**
 * Create a component name based on a route path.
 * @param path Route path
 * @returns Component name string
 */
export default function createComponentName(path: string) {
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
