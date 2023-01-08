import { transformAsync } from '@babel/core'
import test from 'ava'
import plugin from '../../src/babel-plugins/add-named-string-export'

test('throws when invoked with invalid options', async (t) => {
  await t.throwsAsync(transformAsync('', { plugins: [plugin] }), {
    message: /Invalid plugin options/,
  })

  await t.throwsAsync(transformAsync('', { plugins: [[plugin, {}]] }), {
    message: /Invalid plugin options/,
  })

  await t.throwsAsync(
    transformAsync('', { plugins: [[plugin, { exportString: 'bar' }]] }),
    { message: /Invalid plugin options/ },
  )

  await t.throwsAsync(
    transformAsync('', {
      plugins: [[plugin, { exportIdentifier: 'foo' }]],
    }),
    { message: /Invalid plugin options/ },
  )

  await t.notThrowsAsync(
    transformAsync('', {
      plugins: [[plugin, { exportIdentifier: 'foo', exportString: 'bar' }]],
    }),
  )
})

test('prepends a named export to the first named export found', async (t) => {
  const result = await transformAsync(
    `console.log('Hello world');export const foo = 'bar';`,
    { plugins: [[plugin, { exportIdentifier: 'baz', exportString: 'qux' }]] },
  )
  t.snapshot(result?.code)
})

test('appends a named export if no other named export was found', async (t) => {
  const result = await transformAsync(`const errors = [];`, {
    plugins: [[plugin, { exportIdentifier: 'foo', exportString: 'bar' }]],
  })
  t.snapshot(result?.code)
})

test('throws when the exported identifier already exists', async (t) => {
  await t.throwsAsync(
    transformAsync(`const foo = [];`, {
      plugins: [[plugin, { exportIdentifier: 'foo', exportString: 'bar' }]],
    }),
    { message: /Top-level identifier "foo" already exists!/ },
  )
})
