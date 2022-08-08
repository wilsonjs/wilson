import type { StaticPageProps } from 'wilson'
import DefaultLayout from './default'

export default function IndexLayout(props: StaticPageProps) {
  return (
    <>
      <DefaultLayout>
        <h1>{props.frontmatter.title}</h1>
        <div>{props.children}</div>
      </DefaultLayout>
    </>
  )
}
