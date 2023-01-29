import test from 'ava'
import utils from '../../src/utils/index'

const createJsxArgs: Parameters<typeof utils.createJsx> = [
  '/Users/name/site/src/layouts/default.tsx',
  ['import _assetUrl_0 from "./hero.jpg"'],
  '/my-article',
  'de',
  {
    defaultLanguage: 'en',
    site: {
      defaultDescription: `An amazing site to test Wilson's abilities`,
      descriptionMeta: { names: ['description'] },
      staticMeta: [{ name: 'color-scheme', content: 'dark light' }],
      titleTemplate: '%s | Wilson Testsite',
      titleMeta: {
        names: ['og:title'],
        useTitleTemplate: false,
      },
    },
  },
  {
    title: 'Hello world',
    layout: 'default',
    meta: {
      filename: 'src/pages/my-article/index.md',
      lastUpdated: new Date(Date.UTC(2020, 10, 10, 10, 10, 10)),
    },
  },
  [],
  { 'footer-copyright': 'Alle Rechte vorbehalten' },
  'MyArticleIndex',
  '<div><h1>Hello world</h1><img src={_assetUrl_0} /></div>',
]

test('creates jsx for pages other than the default language', async (t) => {
  t.snapshot(utils.createJsx(...createJsxArgs))
})

test('creates jsx for default language pages', async (t) => {
  const args: Parameters<typeof utils.createJsx> = [...createJsxArgs]
  args.splice(3, 1, 'en')
  t.snapshot(utils.createJsx(...args))
})
