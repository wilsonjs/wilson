import { transformAsync } from '@babel/core'
import test from 'ava'
import plugin from '../../src/babel-plugins/prepend-imports'

test('throws when invoked with invalid options', async (t) => {
  await t.throwsAsync(transformAsync('', { plugins: [plugin] }), {
    message: /Invalid plugin options/,
  })

  await t.throwsAsync(transformAsync('', { plugins: [[plugin, {}]] }), {
    message: /Invalid plugin options/,
  })

  await t.throwsAsync(
    transformAsync('', { plugins: [[plugin, { imports: {} }]] }),
    { message: /Invalid plugin options/ },
  )

  await t.notThrowsAsync(
    transformAsync('', { plugins: [[plugin, { imports: [] }]] }),
  )

  await t.throwsAsync(
    transformAsync('', {
      plugins: [[plugin, { imports: [{ source: 'fs' }] }]],
    }),
    { message: /Invalid plugin options/ },
  )

  await t.throwsAsync(
    transformAsync('', {
      plugins: [[plugin, { imports: [{ identifiers: [], source: 'fs' }] }]],
    }),
    { message: /Invalid plugin options/ },
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
    { message: /Invalid plugin options/ },
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
    { message: /Invalid plugin options/ },
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
    { message: /Invalid plugin options/ },
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
    { message: /Top-level identifier "fs" already exists!/ },
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
    { message: /Top-level identifier "promises" already exists!/ },
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
    { message: /Top-level identifier "fs" already exists!/ },
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
