import { transformAsync } from '@babel/core'
import plugin from '../../src/babel-plugins/extend-frontmatter'
import test from 'ava'

test('throws when invoked with invalid options', async (t) => {
  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [plugin],
    }),
    { message: new RegExp('options.frontmatter is required!') },
  )

  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [[plugin, {}]],
    }),
    { message: new RegExp('options.frontmatter is required!') },
  )

  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [[plugin, { frontmatter: 42 }]],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [[plugin, { frontmatter: {} }]],
    }),
    { message: new RegExp('Invalid plugin options') },
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
