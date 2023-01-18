import fs from 'fs'
import test from 'ava'
import sinon from 'sinon'
import type {
  PageFrontmatter,
  SiteConfig,
  UserFrontmatter,
} from '@wilson/types'
import utils from '../src/utils'

function parameters(
  userFrontmatter: UserFrontmatter,
  extendFrontmatter: SiteConfig['extendFrontmatter'] = () => {},
): Parameters<typeof utils.userToPageFrontmatter> {
  return [
    userFrontmatter,
    '/User/name/site/src/page/article.md',
    { root: '/User/name/site', extendFrontmatter },
  ]
}

function result(
  layout: string,
  meta: Record<string, any>,
  title: string,
): PageFrontmatter {
  return {
    layout,
    title,
    meta: {
      filename: 'src/page/article.md',
      lastUpdated: new Date('10/15/2020'),
      ...meta,
    },
  }
}

test.before(() => {
  sinon
    .mock(fs)
    .expects('statSync')
    .atLeast(1)
    .returns({ mtime: new Date('10/15/2020') })
})

test.after(() => {
  sinon.restore()
})

test('converts user frontmatter to page frontmatter', async (t) => {
  t.deepEqual(
    await utils.userToPageFrontmatter(...parameters({ title: 'Article' })),
    result('default', {}, 'Article'),
  )
})

test('uses layout from user frontmatter', async (t) => {
  t.deepEqual(
    await utils.userToPageFrontmatter(
      ...parameters({ layout: 'foo', title: 'Article' }),
    ),
    result('foo', {}, 'Article'),
  )
})

test('includes meta from user frontmatter', async (t) => {
  t.deepEqual(
    await utils.userToPageFrontmatter(
      ...parameters({
        meta: { filename: 'filename', foo: 'bar' },
        title: 'Article',
      }),
    ),
    result('default', { filename: 'filename', foo: 'bar' }, 'Article'),
  )
})

test('extends frontmatter with the results from extendFrontmatter', async (t) => {
  t.deepEqual(
    await utils.userToPageFrontmatter(
      ...parameters({ title: 'Article' }, () => ({ title: 'New title' })),
    ),
    result('default', {}, 'New title'),
  )
})
