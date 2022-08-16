import z from 'zod'

const getRouteForPageOptions = z.object({
  defaultContentLanguage: z.string().min(2).optional(),
  languages: z.record(z.string(), z.object({})).optional(),
  replaceParams: z.boolean().optional(),
})

/**
 * Returns route path for a given page.
 * @param relativePath Relative path to the page
 */
export default function getRouteForPage(
  relativePath: string,
  {
    defaultContentLanguage,
    languages,
    replaceParams = true,
  }: z.infer<typeof getRouteForPageOptions>,
) {
  relativePath = replaceParams ? replaceParameters(relativePath) : relativePath
  const toLowerCase = relativePath.toLowerCase()
  const withoutExt = toLowerCase.slice(0, toLowerCase.lastIndexOf('.'))
  const languageSuffix = getLanguageSuffix(withoutExt, languages)

  return prefixSlash(
    removeTrailingIndex(
      languageSuffix
        ? prefixLanguage(withoutExt, languageSuffix, defaultContentLanguage)
        : withoutExt,
    ),
  )
}

export function replaceParameters(str: string): string {
  return str
    .split('/')
    .map((part, i, arr) =>
      part.replace(/\[([^\]\/]+)\]/g, i === arr.length - 1 ? ':$1?' : ':$1'),
    )
    .join('/')
}

export function removeTrailingIndex(str: string): string {
  return removeSlashWrap(str.replace(/index$/, ''))
}

export function removeSlashWrap(str: string): string {
  return str.replace(/^\/|\/$/g, '')
}

export function prefixSlash(str: string): string {
  return '/' + str
}

export function getLanguageSuffix(
  str: string,
  languages: z.infer<typeof getRouteForPageOptions>['languages'],
): string | undefined {
  const potentialLanguage = str.split('.').pop()!
  return languages && languages[potentialLanguage] !== undefined
    ? potentialLanguage
    : undefined
}

export function prefixLanguage(
  str: string,
  languageId: string,
  defaultContentLanguage: z.infer<
    typeof getRouteForPageOptions
  >['defaultContentLanguage'],
): string {
  const prefix = languageId === defaultContentLanguage ? '' : `${languageId}/`
  return removeSlashWrap(
    `${prefix}${str.replace(new RegExp(`\.${languageId}$`), '')}`,
  )
}
