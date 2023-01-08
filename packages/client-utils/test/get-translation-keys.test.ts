import type { Languages } from '@wilson/types'
import test from 'ava'
import getTranslationKeys from '../src/get-translation-keys'

const options = [
  [
    [
      'en',
      { languageName: 'Englisch', translationKeys: { foo: 'englisch bar' } },
    ],
    [
      'fr',
      { languageName: 'Français', translationKeys: { foo: 'français bar' } },
    ],
  ],
  'en',
] as [Languages, string]

const undefinedDefaultLanguage = [options[0], 'de'] as [Languages, string]

test('returns translation keys for page path', (t) => {
  t.deepEqual(getTranslationKeys('blog/post.tsx', ...options).translationKeys, {
    foo: 'englisch bar',
  })
  t.deepEqual(
    getTranslationKeys('blog/post.fr.tsx', ...options).translationKeys,
    { foo: 'français bar' },
  )
  t.deepEqual(
    getTranslationKeys('blog/post.de.tsx', ...options).translationKeys,
    { foo: 'englisch bar' },
  )
  t.deepEqual(
    getTranslationKeys('blog/post.tsx', ...undefinedDefaultLanguage)
      .translationKeys,
    {},
  )
})
