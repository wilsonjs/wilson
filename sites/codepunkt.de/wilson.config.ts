import type { UserConfig } from 'wilson'
import { minify } from 'terser'

const darkModeScript = /* js */ `
  const colorModeStorageKey = '🌈'
  const preferDarkQuery = '(prefers-color-scheme:dark)'
  const mediaQueryList = window.matchMedia(preferDarkQuery)
  const supportsColorSchemeQuery = mediaQueryList.media === preferDarkQuery
  const persistedColorMode = localStorage.getItem(colorModeStorageKey)

  let colorMode = 'light'
  if (typeof persistedColorMode === 'string') {
    colorMode = persistedColorMode
  } else if (supportsColorSchemeQuery) {
    colorMode = mediaQueryList.matches ? 'dark' : 'light'
  }

  localStorage.setItem(colorModeStorageKey, colorMode)
  document.documentElement.setAttribute('data-mode', colorMode)
`

async function getHeadContent() {
  const output = await minify(darkModeScript, { toplevel: true })
  return `<script>${output.code}</script>`
}

export default {
  siteUrl: 'https://codepunkt.de/',
  site: {
    title: 'Wat the wat',
    description: 'Something something',
  },
  defaultContentLanguage: 'en',
  getHeadContent,
  languages: [
    [
      'en',
      {
        languageName: 'English',
        translationKeys: {
          'footer-about': 'Footer about',
          'menu-about': 'About me',
          'menu-home': 'Home',
          'menu-workshops': 'Workshops',
          'menu-writing': 'Writing',
        },
      },
    ],
    [
      'de',
      {
        languageName: 'Deutsch',
        translationKeys: {
          'footer-about': 'hoee?',
          'menu-about': 'Über mich',
          'menu-home': 'Startseite',
          'menu-workshops': 'Workshops',
          'menu-writing': 'Blog',
        },
      },
    ],
  ],
  extendFrontmatter() {},
} as UserConfig
