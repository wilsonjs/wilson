import getRoutingInfo from '../src/get-routing-info'
import sinon from 'sinon'
import test from 'ava'
import glob from 'fast-glob'

const pagesDir = '/codepunkt.de/src/pages'

test('returns correct paths for index files', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: {},
    pagesDir,
  }

  t.deepEqual(getRoutingInfo('index.tsx', options), {
    route: '/',
    translations: new Set(),
  })

  t.deepEqual(getRoutingInfo('blog/index.tsx', options), {
    route: '/blog',
    translations: new Set(),
  })
})

test('handles paths with language suffixes correctly', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: {
      de: { title: 'Deutsch' },
      en: { title: 'Englisch' },
      fr: { title: 'Français' },
    },
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
    translations: new Set([
      { route: '/', title: 'Englisch' },
      { route: '/de', title: 'Deutsch' },
      { route: '/fr', title: 'Français' },
    ]),
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
    translations: new Set([
      { route: '/blog', title: 'Englisch' },
      { route: '/de/blog', title: 'Deutsch' },
      { route: '/fr/blog', title: 'Français' },
    ]),
  })
  sinon.restore()
})

test('handles paths with language suffixes correctly without any defined languages', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: {},
    pagesDir,
  }

  t.deepEqual(getRoutingInfo('index.en.tsx', options), {
    route: '/index.en',
    translations: new Set(),
  })
})

test('works for dynamic page files, replacing parameters', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: {},
    pagesDir,
  }

  t.deepEqual(getRoutingInfo('blog/[pagination].tsx', options), {
    route: '/blog/:pagination?',
    translations: new Set(),
  })
  t.deepEqual(getRoutingInfo('blog/[tag]/[pagination].tsx', options), {
    route: '/blog/:tag/:pagination?',
    translations: new Set(),
  })
})

test('works for dynamic page files without replacing parameters', (t) => {
  const options = {
    defaultLanguage: 'en',
    languages: {},
    pagesDir,
    replaceParams: false,
  }

  t.deepEqual(getRoutingInfo('blog/[pagination].tsx', options), {
    route: '/blog/[pagination]',
    translations: new Set(),
  })
  t.deepEqual(getRoutingInfo('blog/[tag]/[pagination].tsx', options), {
    route: '/blog/[tag]/[pagination]',
    translations: new Set(),
  })
})
