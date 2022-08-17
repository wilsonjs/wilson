import { UserConfig } from 'wilson'

export default {
  siteUrl: 'https://codepunkt.de/',
  site: {
    title: 'Wat the wat',
    description: 'Something something',
  },
  defaultContentLanguage: 'en',
  languages: {
    en: { title: 'English' },
    de: { title: 'Deutsch' },
  },
  extendFrontmatter(filename, frontmatter) {
    // frontmatter.layout = 'default'
  },
} as UserConfig
