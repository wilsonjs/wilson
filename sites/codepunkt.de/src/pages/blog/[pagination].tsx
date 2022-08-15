import { PropsWithPagination, GetStaticPaths } from 'wilson'
import { Link } from 'wouter-preact'
import styles from './[pagination].module.scss'

export const frontmatter = {
  title: 'Blog posts',
}

export const getStaticPaths: GetStaticPaths = async ({
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
    href: path,
  }))
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
        Blog
        <br />
        <small>Last modified: {frontmatter.meta.lastUpdated}</small>
      </h1>
      <ol>
        {items.map((item) => (
          <li key={item.frontmatter.title}>
            <Link href={item.href}>{item.frontmatter.title}</Link>
          </li>
        ))}
      </ol>
      {prevPage && <Link href={prevPage}>Prev</Link>}
      {nextPage && <Link href={nextPage}>Next</Link>}
    </>
  )
}
