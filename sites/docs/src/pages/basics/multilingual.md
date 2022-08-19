---
title: Multilingual Mode
---

Wilson supports the creation of websites with multiple languages side by side.

You should define the available languages in a `languages` section in your site configuration.

# Configure languages

```ts
import { UserConfig } from 'wilson'

export default {
  siteUrl: 'https://wilsonjs.com/',
  defaultContentLanguage: 'en',
  defaultContentLanguageInSubdir: true, // default: false
  disableLanguages: [], // useful when working on new languages, can't disable defaultContentLanguage
  languages: {
    en: {},
    de: {},
  },
} as UserConfig
```
