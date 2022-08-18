import { Languages } from '@wilson/types'
import getLanguage from './get-language'

export function removeExtension(str: string): string {
  return str.slice(0, str.lastIndexOf('.'))
}

export function removeSlashWrap(str: string): string {
  return str.replace(/^\/|\/$/g, '')
}

export function prefixSlash(str: string): string {
  return '/' + str
}

export function prefixLanguage(
  str: string,
  languageId: string,
  defaultLanguage: string,
): string {
  const prefix = languageId === defaultLanguage ? '' : `${languageId}/`
  return removeSlashWrap(
    `${prefix}${str.replace(new RegExp(`\.${languageId}$`), '')}`,
  )
}

export function removeTrailingIndex(str: string): string {
  return removeSlashWrap(str.replace(/index$/, ''))
}

export function replaceParameters(str: string): string {
  return str
    .split('/')
    .map((part, i, arr) =>
      part.replace(/\[([^\]\/]+)\]/g, i === arr.length - 1 ? ':$1?' : ':$1'),
    )
    .join('/')
}

export default function getRoute(
  relativePath: string,
  options: {
    defaultLanguage: string
    languages: Languages
    replaceParams?: boolean
  },
): string {
  const { defaultLanguage, languages, replaceParams = true } = options
  const languageIds = languages.map(([id]) => id)

  const extension = relativePath.slice(relativePath.lastIndexOf('.'))
  const path =
    replaceParams && extension === '.tsx'
      ? replaceParameters(relativePath)
      : relativePath

  const toLowerCase = path.toLowerCase()
  const withoutExt = removeExtension(toLowerCase)
  const language = getLanguage(toLowerCase, languageIds)

  const route = prefixSlash(
    removeTrailingIndex(
      languageIds.length > 0 && language
        ? prefixLanguage(withoutExt, language, defaultLanguage)
        : withoutExt,
    ),
  )

  return route
}
