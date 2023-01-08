import { transformAsync } from '@babel/core'
import test from 'ava'
import plugin from './../../src/babel-plugins/parse-frontmatter'

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
})

test('throws when frontmatter is not exported', async (t) => {
  await t.throwsAsync(
    transformAsync(
      `export default function Page() { return <h1>My page</h1> }`,
      { plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]] },
    ),
    { message: /Pages must export "frontmatter"!/ },
  )

  await t.throwsAsync(
    transformAsync(`const frontmatter = { title: 'Blog' }`, {
      plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]],
    }),
    { message: /Pages must export "frontmatter"!/ },
  )

  await t.notThrowsAsync(
    transformAsync(`export const frontmatter = { title: 'Blog' }`, {
      plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]],
    }),
  )
})

test("throws when frontmatter doesn't include title", async (t) => {
  await t.throwsAsync(
    transformAsync(`export const frontmatter = { layout: 'widescreen' }`, {
      plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]],
    }),
    { message: /Page frontmatter does not include "title"!/ },
  )
})

test('throws when frontmatter includes illegal types', async (t) => {
  await t.throwsAsync(
    transformAsync(`export const frontmatter = { fn: () => {} }`, {
      plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]],
    }),
    {
      message:
        /Frontmatter export must be JSON. Illegal ArrowFunctionExpression found!/,
    },
  )

  await t.throwsAsync(
    transformAsync(
      `const foo = 'bar'; export const frontmatter = { [foo]: 42 }`,
      { plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]] },
    ),
    {
      message:
        /Frontmatter export must be JSON. Illegal computed ObjectProperty found!/,
    },
  )

  await t.throwsAsync(
    transformAsync(
      `const foo = 'bar'; export const frontmatter = { templateLiteral: \`hi \$\{foo\}\` }`,
      { plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]] },
    ),
    {
      message:
        /Frontmatter export must be JSON. Illegal Identifier "foo" found in TemplateLiteral/,
    },
  )

  await t.throwsAsync(
    transformAsync(
      `const foo = 'bar'; export const frontmatter = { id: foo }`,
      { plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]] },
    ),
    {
      message:
        /Frontmatter export must be JSON. Illegal Identifier "foo" in ObjectProperty found!/,
    },
  )

  await t.throwsAsync(
    transformAsync(
      `const foo = 'bar'; export const frontmatter = { arr: [ foo ] }`,
      { plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]] },
    ),
    {
      message:
        /Frontmatter export must be JSON. Illegal Identifier "foo" in ArrayExpression found!/,
    },
  )

  await t.throwsAsync(
    transformAsync(`export const frontmatter = { notDefined: undefined }`, {
      plugins: ['@babel/plugin-syntax-jsx', [plugin, { frontmatter: {} }]],
    }),
    {
      message:
        /Frontmatter export must be JSON. Illegal Identifier "undefined" in ObjectProperty found!/,
    },
  )

  await t.notThrowsAsync(
    transformAsync(
      `export const frontmatter: UserFrontmatter = { title: "it's fine" }`,
      {
        plugins: [
          '@babel/plugin-syntax-jsx',
          '@babel/plugin-syntax-typescript',
          [plugin, { frontmatter: {} }],
        ],
      },
    ),
  )
})

test('stores frontmatter on plugin options object', async (t) => {
  const options: { frontmatter?: object } = { frontmatter: {} }
  await transformAsync(`export const frontmatter = { title: 'Blog' }`, {
    plugins: ['@babel/plugin-syntax-jsx', [plugin, options]],
  })
  t.deepEqual(options?.frontmatter, { title: 'Blog' })
})
