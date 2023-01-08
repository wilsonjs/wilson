import { transformAsync } from '@babel/core'
import test from 'ava'
import plugin from '../../src/babel-plugins/add-static-paths'

test('throws when invoked with invalid options', async (t) => {
  await t.throwsAsync(
    transformAsync(`export const getStaticPaths = () => {}`, {
      plugins: [plugin],
    }),
    { message: /Invalid plugin options/ },
  )

  await t.throwsAsync(
    transformAsync(`export const getStaticPaths = () => {}`, {
      plugins: [[plugin, {}]],
    }),
    { message: /Invalid plugin options/ },
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
            relativePagesDir: 'src/pages',
            defaultLanguage: 'en',
            defaultLanguageInSubdir: false,
            languages: [],
          },
        ],
      ],
    }),
    { message: /Dynamic pages must export "getStaticPaths"!/ },
  )

  await t.throwsAsync(
    transformAsync(`const getStaticPaths = () => {}`, {
      plugins: [
        [
          plugin,
          {
            relativePath: 'blog/[pagination].tsx',
            relativePagesDir: 'src/pages',
            defaultLanguage: 'en',
            defaultLanguageInSubdir: false,
            languages: [],
          },
        ],
      ],
    }),
    { message: /Dynamic pages must export "getStaticPaths"!/ },
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
            relativePagesDir: 'src/pages',
            defaultLanguage: 'en',
            defaultLanguageInSubdir: false,
            languages: [
              ['de', { languageName: 'Deutsch' }],
              ['en', { languageName: 'English' }],
              ['fr', { languageName: 'Français' }],
            ],
          },
        ],
      ],
    },
  )
  t.snapshot(result?.code)
})

test('provides getPages with import.meta.glob to getStaticPaths', async (t) => {
  const result = await transformAsync(
    `export const getStaticPaths = () => {
      return getPages('foo/**/*.*');
    };`,
    {
      plugins: [
        [
          plugin,
          {
            relativePath: 'blog/[pagination].tsx',
            relativePagesDir: 'src/pages',
            defaultLanguage: 'en',
            defaultLanguageInSubdir: false,
            languages: [
              ['de', { languageName: 'Deutsch' }],
              ['en', { languageName: 'English' }],
              ['fr', { languageName: 'Français' }],
            ],
          },
        ],
      ],
    },
  )
  t.snapshot(result?.code)
})
