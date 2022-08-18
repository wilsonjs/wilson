import getLanguage from '../src/get-language'
import test from 'ava'

test('finds language from page path', (t) => {
  t.is(getLanguage('blog/post.tsx', ['en', 'de']), undefined)
  t.is(getLanguage('blog/post.en.tsx', ['en', 'de']), 'en')
  t.is(getLanguage('blog/post.en.tsx', ['fr', 'de']), undefined)
  t.is(getLanguage('blog/[pagination].en.tsx', ['fr', 'de']), undefined)
  t.is(getLanguage('blog/[pagination].en.tsx', ['en', 'de']), 'en')
  t.is(getLanguage('blog/:pagination?.fr.tsx', ['en', 'fr']), 'fr')
  t.is(getLanguage(':foo/rofl.en.haha.en.tsx', ['en', 'fr']), 'en')
})
