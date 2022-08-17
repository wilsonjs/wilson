import { Languages, Translation } from '@wilson/types'
import glob from 'fast-glob'
import { join, relative } from 'pathe'
import { getLanguage, getRoute } from '@wilson/client-utils'

export default function getTranslations(
  relativePath: string,
  options: {
    defaultLanguage: string
    languages: Languages
    pagesDir: string
  },
): Set<Translation> {
  const { defaultLanguage, languages, pagesDir } = options
  const languageIds = Object.keys(languages)
  const language = getLanguage(relativePath, languageIds)
  const result = new Set<Translation>()

  if (language === undefined) {
    return result
  }

  const globPattern = relativePath.replace(
    new RegExp(`^(?<before>.*\.)(${language})(?<after>\.[^.]+)$`),
    '$<before>*$<after>',
  )
  const files = glob.sync(join(pagesDir, globPattern))

  const translations = files
    .map((translation) => {
      const lang = getLanguage(translation, languageIds)!

      if (languageIds.includes(lang)) {
        const getRouteOpts = { defaultLanguage, languages }
        const route = getRoute(relative(pagesDir, translation), getRouteOpts)
        return { route, title: languages[lang].title }
      }

      return null
    })
    .filter(Boolean) as Translation[]

  return new Set(translations)
}
