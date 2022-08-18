import getTranslations from '../src/get-translations'
import glob from 'fast-glob'
import sinon from 'sinon'
import test from 'ava'
import { Languages } from '@wilson/types'

const pagesDir = '/codepunkt.de/src/pages'

test('constructs correct glob path', (t) => {
  const globMock = sinon.mock(glob)
  const globSpy = globMock.expects('sync').returns([])

  getTranslations('a.de.b/index.fr.tsx', {
    defaultLanguage: 'en',
    languages: [
      ['fr', { languageName: 'Français' }],
      ['en', { languageName: 'English' }],
    ] as Languages,
    pagesDir,
  })
  t.is(globSpy.callCount, 1)
  t.deepEqual(globSpy.getCall(0).args, [`${pagesDir}/a.de.b/index.*.tsx`])

  sinon.restore()
})

test('when no languages are defined, returns empty array', (t) => {
  t.deepEqual(
    getTranslations('index.tsx', {
      defaultLanguage: 'en',
      languages: [],
      pagesDir,
    }),
    [],
  )
})

test('when languages are defined, returns translations', (t) => {
  sinon
    .mock(glob)
    .expects('sync')
    .returns([
      `${pagesDir}/sub/index.de.tsx`,
      `${pagesDir}/sub/index.en.tsx`,
      `${pagesDir}/sub/index.fr.tsx`,
    ])

  t.deepEqual(
    getTranslations('sub/index.en.tsx', {
      defaultLanguage: 'en',
      languages: [
        ['de', { languageName: 'Deutsch' }],
        ['en', { languageName: 'English' }],
      ] as Languages,
      pagesDir,
    }),
    [
      { route: '/de/sub', languageName: 'Deutsch', languageId: 'de' },
      { route: '/sub', languageName: 'English', languageId: 'en' },
    ],
  )

  sinon.restore()
})

test('orders in configuration order', (t) => {
  sinon
    .mock(glob)
    .expects('sync')
    .atLeast(2)
    .returns([
      `${pagesDir}/sub/index.de.tsx`,
      `${pagesDir}/sub/index.en.tsx`,
      `${pagesDir}/sub/index.fr.tsx`,
    ])

  t.deepEqual(
    getTranslations('sub/index.en.tsx', {
      defaultLanguage: 'en',
      languages: [
        ['de', { languageName: 'Deutsch' }],
        ['en', { languageName: 'English' }],
      ] as Languages,
      pagesDir,
    }),
    [
      { route: '/de/sub', languageName: 'Deutsch', languageId: 'de' },
      { route: '/sub', languageName: 'English', languageId: 'en' },
    ],
  )

  t.deepEqual(
    getTranslations('sub/index.en.tsx', {
      defaultLanguage: 'en',
      languages: [
        ['en', { languageName: 'English' }],
        ['de', { languageName: 'Deutsch' }],
      ] as Languages,
      pagesDir,
    }),
    [
      { route: '/sub', languageName: 'English', languageId: 'en' },
      { route: '/de/sub', languageName: 'Deutsch', languageId: 'de' },
    ],
  )

  sinon.restore()
})
