import { transformAsync } from '@babel/core'
import plugin from '../../src/babel-plugins/wrap-page-component'
import test from 'ava'

test('throws when invoked with invalid options', async (t) => {
  await t.throwsAsync(
    transformAsync('export default function Page() {}', { plugins: [plugin] }),
    {
      message: new RegExp('Invalid plugin options'),
    },
  )

  await t.throwsAsync(
    transformAsync('export default function Page() {}', {
      plugins: [[plugin, {}]],
    }),
    {
      message: new RegExp('Invalid plugin options'),
    },
  )

  await t.throwsAsync(
    transformAsync('export default function Page() {}', {
      plugins: [[plugin, { isDynamic: true }]],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.throwsAsync(
    transformAsync('export default function Page() {}', {
      plugins: [[plugin, { componentName: 'Foo' }]],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.notThrowsAsync(
    transformAsync('export default function Page() {}', {
      plugins: [[plugin, { componentName: 'Foo', isDynamic: true }]],
    }),
  )
})

test('throws without default export', async (t) => {
  await t.throwsAsync(
    transformAsync(`const foo = [];`, {
      plugins: [[plugin, { componentName: 'Foo', isDynamic: true }]],
    }),
    {
      message: new RegExp(
        'No default export found. Page component must be exported as default!',
      ),
    },
  )
})

test('throws when default export is not a function', async (t) => {
  await t.throwsAsync(
    transformAsync(`export default []`, {
      plugins: [[plugin, { componentName: 'Foo', isDynamic: true }]],
    }),
    {
      message: new RegExp('Default export must be FunctionDeclaration.'),
    },
  )
})

test('wraps exported page', async (t) => {
  const staticResult = await transformAsync(
    `export default function Page() { return <h1>Hello world</h1> }`,
    {
      plugins: [
        '@babel/plugin-syntax-jsx',
        [plugin, { componentName: 'Static', isDynamic: false }],
      ],
    },
  )
  t.snapshot(staticResult?.code)

  const dynamicResult = await transformAsync(
    `export default function Page() { return <h1>Hello world</h1> }`,
    {
      plugins: [
        '@babel/plugin-syntax-jsx',
        [plugin, { componentName: 'Dynamic', isDynamic: true }],
      ],
    },
  )
  t.snapshot(dynamicResult?.code)
})
