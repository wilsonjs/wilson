import test from 'ava'
import utils from '../../src/utils/index'

test('works for relative assetUrls', async (t) => {
  t.deepEqual(utils.getAssetImports(['./foo.jpg'], 'this-is-ignored'), [
    `import _assetUrl_0 from './foo.jpg';`,
  ])
})

test('works for absolute assetUrls', async (t) => {
  t.deepEqual(utils.getAssetImports(['foo.jpg'], './src'), [
    `import _assetUrl_0 from './../foo.jpg';`,
  ])
})
