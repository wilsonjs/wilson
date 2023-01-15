import test from 'ava'
import remarkParse from 'remark-parse'
import remarkToRehype from 'remark-rehype'
import remarkStringify from 'remark-stringify'
import rehypeRaw from 'rehype-raw'
import { unified } from 'unified'
import type { Processor } from 'unified'
import toJsx from '@mapbox/hast-util-to-jsx'
import remarkRelativeAssets, {
  replaceSimpleAttribute,
  replaceSrcSet,
} from '../../src/remark-plugins/relative-assets'

test('replaceSimpleAttribute helper works', async (t) => {
  let assetUrls1 = []
  let properties1 = { src: 'image.jpg' }
  replaceSimpleAttribute('src', assetUrls1, '_assetUrl_', properties1)
  await t.deepEqual(assetUrls1, ['image.jpg'])
  await t.deepEqual(properties1, { src: '_assetUrl_0' })

  let assetUrls2 = ['photo.jpg', 'image.jpg']
  let properties2 = { href: 'image.jpg' }
  replaceSimpleAttribute('href', assetUrls2, '_assetUrl_', properties2)
  await t.deepEqual(assetUrls2, ['photo.jpg', 'image.jpg'])
  await t.deepEqual(properties2, { href: '_assetUrl_1' })
})

test('replaceSrcSet helper works', async (t) => {
  let assetUrls1 = []
  let properties1 = { srcSet: 'a.jpg 480w, b.jpg 800w' }
  replaceSrcSet(assetUrls1, '_assetUrl_', properties1)
  await t.deepEqual(assetUrls1, ['a.jpg', 'b.jpg'])
  await t.deepEqual(properties1, {
    srcSet: '_assetUrl_0 480w, _assetUrl_1 800w',
  })

  let assetUrls2 = ['c.jpg', 'd.jpg', 'b.jpg']
  let properties2 = { srcSet: 'a.jpg 480w, b.jpg 800w' }
  replaceSrcSet(assetUrls2, '_assetUrl_', properties2)
  await t.deepEqual(assetUrls2, ['c.jpg', 'd.jpg', 'b.jpg', 'a.jpg'])
  await t.deepEqual(properties2, {
    srcSet: '_assetUrl_3 480w, _assetUrl_2 800w',
  })
})

const processor = unified()
  .use(remarkParse)
  // apply plugins that change MDAST
  .use(remarkStringify)
  .use(remarkToRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // apply plugins that change HAST and gather additional information
  .use(remarkRelativeAssets, { assetUrlPrefix: '_assetUrl_' })
  .use(function stringifyToJsx(this: Processor): void {
    this.Compiler = (tree: Node) => toJsx(tree)
  })

test('relativeAssets remark plugin', async (t) => {
  const result1 = await processor.process('![alt](./image.jpg)')
  t.is(result1.value, '<p><img src="_assetUrl_0" alt="alt" /></p>')
  t.deepEqual(result1.data, { assetUrls: ['./image.jpg'] })

  const result2 = await processor.process(
    '<img srcSet="./a.jpg 480w, ./b.jpg 800w" />',
  )
  t.is(result2.value, '<img srcSet="_assetUrl_0 480w, _assetUrl_1 800w" />')
  t.deepEqual(result2.data, { assetUrls: ['./a.jpg', './b.jpg'] })
})
