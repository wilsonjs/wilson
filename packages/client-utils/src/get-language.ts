import { removeExtension } from './get-route'

export default function getLanguage(
  path: string,
  languageIds: string[],
): string | undefined {
  if (languageIds.length === 0) return
  const potentialLanguage = removeExtension(path).split('.').pop()!
  return languageIds.includes(potentialLanguage) ? potentialLanguage : undefined
}
