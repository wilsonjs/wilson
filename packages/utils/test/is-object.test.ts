import test from 'ava'
import utils from '../src/utils'

test('null is not an object', (t) => {
  t.is(utils.isObject(null), false)
})

test('an object literal is an object', (t) => {
  t.is(utils.isObject({}), true)
})

test('an array literal is not an object', (t) => {
  t.is(utils.isObject([]), false)
})
