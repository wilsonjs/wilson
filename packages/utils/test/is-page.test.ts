import test from 'ava'
import utils from '../src/utils'

test('files outside of the pages dir are not pages', (t) => {
  t.is(
    utils.isPage(
      '/User/name/site/src/components/header.tsx',
      '/User/name/site/src/pages',
      ['.md', '.tsx'],
    ),
    false,
  )
})

test('files without registered page extensions are not pages', (t) => {
  t.is(
    utils.isPage(
      '/User/name/site/src/pages/about.ts',
      '/User/name/site/src/pages',
      ['.md', '.tsx'],
    ),
    false,
  )
})

test('files in the pages dir with a registered page extension are pages', (t) => {
  t.is(
    utils.isPage(
      '/User/name/site/src/pages/about.tsx',
      '/User/name/site/src/pages',
      ['.md', '.tsx'],
    ),
    true,
  )
})
