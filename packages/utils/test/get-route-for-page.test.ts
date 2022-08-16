import getRouteForPage from '../src/get-route-for-page'
import test from 'ava'

test('works for index files', (t) => {
  t.is(getRouteForPage('index.tsx', {}), '/')
  t.is(getRouteForPage('blog/index.tsx', {}), '/blog')
})

test('works for files that have a language code suffix', (t) => {
  t.is(
    getRouteForPage('index.en.tsx', {
      defaultContentLanguage: 'de',
      languages: { de: {}, en: {} },
    }),
    '/en',
  )

  t.is(
    getRouteForPage('index.en.tsx', {
      defaultContentLanguage: 'en',
      languages: { de: {}, en: {} },
    }),
    '/',
  )
})

test('works for dynamic page files, replacing parameters', (t) => {
  t.is(getRouteForPage('blog/[pagination].tsx', {}), '/blog/:pagination?')
  t.is(
    getRouteForPage('blog/[tag]/[pagination].tsx', {}),
    '/blog/:tag/:pagination?',
  )
})

test('works for dynamic page files without replacing parameters', (t) => {
  t.is(
    getRouteForPage('blog/[pagination].tsx', { replaceParams: false }),
    '/blog/[pagination]',
  )
  t.is(
    getRouteForPage('blog/[tag]/[pagination].tsx', { replaceParams: false }),
    '/blog/[tag]/[pagination]',
  )
})
