import type { UserConfig } from 'wilson'
import { minify as minifyJs } from 'terser'
import { minify as minifyHtml } from 'html-minifier-terser'

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

const faviconHtml = /* html */ `
  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=1" />
  <link rel="icon" type="image/png" href="/favicon.png?v=1" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=1" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=1" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=1" />
  <link rel="manifest" href="/site.webmanifest?v=1" />
  <link rel="mask-icon" href="/safari-pinned-tab.svg?v=1" color="#286b10" />
  <meta name="msapplication-TileColor" content="#00aba9" />
  <meta name="theme-color" content="#ffffff" />
`

async function getAdditionalHeadContent() {
  const darkMode = await minifyJs(darkModeScript, { toplevel: true })
  const favIcon = await minifyHtml(faviconHtml, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyURLs: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
  })
  return /* html */ `${favIcon}<script>${darkMode.code}</script>`
}

const config: UserConfig = {
  siteUrl: 'https://codepunkt.de/',
  site: {
    description: 'Musings about web development and cloud technology',
    titleTemplate: '%s | Codepunkt',
  },
  defaultLanguage: 'en',
  languages: [
    [
      'en',
      {
        languageName: 'English',
        translationKeys: {
          'footer-about':
            'Helping teams deliver better products in less time by using web and cloud technologies.',
          'footer-copyright': 'All rights reserved',
          'menu-about': 'About me',
          'menu-home': 'Home',
          'menu-workshops': 'Workshops',
          'menu-writing': 'Writing',
          'select-language': 'Select language',
        },
      },
    ],
    [
      'de',
      {
        languageName: 'Deutsch',
        translationKeys: {
          'footer-about':
            'Ich helfe Software-Entwicklern dabei, in kürzerer Zeit bessere Produkte zu entwickeln.',
          'footer-copyright': 'Alle Rechte vorbehalten',
          'menu-about': 'Über mich',
          'menu-home': 'Startseite',
          'menu-workshops': 'Workshops',
          'menu-writing': 'Blog',
          'select-language': 'Sprache wählen',
        },
      },
    ],
  ],
  extendFrontmatter() {},
  getAdditionalHeadContent,
  createOpengraphImage: (frontmatter) => {
    if (
      !frontmatter.date ||
      !frontmatter.meta.filename.startsWith('src/pages/writing/')
    ) {
      return null
    }
    return {
      background: './src/assets/og-image-background.png',
      texts: [
        {
          text: frontmatter.title,
          color: '#ffffff',
          font: './src/assets/Montserrat-SemiBold.ttf',
          maxWidth: 700,
          maxHeight: 480,
          x: 50,
          y: 515,
          verticalAlign: 'bottom',
        },
        {
          text: 'Christoph Werner •',
          color: '#c6c5dd',
          fontSize: 32,
          font: './src/assets/OpenSans-Regular.ttf',
          maxWidth: 650,
          maxHeight: 50,
          x: 100,
          y: 580,
          verticalAlign: 'bottom',
        },
        {
          text: new Date(frontmatter.date).toLocaleDateString('en', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          color: '#ffffff',
          fontSize: 32,
          font: './src/assets/OpenSans-Regular.ttf',
          maxWidth: 432,
          maxHeight: 50,
          x: 318,
          y: 580,
          verticalAlign: 'bottom',
        },
      ],
    }
  },
  syntaxHighlighting: {
    theme: {
      default: 'Slack Theme Ochin',
      parentSelector: {
        'html[data-mode=dark]': 'Slack Theme Dark Mode',
      },
    },
    extensions: ['slack-theme', 'vscode-styled-components'],
    inlineCode: {
      marker: '•',
    },
    replaceColor: (oldColor) =>
      ({
        '#dcdcaa': '#b1bbf4',
      }[oldColor.toLowerCase()] || oldColor),
  },
}

export default config
