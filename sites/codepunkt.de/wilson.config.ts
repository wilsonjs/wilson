import type { UserConfig } from 'wilson'

export default {
  siteUrl: 'https://codepunkt.de/',
  site: {
    title: 'Wat the wat',
    description: 'Something something',
  },
  defaultContentLanguage: 'en',
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
