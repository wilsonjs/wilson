import test from 'ava'
import sinon from 'sinon'
import type { TransformResult } from 'vite'
import type { SiteConfig } from '@wilson/types'
import utils from '@wilson/utils'
import markdownPagesPlugin from '../src/md-plugin'

const transform = (
  markdownPagesPlugin({
    extendFrontmatter: (a, b) => b,
  } as SiteConfig) as any as {
    transform: (code: string, id: string) => Promise<TransformResult>
  }
).transform

test('markdownPagesPlugin', async (t) => {
  sinon
    .mock(utils)
    .expects('userToPageFrontmatter')
    .returns({
      layout: '/Users/name/site/src/layouts/default.tsx',
      meta: {
        filename: 'src/pages/my-article/index.md',
        lastUpdated: new Date('10/15/2020'),
      },
    })

  t.deepEqual(
    await transform('', '/Users/name/site/src/layouts/default.tsx'),
    null,
  )
  t.deepEqual(
    await transform(
      '# Article\n![alt](./hero.jpg)',
      '/Users/name/site/src/pages/article.md',
    ),
    null,
  )

  sinon.restore()
})
