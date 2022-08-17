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
      plugins: [[plugin, { translations: [] }]],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.notThrowsAsync(
    transformAsync(`const getStaticPaths = () => {}`, {
      plugins: [[plugin, { translations: new Set() }]],
    }),
  )
})

test('throws when translations identifier already exists', async (t) => {
  await t.throwsAsync(
    transformAsync(`function translations() {}`, {
      plugins: [[plugin, { translations: new Set() }]],
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
            translations: new Set([
              { route: '/', title: 'Englisch' },
              { route: '/de', title: 'Deutsch' },
              { route: '/fr', title: 'Français' },
            ]),
          },
        ],
      ],
    },
  )
  t.snapshot(result?.code)
})
