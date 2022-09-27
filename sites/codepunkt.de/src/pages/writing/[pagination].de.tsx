import type {
  PropsWithPagination,
  GetStaticPaths,
  PageFrontmatter,
} from 'wilson'
import { Link } from 'wouter-preact'
import styles from './[pagination].module.scss'

export const frontmatter = {
  title: 'Blog',
}

export const getStaticPaths: GetStaticPaths = async ({
  getPages,
  paginate,
}) => {
  const pages = getPages('writing/**/*.md').filter(
    (page) => !page.frontmatter.draft && page.language === 'de',
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
        Blog
        <br />
        <small>Letzte Änderung am: {frontmatter.meta.lastUpdated}</small>
      </h1>
      <ol>
        {items.map((item) => (
          <li key={item.frontmatter.title}>
            <Link href={item.path}>{item.frontmatter.title}</Link>
          </li>
        ))}
      </ol>
      {prevPage && <Link href={prevPage}>Zurück</Link>}
      {nextPage && <Link href={nextPage}>Vor</Link>}
    </>
  )
}
