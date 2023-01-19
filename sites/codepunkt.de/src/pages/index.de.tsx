import Avatar from '../islands/avatar'
import styles from './index.module.scss'

export const frontmatter = {
  title: 'Startseite',
}

export default function IndexDePage() {
  return (
    <article class={styles.article}>
      <Avatar clientVisible />
      <section class={styles.introSection}>
        <div class={styles.introContent}>
          <h1 class={styles.introWelcome}>
            Hallo, ich bin
            <br />
            <em>Christoph</em>.
          </h1>

          <p class={styles.introParagraph}>
            Ich helfe Teams in der Software-Entwicklung dabei, in kürzerer Zeit
            bessere Produkte zu entwickeln.
          </p>
        </div>
      </section>
    </article>
  )
}
