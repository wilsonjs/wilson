import Avatar from '../islands/avatar'
import styles from './index.module.scss'

export const frontmatter = {
  title: 'Home',
}

export default function IndexEnPage() {
  return (
    <article class={styles.article}>
      <Avatar clientVisible />
      <section class={styles.introSection}>
        <div class={styles.introContent}>
          <h1 class={styles.introWelcome}>
            Hey, my name
            <br />
            is <em>Christoph</em>.
          </h1>

          <p class={styles.introParagraph}>
            I help software engineering teams deliver better products in less
            time.
          </p>
        </div>
      </section>
    </article>
  )
}
