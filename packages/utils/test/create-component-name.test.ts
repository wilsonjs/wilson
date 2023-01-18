import test from 'ava'
import utils from '../src/utils'

test('creates static component name', (t) => {
  t.is(utils.createComponentName('about.tsx'), 'About')
})

test('creates dynamic directory component name', (t) => {
  t.is(
    utils.createComponentName('writing/[dir]/index.tsx'),
    'WritingDynamicDirIndex',
  )
})

test('creates dynamic file component name', (t) => {
  t.is(utils.createComponentName('articles/[page].tsx'), 'ArticlesDynamicPage')
})
