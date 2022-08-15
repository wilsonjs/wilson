import { transformAsync } from '@babel/core'
import plugin from '../../src/babel-plugins/extend-frontmatter'
import test from 'ava'

test('throws when invoked with insufficient options', async (t) => {
  await t.throwsAsync(
    transformAsync(`export const frontmatter = { title: 'Blog' }`, {
      plugins: [plugin],
    }),
    { message: new RegExp('options.frontmatter is required!') },
  )

  await t.throwsAsync(
    transformAsync(`export const frontmatter = { title: 'Blog' }`, {
      plugins: [[plugin, {}]],
    }),
    { message: new RegExp('options.frontmatter is required!') },
  )

  await t.throwsAsync(
    transformAsync(`export const frontmatter = { title: 'Blog' }`, {
      plugins: [[plugin, { frontmatter: 42 }]],
    }),
    { message: new RegExp('options.frontmatter must be an object!') },
  )

  await t.notThrowsAsync(
    transformAsync(`export const frontmatter = { title: 'Blog' }`, {
      plugins: [[plugin, { frontmatter: {} }]],
    }),
  )
})

test('replaces frontmatter', async (t) => {
  const result = await transformAsync(
    `export const frontmatter = { title: 'Blog' }`,
    { plugins: [[plugin, { frontmatter: { foo: 'bar' } }]] },
  )
  t.snapshot(result?.code)
})
