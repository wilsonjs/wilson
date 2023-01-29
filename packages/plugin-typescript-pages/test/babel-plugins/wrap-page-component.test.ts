import { transformAsync } from '@babel/core'
import test from 'ava'
import plugin from '../../src/babel-plugins/wrap-page-component'

const defaultOptions = {
  componentName: 'Dynamic',
  frontmatter: { title: 'Hello world' },
  isDefaultLanguage: true,
  isDynamic: true,
  languageId: 'en',
  meta: {
    defaultDescription: 'Interesting test page',
    descriptionMeta: { names: ['description', 'og:description'] },
    staticMeta: [],
    titleMeta: { names: ['og:title'], useTitleTemplate: true },
    titleTemplate: '%s - Foo',
  },
  translationKeys: { foo: 'bar' },
}

test('throws when invoked with invalid options', async (t) => {
  await t.throwsAsync(
    transformAsync('export default function Page() {}', { plugins: [plugin] }),
    {
      message: /Invalid plugin options/,
    },
  )

  await t.throwsAsync(
    transformAsync('export default function Page() {}', {
      plugins: [[plugin, {}]],
    }),
    {
      message: /Invalid plugin options/,
    },
  )

  await t.throwsAsync(
    transformAsync('export default function Page() {}', {
      plugins: [[plugin, { isDynamic: true }]],
    }),
    { message: /Invalid plugin options/ },
  )

  await t.throwsAsync(
    transformAsync('export default function Page() {}', {
      plugins: [[plugin, { componentName: 'Foo' }]],
    }),
    { message: /Invalid plugin options/ },
  )

  await t.notThrowsAsync(
    transformAsync('export default function Page() {}', {
      plugins: [[plugin, defaultOptions]],
    }),
  )
})

test('throws without default export', async (t) => {
  await t.throwsAsync(
    transformAsync(`const foo = [];`, {
      plugins: [[plugin, defaultOptions]],
    }),
    {
      message:
        /No default export found. Page component must be exported as default!/,
    },
  )
})

test('throws when default export is not a function', async (t) => {
  await t.throwsAsync(
    transformAsync(`export default []`, {
      plugins: [[plugin, defaultOptions]],
    }),
    {
      message: /Default export must be FunctionDeclaration./,
    },
  )
})

test('wraps exported static page', async (t) => {
  const staticResult = await transformAsync(
    `export default function Page() { return <h1>Hello world</h1> }`,
    {
      plugins: [
        '@babel/plugin-syntax-jsx',
        [
          plugin,
          {
            ...defaultOptions,
            componentName: 'Static',
            frontmatter: {
              ...defaultOptions.frontmatter,
              description: 'Interesting test page',
            },
            isDynamic: false,
          },
        ],
      ],
    },
  )
  t.snapshot(staticResult?.code)
})

test('wraps exported dynamic page', async (t) => {
  const dynamicResult = await transformAsync(
    `export default function Page() { return <h1>Hello world</h1> }`,
    {
      plugins: [
        '@babel/plugin-syntax-jsx',
        [
          plugin,
          {
            ...defaultOptions,
            isDefaultLanguage: false,
            languageId: 'de',
            meta: {
              ...defaultOptions.meta,
              staticMeta: [
                { name: 'color-scheme', content: 'dark light' },
                { name: 'og:type', content: 'website' },
              ],
              titleMeta: {
                names: ['og:title', 'twitter:title'],
                useTitleTemplate: false,
              },
            },
          },
        ],
      ],
    },
  )
  t.snapshot(dynamicResult?.code)
})
