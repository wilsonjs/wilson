import test from 'ava'
import utils from '../../src/utils/index'

test('creating description meta tags from frontmatter works', (t) => {
  t.is(
    utils.createDescriptionMetaTags(`Frontmatter's title`, {
      defaultDescription: 'Default description',
      descriptionMeta: { names: ['description'] },
    }),
    '{"name":"description","content":"Frontmatter\'s title"}',
  )
})

test('creating description meta tags from default description works', (t) => {
  t.is(
    utils.createDescriptionMetaTags(undefined, {
      defaultDescription: 'Default description',
      descriptionMeta: { names: ['description', 'og:description'] },
    }),
    `{"name":"description","content":"Default description"},
{"property":"og:description","content":"Default description"}`,
  )
})

test('creating static meta tags works', (t) => {
  t.is(
    utils.createStaticMetaTags({
      staticMeta: [
        { name: 'color-scheme', content: 'light dark' },
        { name: 'og:type', content: 'website' },
      ],
    }),
    `{"name":"color-scheme","content":"light dark"},
{"property":"og:type","content":"website"}`,
  )
})

test('creating title meta tags works when not using template', (t) => {
  t.is(
    utils.createTitleMetaTags('Nice title', {
      titleMeta: {
        names: ['og:title', 'twitter:title'],
        useTitleTemplate: false,
      },
      titleTemplate: '%s - Foo',
    }),
    `{"property":"og:title","content":"Nice title"},
{"name":"twitter:title","content":"Nice title"}`,
  )
})

test('creating title meta tags works when using template', (t) => {
  t.is(
    utils.createTitleMetaTags('Nice title', {
      titleMeta: { names: ['og:title'], useTitleTemplate: true },
      titleTemplate: '%s - Foo',
    }),
    '{"property":"og:title","content":"Nice title - Foo"}',
  )
})
