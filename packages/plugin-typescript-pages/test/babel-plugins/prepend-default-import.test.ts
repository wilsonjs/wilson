import { transformAsync } from '@babel/core'
import plugin from '../../src/babel-plugins/prepend-default-import'
import test from 'ava'

test('throws when invoked with insufficient options', async (t) => {
  await t.throwsAsync(transformAsync('', { plugins: [plugin] }), {
    message: new RegExp('options.importIdentifier is required!'),
  })

  await t.throwsAsync(transformAsync('', { plugins: [[plugin, {}]] }), {
    message: new RegExp('options.importIdentifier is required!'),
  })

  await t.throwsAsync(
    transformAsync('', { plugins: [[plugin, { importSource: 'fs' }]] }),
    { message: new RegExp('options.importIdentifier is required!') },
  )

  await t.throwsAsync(
    transformAsync('', { plugins: [[plugin, { importIdentifier: 'foo' }]] }),
    { message: new RegExp('options.importSource is required!') },
  )

  await t.notThrowsAsync(
    transformAsync('', {
      plugins: [[plugin, { importIdentifier: 'fs', importSource: 'fs' }]],
    }),
  )
})

test('prepends a default import', async (t) => {
  const transformResult = await transformAsync(
    `console.log('Hello world');export const foo = 'bar';`,
    { plugins: [[plugin, { importIdentifier: 'fs', importSource: 'fs' }]] },
  )
  t.snapshot(transformResult?.code)
})

test('throws when the exported identifier already exists', async (t) => {
  await t.throwsAsync(
    transformAsync(`const fs = [];`, {
      plugins: [[plugin, { importIdentifier: 'fs', importSource: 'fs' }]],
    }),
    { message: new RegExp('Top-level identifier "fs" already exists!') },
  )
})
