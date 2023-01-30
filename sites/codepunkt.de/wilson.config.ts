import type { PageFrontmatter, UserConfig } from 'wilson'
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

function hasOpengraphImage(frontmatter: PageFrontmatter): boolean {
  return (
    frontmatter.date &&
    frontmatter.meta.filename.startsWith('src/pages/writing/')
  )
}

const config: UserConfig = {
  url: 'https://codepunkt.de/',
  meta: {
    tags: (fm, canonical) => {
      const description = fm.description ?? 'Musings about web development and cloud technology'
      const ogImage = `${hasOpengraphImage(fm) ? canonical : 'https://codepunkt.de'}/og-image.jpg`

      return [
        { name: 'description', content: description },
        { name: 'color-scheme', content: 'dark light' },
        { name: 'og:title', content: fm.title },
        { name: 'og:description', content: description },
        { name: 'og:url', content: canonical },
        { name: 'og:image', content: ogImage },
        { name: 'og:image:secure_url', content: ogImage },
        { name: 'og:image:width', content: '1200' },
        { name: 'og:image:height', content: '630' },
        { name: 'og:site_name', content: 'Codepunkt' },
        { name: 'og:type', content: 'website' },
        { name: 'twitter:title', content: fm.title },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:creator', content: '@code_punkt' },
        { name: 'twitter:site', content: '@code_punkt' },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'msapplication-TileColor', content: '#00aba9' },
      ]
    },
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
    if (!hasOpengraphImage(frontmatter)) {
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
