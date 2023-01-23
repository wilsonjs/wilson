import { transformAsync } from '@babel/core'
import test from 'ava'
import plugin from '../../src/babel-plugins/wrap-page-component'

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
      plugins: [
        [
          plugin,
          {
            componentName: 'Foo',
            languageId: 'en',
            isDefaultLanguage: true,
            translationKeys: {},
            isDynamic: true,
            titleTemplate: '%s',
            description: 'Interesting test page',
          },
        ],
      ],
    }),
  )
})

test('throws without default export', async (t) => {
  await t.throwsAsync(
    transformAsync(`const foo = [];`, {
      plugins: [
        [
          plugin,
          {
            componentName: 'Foo',
            languageId: 'en',
            isDefaultLanguage: true,
            translationKeys: {},
            isDynamic: true,
            titleTemplate: '%s',
            description: 'Interesting test page',
          },
        ],
      ],
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
      plugins: [
        [
          plugin,
          {
            componentName: 'Foo',
            languageId: 'en',
            isDefaultLanguage: true,
            translationKeys: {},
            isDynamic: true,
            titleTemplate: '%s',
            description: 'Interesting test page',
          },
        ],
      ],
    }),
    {
      message: /Default export must be FunctionDeclaration./,
    },
  )
})

test('wraps exported page', async (t) => {
  const staticResult = await transformAsync(
    `export default function Page() { return <h1>Hello world</h1> }`,
    {
      plugins: [
        '@babel/plugin-syntax-jsx',
        [
          plugin,
          {
            componentName: 'Static',
            languageId: 'en',
            isDefaultLanguage: true,
            translationKeys: { foo: 'bar' },
            isDynamic: false,
            titleTemplate: '%s',
            description: 'Interesting test page',
          },
        ],
      ],
    },
  )
  t.snapshot(staticResult?.code)

  const dynamicResult = await transformAsync(
    `export default function Page() { return <h1>Hello world</h1> }`,
    {
      plugins: [
        '@babel/plugin-syntax-jsx',
        [
          plugin,
          {
            componentName: 'Dynamic',
            languageId: 'de',
            isDefaultLanguage: false,
            translationKeys: { bar: 'baz' },
            isDynamic: true,
            titleTemplate: '%s',
            description: 'Interesting test page',
          },
        ],
      ],
    },
  )
  t.snapshot(dynamicResult?.code)
})
