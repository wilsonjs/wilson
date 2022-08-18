import { transformAsync } from '@babel/core'
import plugin from '../../src/babel-plugins/add-translations'
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

  await t.throwsAsync(
    transformAsync(`export const frontmatter = {}`, {
      plugins: [[plugin, { translations: 'hello' }]],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.notThrowsAsync(
    transformAsync(`const getStaticPaths = () => {}`, {
      plugins: [[plugin, { translations: [] }]],
    }),
  )
})

test('throws when translations identifier already exists', async (t) => {
  await t.throwsAsync(
    transformAsync(`function translations() {}`, {
      plugins: [[plugin, { translations: [] }]],
    }),
    {
      message: new RegExp(
        'Top-level identifier "translations" already exists!',
      ),
    },
  )
})

test('adds translations array', async (t) => {
  const result = await transformAsync(
    `console.log('foo');export const getStaticPaths = () => {};console.log('bar');`,
    {
      plugins: [
        [
          plugin,
          {
            translations: [
              { route: '/', languageName: 'Englisch', languageId: 'en' },
              { route: '/de', languageName: 'Deutsch', languageId: 'de' },
              { route: '/fr', languageName: 'Français', languageId: 'fr' },
            ],
          },
        ],
      ],
    },
  )
  t.snapshot(result?.code)
})
