import type { DynamicPageProps, GetRenderedPathsResult } from 'wilson'
import Counter from '../../component/Counter'
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

const posts = [
  { title: 'Post 1' },
  { title: 'Post 2' },
  { title: 'Post 3' },
  { title: 'Post 4' },
  { title: 'Post 5' },
  { title: 'Post 6' },
  { title: 'Post 7' },
  { title: 'Post 8' },
  { title: 'Post 9' },
]

function paginate(
  items: Post[],
  pageSize = 10,
): GetRenderedPathsResult<Params, Props>[] {
  const pagesCount = Math.max(1, Math.ceil(items.length / pageSize))
  function numberToPath(pageNumber: number): string {
    return pageNumber === 1 ? '' : `page-${pageNumber}`
  }
  return Array.from({ length: pagesCount }, (_, i) => i + 1).map(
    (pageNumber) => {
      const firstItem = (pageNumber - 1) * pageSize
      return {
        params: { page: numberToPath(pageNumber) },
        props: {
          items: items.slice(firstItem, firstItem + pageSize),
          nextPage:
            pageNumber !== pagesCount
              ? `/blog/${numberToPath(pageNumber + 1)}`
              : undefined,
          prevPage:
            pageNumber === 1
              ? undefined
              : `/blog/${numberToPath(pageNumber - 1)}`,
        },
      }
    },
  )
}

export function getRenderedPaths(): GetRenderedPathsResult<Params, Props>[] {
  return paginate(posts, 6)
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
      <pre>{JSON.stringify(items, null, 2)}</pre>
      {prevPage && <a href={prevPage}>Prev</a>}
      {nextPage && <a href={nextPage}>Next</a>}
      <Counter initialValue={10} clientLoad />
    </>
  )
}
