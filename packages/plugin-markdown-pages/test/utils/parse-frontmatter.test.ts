import test from 'ava'
import sinon from 'sinon'
import grayMatter from 'gray-matter'
import utils from '../../src/utils/index'

test('parses frontmatter', async (t) => {
  const markdownCode = '---\ntitle: Article title\n---\n# Headline'

  t.deepEqual(utils.parseFrontmatter(markdownCode, grayMatter), {
    frontmatter: { title: 'Article title' },
    markdown: '# Headline',
  })
})

test('caches results', async (t) => {
  const markdownCode = '# Headline'
  const grayMatterStub = sinon.stub().returns({ content: '', data: {} })

  utils.parseFrontmatter(
    markdownCode,
    grayMatterStub as any as typeof grayMatter,
  )
  utils.parseFrontmatter(
    markdownCode,
    grayMatterStub as any as typeof grayMatter,
  )

  t.is(grayMatterStub.callCount, 1)
  t.is(grayMatterStub.calledOnceWithExactly(markdownCode), true)

  sinon.restore()
})
