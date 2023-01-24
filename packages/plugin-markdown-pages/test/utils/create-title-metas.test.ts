import test from 'ava'
import utils from '../../src/utils/index'

test('works when using template', (t) => {
  t.is(
    utils.createTitleMetas('Nice title', {
      titleMeta: { properties: ['og:title'], useTemplate: true },
      titleTemplate: '%s - Foo',
    }),
    `{ property: 'og:title', content: 'Nice title - Foo' }`,
  )
})

test('works when not using template', (t) => {
  t.is(
    utils.createTitleMetas('Nice title', {
      titleMeta: {
        properties: ['og:title', 'twitter:title'],
        useTemplate: false,
      },
      titleTemplate: '%s - Foo',
    }),
    `{ property: 'og:title', content: 'Nice title' },
{ property: 'twitter:title', content: 'Nice title' }`,
  )
})
