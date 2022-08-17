import { transformAsync } from '@babel/core'
import plugin from '../../src/babel-plugins/add-static-paths'
import test from 'ava'

test('throws when invoked with invalid options', async (t) => {
  await t.throwsAsync(
    transformAsync(`export const getStaticPaths = () => {}`, {
      plugins: [plugin],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.throwsAsync(
    transformAsync(`export const getStaticPaths = () => {}`, {
      plugins: [[plugin, {}]],
    }),
    { message: new RegExp('Invalid plugin options') },
  )
})

test('throws when getStaticPaths is missing or not exported', async (t) => {
  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [
        [
          plugin,
          {
            relativePath: 'blog/[pagination].tsx',
            defaultLanguage: 'en',
            languages: {},
          },
        ],
      ],
    }),
    { message: new RegExp('Dynamic pages must export "getStaticPaths"!') },
  )

  await t.throwsAsync(
    transformAsync(`const getStaticPaths = () => {}`, {
      plugins: [
        [
          plugin,
          {
            relativePath: 'blog/[pagination].tsx',
            defaultLanguage: 'en',
            languages: {},
          },
        ],
      ],
    }),
    { message: new RegExp('Dynamic pages must export "getStaticPaths"!') },
  )
})

test('adds staticPaths after getStaticPaths', async (t) => {
  const result = await transformAsync(
    `console.log('foo');export const getStaticPaths = () => {};console.log('bar');`,
    {
      plugins: [
        [
          plugin,
          {
            relativePath: 'blog/[pagination].tsx',
            defaultLanguage: 'en',
            languages: {
              de: { title: 'Deutsch' },
              en: { title: 'Englisch' },
              fr: { title: 'Français' },
            },
          },
        ],
      ],
    },
  )
  t.snapshot(result?.code)
})
