import styles from './page.module.scss'

export const frontmatter = {
  title: 'Hurrdur',
}

export default function Page() {
  return <h1 className={styles.headline}>writing/hurrdur/page</h1>
}
