import { transformAsync } from '@babel/core'
import plugin from '../../src/babel-plugins/prepend-imports'
import test from 'ava'

test('throws when invoked with insufficient options', async (t) => {
  await t.throwsAsync(transformAsync('', { plugins: [plugin] }), {
    message: new RegExp('options.imports is required!'),
  })

  await t.throwsAsync(transformAsync('', { plugins: [[plugin, {}]] }), {
    message: new RegExp('options.imports is required!'),
  })

  await t.throwsAsync(
    transformAsync('', { plugins: [[plugin, { imports: {} }]] }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.notThrowsAsync(
    transformAsync('', { plugins: [[plugin, { imports: [] }]] }),
  )

  await t.throwsAsync(
    transformAsync('', {
      plugins: [[plugin, { imports: [{ source: 'fs' }] }]],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.throwsAsync(
    transformAsync('', {
      plugins: [[plugin, { imports: [{ identifiers: [], source: 'fs' }] }]],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.throwsAsync(
    transformAsync('', {
      plugins: [
        [
          plugin,
          { imports: [{ identifiers: [{ default: true }], source: 'fs' }] },
        ],
      ],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.notThrowsAsync(
    transformAsync('', {
      plugins: [
        [
          plugin,
          {
            imports: [
              { identifiers: [{ default: true, name: 'fs' }], source: 'fs' },
            ],
          },
        ],
      ],
    }),
  )

  await t.throwsAsync(
    transformAsync('', {
      plugins: [
        [
          plugin,
          {
            imports: [{ identifiers: [{ default: false }], source: 'fs' }],
          },
        ],
      ],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.throwsAsync(
    transformAsync('', {
      plugins: [
        [
          plugin,
          {
            imports: [
              { identifiers: [{ default: false, alias: 'fs' }], source: 'fs' },
            ],
          },
        ],
      ],
    }),
    { message: new RegExp('Invalid plugin options') },
  )

  await t.notThrowsAsync(
    transformAsync('', {
      plugins: [
        [
          plugin,
          {
            imports: [
              {
                identifiers: [
                  { default: false, name: 'promises', alias: 'fs' },
                ],
                source: 'fs',
              },
            ],
          },
        ],
      ],
    }),
  )
})

test('throws when the exported identifier already exists', async (t) => {
  await t.throwsAsync(
    transformAsync(`const fs = [];`, {
      plugins: [
        [
          plugin,
          {
            imports: [
              { identifiers: [{ default: true, name: 'fs' }], source: 'fs' },
            ],
          },
        ],
      ],
    }),
    { message: new RegExp('Top-level identifier "fs" already exists!') },
  )

  await t.throwsAsync(
    transformAsync(`const promises = [];`, {
      plugins: [
        [
          plugin,
          {
            imports: [
              {
                identifiers: [{ default: false, name: 'promises' }],
                source: 'fs',
              },
            ],
          },
        ],
      ],
    }),
    { message: new RegExp('Top-level identifier "promises" already exists!') },
  )

  await t.throwsAsync(
    transformAsync(`const fs = [];`, {
      plugins: [
        [
          plugin,
          {
            imports: [
              {
                identifiers: [
                  { default: false, name: 'promises', alias: 'fs' },
                ],
                source: 'fs',
              },
            ],
          },
        ],
      ],
    }),
    { message: new RegExp('Top-level identifier "fs" already exists!') },
  )
})

test('prepends imports when no other imports exist', async (t) => {
  const defaultImportResult = await transformAsync(
    `console.log('Hello world');export const foo = 'bar';`,
    {
      plugins: [
        [
          plugin,
          {
            imports: [
              { identifiers: [{ default: true, name: 'fs' }], source: 'fs' },
            ],
          },
        ],
      ],
    },
  )
  t.snapshot(defaultImportResult?.code)

  const namedImportResult = await transformAsync(
    `console.log('Hello world');export const foo = 'bar';`,
    {
      plugins: [
        [
          plugin,
          {
            imports: [
              {
                identifiers: [{ default: false, name: 'promises' }],
                source: 'fs',
              },
            ],
          },
        ],
      ],
    },
  )
  t.snapshot(namedImportResult?.code)

  const namedAliasImportResult = await transformAsync(
    `console.log('Hello world');export const foo = 'bar';`,
    {
      plugins: [
        [
          plugin,
          {
            imports: [
              {
                identifiers: [
                  { default: false, name: 'promises', alias: 'fs' },
                ],
                source: 'fs',
              },
            ],
          },
        ],
      ],
    },
  )
  t.snapshot(namedAliasImportResult?.code)

  const multipleImportsResult = await transformAsync(
    `console.log('Hello world');export const foo = 'bar';`,
    {
      plugins: [
        [
          plugin,
          {
            imports: [
              {
                identifiers: [
                  { default: true, name: 'fs' },
                  { default: false, name: 'promises', alias: 'asyncfs' },
                  { default: false, name: 'fstat' },
                ],
                source: 'fs',
              },
            ],
          },
        ],
      ],
    },
  )
  t.snapshot(multipleImportsResult?.code)
})

test('appends imports after existing imports', async (t) => {
  const multipleImportsResult = await transformAsync(
    `import { resolve } from 'path';export const foo = 'bar';`,
    {
      plugins: [
        [
          plugin,
          {
            imports: [
              {
                identifiers: [
                  { default: true, name: 'fs' },
                  { default: false, name: 'promises', alias: 'asyncfs' },
                  { default: false, name: 'fstat' },
                ],
                source: 'fs',
              },
            ],
          },
        ],
      ],
    },
  )
  t.snapshot(multipleImportsResult?.code)
})
