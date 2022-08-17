import getTranslations from '../src/get-translations'
import glob from 'fast-glob'
import sinon from 'sinon'
import test from 'ava'

const pagesDir = '/codepunkt.de/src/pages'

test('constructs correct glob path', (t) => {
  const globMock = sinon.mock(glob)
  const globSpy = globMock.expects('sync').returns([])

  getTranslations('a.de.b/index.fr.tsx', {
    defaultLanguage: 'en',
    languages: { en: { title: 'English' }, fr: { title: 'Français' } },
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
      languages: {},
      pagesDir,
    }),
    new Set(),
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
      languages: { en: { title: 'English' }, de: { title: 'Deutsch' } },
      pagesDir,
    }),
    new Set([
      { route: '/de/sub', title: 'Deutsch' },
      { route: '/sub', title: 'English' },
    ]),
  )

  sinon.restore()
})
