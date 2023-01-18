import test from 'ava'
import utils from '../src/utils'

test('nope', (t) => {
  t.is(utils.isDynamicPagePath('blog/page'), false)
})
