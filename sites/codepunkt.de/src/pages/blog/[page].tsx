import type { DynamicPageProps, GetRenderedPathsResult } from 'wilson'
import { getPages } from 'wilson'
import styles from './[page].module.scss'

interface Post {
  title: string
}
interface Props {
  items: Post[]
  nextPage?: string
  prevPage?: string
}
type Params = 'page'

function paginate(
  items: any[],
  pageSize = 10,
  pageNumberToPath?: (pageNumber: number) => string,
): GetRenderedPathsResult<Params, Props>[] {
  const toPath = pageNumberToPath ?? ((no) => (no === 1 ? '' : `page-${no}`))

  const pagesCount = Math.max(1, Math.ceil(items.length / pageSize))

  return Array.from({ length: pagesCount }, (_, i) => i + 1).map(
    (pageNumber) => {
      const firstItem = (pageNumber - 1) * pageSize
      console.log(items.slice(firstItem, firstItem + pageSize))
      return {
        params: { page: toPath(pageNumber) },
        props: {
          items: items.slice(firstItem, firstItem + pageSize),
          nextPage:
            pageNumber !== pagesCount
              ? `/blog/${toPath(pageNumber + 1)}`
              : undefined,
          prevPage:
            pageNumber === 1 ? undefined : `/blog/${toPath(pageNumber - 1)}`,
        },
      }
    },
  )
}

export function getRenderedPaths(): GetRenderedPathsResult<Params, Props>[] {
  return paginate(getPages('blog'), 2)
}

export const frontmatter = {
  title: 'Blog',
}

export default function Page(props: DynamicPageProps<Params, Props>) {
  const { frontmatter: fm, items, prevPage, nextPage } = props
  return (
    <>
      <h1 className={styles.headline}>
        {fm.title || 'Blog'}
        <br />
        <small>Last modified at: {fm.meta.lastUpdated}</small>
      </h1>
      <ol>
        {items.map((item) => (
          <li key={item.title}>{item.title}</li>
        ))}
      </ol>
      {prevPage && <a href={prevPage}>Prev</a>}
      {nextPage && <a href={nextPage}>Next</a>}
    </>
  )
}
