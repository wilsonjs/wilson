import { getRoute } from '@wilson/client-utils'
import getTranslations from './get-translations'
import type { Languages, Translation } from '@wilson/types'

/**
 * Returns route path for a given page.
 * @param relativePath Relative path to the page
 */
export default function getRoutingInfo(
  relativePath: string,
  options: {
    defaultLanguage: string
    defaultLanguageInSubdir?: boolean
    languages: Languages
    pagesDir: string
    replaceParams?: boolean
  },
): { route: string; translations: Translation[] } {
  const {
    defaultLanguage,
    defaultLanguageInSubdir = false,
    languages,
    pagesDir,
    replaceParams = true,
  } = options

  const route = getRoute(relativePath, {
    defaultLanguage,
    defaultLanguageInSubdir,
    languages,
    replaceParams,
  })
  const translations = getTranslations(relativePath, {
    defaultLanguage,
    defaultLanguageInSubdir,
    languages,
    pagesDir,
  })

  return { route, translations }
}
