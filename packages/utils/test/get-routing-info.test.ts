import getRoutingInfo from '../src/get-routing-info'
import sinon from 'sinon'
import test from 'ava'
import glob from 'fast-glob'
import { Languages } from '@wilson/types'

const pagesDir = '/codepunkt.de/src/pages'

test('returns correct paths for index files', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: [],
    pagesDir,
  }

  t.deepEqual(getRoutingInfo('index.tsx', options), {
    route: '/',
    translations: [],
  })

  t.deepEqual(getRoutingInfo('blog/index.tsx', options), {
    route: '/blog',
    translations: [],
  })
})

test('handles paths with language suffixes correctly', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: [
      ['de', { languageName: 'Deutsch' }],
      ['en', { languageName: 'English' }],
      ['fr', { languageName: 'Français' }],
    ] as Languages,
    pagesDir,
  }

  sinon
    .mock(glob)
    .expects('sync')
    .returns([
      `${pagesDir}/index.en.tsx`,
      `${pagesDir}/index.de.tsx`,
      `${pagesDir}/index.fr.tsx`,
    ])
  t.deepEqual(getRoutingInfo('index.en.tsx', options), {
    route: '/',
    translations: [
      { route: '/de', languageName: 'Deutsch', languageId: 'de' },
      { route: '/', languageName: 'English', languageId: 'en' },
      { route: '/fr', languageName: 'Français', languageId: 'fr' },
    ],
  })
  sinon.restore()

  sinon
    .mock(glob)
    .expects('sync')
    .returns([
      `${pagesDir}/blog/index.en.tsx`,
      `${pagesDir}/blog/index.de.tsx`,
      `${pagesDir}/blog/index.fr.tsx`,
    ])
  t.deepEqual(getRoutingInfo('blog/article.de.md', options), {
    route: '/de/blog/article',
    translations: [
      { route: '/de/blog', languageName: 'Deutsch', languageId: 'de' },
      { route: '/blog', languageName: 'English', languageId: 'en' },
      { route: '/fr/blog', languageName: 'Français', languageId: 'fr' },
    ],
  })
  sinon.restore()
})

test('handles paths with language suffixes correctly without any defined languages', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: [],
    pagesDir,
  }

  t.deepEqual(getRoutingInfo('index.en.tsx', options), {
    route: '/',
    translations: [],
  })
})

test('works for dynamic page files, replacing parameters', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: [],
    pagesDir,
  }

  t.deepEqual(getRoutingInfo('blog/[pagination].tsx', options), {
    route: '/blog/:pagination?',
    translations: [],
  })
  t.deepEqual(getRoutingInfo('blog/[tag]/[pagination].tsx', options), {
    route: '/blog/:tag/:pagination?',
    translations: [],
  })
})

test('works for dynamic page files without replacing parameters', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: [],
    pagesDir,
    replaceParams: false,
  }

  t.deepEqual(getRoutingInfo('blog/[pagination].tsx', options), {
    route: '/blog/[pagination]',
    translations: [],
  })
  t.deepEqual(getRoutingInfo('blog/[tag]/[pagination].tsx', options), {
    route: '/blog/[tag]/[pagination]',
    translations: [],
  })
})
