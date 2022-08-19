import Logo from '../assets/logo.svg?component'
import styles from './header.module.scss'
import Menu from './menu'

export default function Header() {
  return (
    <header class={styles.header}>
      <a href={`/`} class={styles.logoLink}>
        <Logo class={styles.logo} data-logo />
      </a>
      <Menu />
    </header>
  )
}
