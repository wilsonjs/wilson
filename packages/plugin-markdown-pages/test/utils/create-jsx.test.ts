import test from 'ava'
import utils from '../../src/utils/index'

const createFinalJsxArgs: Parameters<typeof utils.createJsx> = [
  '/Users/name/site/src/layouts/default.tsx',
  ['import _assetUrl_0 from "./hero.jpg"'],
  '/my-article',
  'de',
  'en',
  {
    title: 'Hello world',
    layout: 'default',
    meta: {
      filename: 'src/pages/my-article/index.md',
      lastUpdated: new Date('10/15/2020'),
    },
  },
  [],
  { 'footer-copyright': 'Alle Rechte vorbehalten' },
  'MyArticleIndex',
  '<div><h1>Hello world</h1><img src={_assetUrl_0} /></div>',
]

test('createFinalJsx', async (t) => {
  t.snapshot(utils.createJsx(...createFinalJsxArgs))
})

test('createFinalJsx #2', async (t) => {
  const args: Parameters<typeof utils.createJsx> = [...createFinalJsxArgs]
  args.splice(3, 1, 'en')
  t.snapshot(utils.createJsx(...args))
})
