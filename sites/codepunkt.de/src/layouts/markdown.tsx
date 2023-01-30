import type { StaticPageProps } from 'wilson'
import DefaultLayout from './default'
import styles from './markdown.module.scss'

const formatPostDate = (date: string, lang = 'en'): string | number =>
  typeof Date.prototype.toLocaleDateString === 'function'
    ? new Date(date).toLocaleDateString(lang, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : date

export default function MarkdownLayout(props: StaticPageProps) {
  return (
    <>
      <DefaultLayout {...props}>
        <time dateTime={`${props.frontmatter.date}`} class={styles.postdate}>
          {formatPostDate(props.frontmatter.date, props.language)}
        </time>
        <h1>{props.frontmatter.title}</h1>
        {props.frontmatter.taxonomies?.topics?.length && (
          <ol class={styles.topics}>
            {(props.frontmatter.taxonomies.topics as string[]).map((topic) => (
              <li>{topic}</li>
            ))}
          </ol>
        )}
        {/* {props.frontmatter.description && (
          <p>{props.frontmatter.description}</p>
        )} */}
        <div id="__wilson-markdown">{props.children}</div>
      </DefaultLayout>
    </>
  )
}
