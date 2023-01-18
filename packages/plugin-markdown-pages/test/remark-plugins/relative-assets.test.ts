import test from 'ava'
import {
  replaceSimpleAttribute,
  replaceSrcSet,
} from '../../src/remark-plugins/relative-assets'
import processMarkdown from '../../src/utils/process-markdown'

test('replaceSimpleAttribute helper works', async (t) => {
  const assetUrls1 = []
  const properties1 = { src: 'image.jpg' }
  replaceSimpleAttribute('src', assetUrls1, properties1)
  await t.deepEqual(assetUrls1, ['image.jpg'])
  await t.deepEqual(properties1, { src: '_assetUrl_0' })

  const assetUrls2 = ['photo.jpg', 'image.jpg']
  const properties2 = { href: 'image.jpg' }
  replaceSimpleAttribute('href', assetUrls2, properties2)
  await t.deepEqual(assetUrls2, ['photo.jpg', 'image.jpg'])
  await t.deepEqual(properties2, { href: '_assetUrl_1' })
})

test('replaceSrcSet helper works', async (t) => {
  const assetUrls1 = []
  const properties1 = { srcSet: 'a.jpg 480w, b.jpg 800w' }
  replaceSrcSet(assetUrls1, properties1)
  await t.deepEqual(assetUrls1, ['a.jpg', 'b.jpg'])
  await t.deepEqual(properties1, {
    srcSet: '_assetUrl_0 480w, _assetUrl_1 800w',
  })

  const assetUrls2 = ['c.jpg', 'd.jpg', 'b.jpg']
  const properties2 = { srcSet: 'a.jpg 480w, b.jpg 800w' }
  replaceSrcSet(assetUrls2, properties2)
  await t.deepEqual(assetUrls2, ['c.jpg', 'd.jpg', 'b.jpg', 'a.jpg'])
  await t.deepEqual(properties2, {
    srcSet: '_assetUrl_3 480w, _assetUrl_2 800w',
  })
})

test('relativeAssets remark plugin', async (t) => {
  const result1 = await processMarkdown('# Headline\n![alt](./image.jpg)')
  t.is(
    result1.jsx,
    '<h1>Headline</h1>\n<p><img src="_assetUrl_0" alt="alt" /></p>',
  )
  t.deepEqual(result1.assetUrls, ['./image.jpg'])

  const result2 = await processMarkdown(
    '<img srcSet="./a.jpg 480w, ./b.jpg 800w" />',
  )
  t.is(result2.jsx, '<img srcSet="_assetUrl_0 480w, _assetUrl_1 800w" />')
  t.deepEqual(result2.assetUrls, ['./a.jpg', './b.jpg'])
})
