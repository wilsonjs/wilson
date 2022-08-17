import type { StaticPageProps } from 'wilson'
import DefaultLayout from './default'

export default function MarkdownLayout(props: StaticPageProps) {
  return (
    <>
      <DefaultLayout {...props}>
        <h1>{props.frontmatter.title}</h1>
        <div>{props.children}</div>
      </DefaultLayout>
    </>
  )
}
