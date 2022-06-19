import { FunctionComponent, VNode, Provider } from 'preact'
import { SiteData } from 'wilson'
import { Language } from './src/types'

export const routes: VNode[]
export const siteData: SiteData
export const Layout: FunctionComponent
export const pageData: { route: string; language?: string }[]
export const LanguageProvider: Provider<string | undefined>

/**
 * Returns the language code of the current page or undefined if the site is not internationalized.
 */
export const useCurrentLanguageCode: () => string | undefined

/**
 * Returns all languages configured for the current site, without translations.
 */
export const useAllLanguages: () => Array<Omit<Language, 'translations'>>

export const useTranslation: (identifier: string) => string
