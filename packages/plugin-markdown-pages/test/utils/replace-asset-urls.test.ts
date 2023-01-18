import test from 'ava'
import utils from '../../src/utils/index'

test('replaces standard attributes', async (t) => {
  t.is(
    utils.replaceAssetUrls('<div><img src="_assetUrl_0"></div>', ['foo.jpg']),
    '<div><img src={_assetUrl_0}></div>',
  )
})

test('replaces srcSet attributes', async (t) => {
  t.is(
    utils.replaceAssetUrls(
      '<img srcSet="_assetUrl_2 480w, _assetUrl_1 800w" sizes="(max-width: 600px) 480px, 800px" src="elva-fairy-800w.jpg"/>',
      ['foo.jpg', 'bar.jpg', 'baz.jpg'],
    ),
    // eslint-disable-next-line no-template-curly-in-string
    '<img srcSet={`${_assetUrl_2} 480w, ${_assetUrl_1} 800w`} sizes="(max-width: 600px) 480px, 800px" src="elva-fairy-800w.jpg"/>',
  )
})
