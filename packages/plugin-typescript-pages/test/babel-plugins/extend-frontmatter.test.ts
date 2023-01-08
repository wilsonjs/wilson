import { transformAsync } from '@babel/core'
import test from 'ava'
import plugin from '../../src/babel-plugins/extend-frontmatter'

test('throws when invoked with invalid options', async (t) => {
  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [plugin],
    }),
    { message: /Invalid plugin options/ },
  )

  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [[plugin, {}]],
    }),
    { message: /Invalid plugin options/ },
  )

  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [[plugin, { frontmatter: 42 }]],
    }),
    { message: /Invalid plugin options/ },
  )

  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [[plugin, { frontmatter: {} }]],
    }),
    { message: /Invalid plugin options/ },
  )

  await t.notThrowsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [[plugin, { frontmatter: { title: 'Blog' } }]],
    }),
  )
})

test('replaces frontmatter', async (t) => {
  const result = await transformAsync(`export const frontmatter = {}`, {
    plugins: [[plugin, { frontmatter: { title: 'Blog', foo: 'bar' } }]],
  })
  t.snapshot(result?.code)
})
