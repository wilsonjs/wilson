import { Languages, Translation } from '@wilson/types'
import glob from 'fast-glob'
import { join, relative } from 'pathe'
import { getLanguage, getRoute } from '@wilson/client-utils'

export default function getTranslations(
  relativePath: string,
  options: {
    defaultLanguage: string
    defaultLanguageInSubdir: boolean
    languages: Languages
    pagesDir: string
  },
): Translation[] {
  const { languages, pagesDir } = options
  const languageIds = languages.map(([id]) => id)
  const language = getLanguage(relativePath, languageIds)

  if (language === undefined) {
    return []
  }

  const globPattern = relativePath.replace(
    new RegExp(`^(?<before>.*\.)(${language})(?<after>\.[^.]+)$`),
    '$<before>*$<after>',
  )
  const files = glob.sync(join(pagesDir, globPattern))

  const translationsInGlobOrder = files
    .map((translation) => {
      const lang = getLanguage(translation, languageIds)!

      if (languageIds.includes(lang)) {
        const route = getRoute(relative(pagesDir, translation), options)
        return {
          route,
          languageId: lang,
          languageName: languages.find(([id]) => id === lang)![1].languageName,
        }
      }

      return null
    })
    .filter(Boolean) as Translation[]

  const translations: Translation[] = []

  // sort into languages configuration order
  for (const id of languageIds) {
    const matchingTranslation = translationsInGlobOrder.find(
      (t) => t.languageId === id,
    )
    translations.push(...(matchingTranslation ? [matchingTranslation] : []))
  }

  return translations
}
