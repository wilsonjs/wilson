import test from 'ava'
import utils from '../src/utils'

test('returns false for meta names that should have a name attribute', (t) => {
  t.is(utils.isPropertyMeta('description'), false)
})

test('returns true for meta names that should have a property attribute', (t) => {
  t.is(utils.isPropertyMeta('og:description'), true)
})
