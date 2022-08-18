import getRoute from '../src/get-route'
import test from 'ava'
import { Languages } from '@wilson/types'

const options = {
  defaultLanguage: 'en',
  languages: [
    ['en', { languageName: 'Englisch' }],
    ['fr', { languageName: 'Français' }],
  ] as Languages,
}
const noReplace = { ...options, replaceParams: false }
const noLanguages = { ...options, languages: [] }

test('returns route for page path', (t) => {
  t.is(getRoute('blog/post.tsx', options), '/blog/post')
  t.is(getRoute('blog/post.fr.tsx', options), '/fr/blog/post')
  t.is(getRoute('blog/post.en.tsx', options), '/blog/post')
  t.is(getRoute('blog/post.md', options), '/blog/post')
  t.is(getRoute('blog/[pagination].md', options), '/blog/[pagination]')
  t.is(getRoute('blog/[pagination].tsx', options), '/blog/:pagination?')
  t.is(getRoute('blog/[tag]/[page].tsx', options), '/blog/:tag/:page?')
  t.is(getRoute('blog/[pagination].tsx', noReplace), '/blog/[pagination]')
  t.is(getRoute('blog/[pagination].en.md', options), '/blog/[pagination]')
  t.is(getRoute('blog/[pagination].en.tsx', options), '/blog/:pagination?')
  t.is(getRoute('blog/[tag]/[page].en.tsx', options), '/blog/:tag/:page?')
  t.is(getRoute('blog/[pagination].en.tsx', noReplace), '/blog/[pagination]')
  t.is(
    getRoute('blog/[pagination].en.tsx', noLanguages),
    '/blog/:pagination?.en',
  )
  t.is(getRoute('blog/[pagination].fr.tsx', options), '/fr/blog/:pagination?')
  t.is(getRoute('blog/[tag]/[page].fr.tsx', options), '/fr/blog/:tag/:page?')
  t.is(getRoute('blog/[pagination].fr.tsx', noReplace), '/fr/blog/[pagination]')
  t.is(getRoute('a.de.b/index.fr.tsx', options), '/fr/a.de.b')
})
