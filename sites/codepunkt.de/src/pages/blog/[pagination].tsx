import { Document, PropsWithPagination, GetRenderedPathsFn } from 'wilson'
import styles from './[pagination].module.scss'

export const getRenderedPaths: GetRenderedPathsFn = async ({
  getPages,
  paginate,
}) => {
  // const pages = getPages('blog')
  const pages = Object.values(
    import.meta.glob<{
      path: string
      frontmatter: {}
    }>('/src/pages/blog/**/*.md', {
      eager: true,
    }),
  ).map(({ path, frontmatter }) => ({
    frontmatter,
    href: `/${path}`,
  }))
  return paginate(pages, {
    pageSize: 3,
    format: (no) => (no === 1 ? '' : `page-${no}`),
  })
}

export default function Page({
  frontmatter,
  items,
  prevPage,
  nextPage,
}: PropsWithPagination<Document>) {
  return (
    <>
      <h1 className={styles.headline}>
        Blog
        <br />
        <small>Last modified: {frontmatter.meta.lastUpdated}</small>
      </h1>
      <ol>
        {items.map((item) => (
          <li key={item.frontmatter.title}>
            <a href={item.href}>{item.frontmatter.title}</a>
          </li>
        ))}
      </ol>
      {prevPage && <a href={prevPage}>Prev</a>}
      {nextPage && <a href={nextPage}>Next</a>}
    </>
  )
}
