import { getRoute } from '@wilson/client-utils'
import getTranslations from './get-translations'
import type { Languages, Translation } from '@wilson/types'

// TODO defaultContentLanguageInSubdir option

/**
 * Returns route path for a given page.
 * @param relativePath Relative path to the page
 */
export default function getRoutingInfo(
  relativePath: string,
  options: {
    defaultLanguage: string
    languages: Languages
    pagesDir: string
    replaceParams?: boolean
  },
): { route: string; translations: Set<Translation> } {
  const { defaultLanguage, languages, pagesDir, replaceParams = true } = options

  const route = getRoute(relativePath, {
    defaultLanguage,
    languages,
    replaceParams,
  })
  const translations = getTranslations(relativePath, {
    defaultLanguage,
    languages,
    pagesDir,
  })

  return { route, translations }
}
