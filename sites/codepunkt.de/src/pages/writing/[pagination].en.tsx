import type { GetStaticPaths, PropsWithPagination } from 'wilson'
import { Link } from 'wouter-preact'
import styles from './[pagination].module.scss'

export const frontmatter = {
  title: 'Writing',
}

export const getStaticPaths: GetStaticPaths = async ({
  getPages,
  paginate,
}) => {
  const pages = getPages('writing/**/*.md').filter(
    (page) => !page.frontmatter.draft && page.language === 'en',
  )

  return paginate(pages, {
    pageSize: 3,
    format: (no: number) => (no === 1 ? '' : `page-${no}`),
  })
}

export default function Page({
  frontmatter,
  items,
  prevPage,
  nextPage,
}: PropsWithPagination) {
  return (
    <>
      <h1 className={styles.headline}>
        Articles
        <br />
        <small>Last modified: {frontmatter.meta.lastUpdated}</small>
      </h1>
      <p>
        I write articles and short snippets on a broad spectrum of web- and
        cloud-related development topics. Both practical lessons from real world
        projects and observations from evaluation of new technology. Find the
        latest of my writing here.
      </p>
      <ol>
        {items.map((item) => (
          <li key={item.frontmatter.title}>
            <Link href={item.path}>{item.frontmatter.title}</Link>
          </li>
        ))}
      </ol>
      {prevPage && <Link href={prevPage}>Prev</Link>}
      {nextPage && <Link href={nextPage}>Next</Link>}
    </>
  )
}
