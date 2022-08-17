import { removeExtension } from './get-route'

// TODO write tests
export default function getLanguage(
  str: string,
  languageIds: string[],
): string | undefined {
  if (languageIds.length === 0) return
  const potentialLanguage = removeExtension(str).split('.').pop()!
  return languageIds.includes(potentialLanguage) ? potentialLanguage : undefined
}
