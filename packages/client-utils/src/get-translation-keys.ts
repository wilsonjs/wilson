import type { Languages } from '@wilson/types'
import getLanguage from './get-language'

export default function getTranslationKeys(
  path: string,
  languages: Languages,
  defaultLanguage: string,
): { languageId: string; translationKeys: Record<string, string> } {
  const languageId =
    getLanguage(
      path,
      languages.map(([id]) => id),
    ) ?? defaultLanguage

  const language = languages.find(([id]) => id === languageId)
  const translationKeys = language ? language[1].translationKeys : {}

  return { languageId, translationKeys }
}
