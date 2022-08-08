import type { Document, PropsWithPagination, GetRenderedPathsFn } from 'wilson'
import { getDocuments } from 'wilson'
import styles from './[page].module.scss'

export const getRenderedPaths: GetRenderedPathsFn = async ({ paginate }) => {
  return paginate(getDocuments('blog'), {
    pageSize: 3,
    format: (no) => `page-${no}`,
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
