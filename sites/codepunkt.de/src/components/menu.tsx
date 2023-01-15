import type { FunctionalComponent } from 'preact'
import type { StaticPageProps } from 'wilson'
import { MENU_ITEMS } from '../constants'
import ModeToggle from '../islands/mode-toggle'
import MenuToggle from '../islands/menu-toggle'
import styles from './menu.module.scss'
import Link from './link'

const Menu: FunctionalComponent<StaticPageProps> = (props) => {
  const menuItems = MENU_ITEMS.map(({ url, name }) => ({
    exact: url === '/',
    name: props.translate(name),
    url: props.localizeUrl(url),
  }))

  return (
    <div class={styles.container}>
      <ol class={styles.menu}>
        {menuItems.map(({ exact, name, url }) => {
          return (
            <li key={name} class={styles.entry}>
              <Link href={url} exact={exact} class={styles.link}>
                {name}
              </Link>
            </li>
          )
        })}
      </ol>
      <div class={styles.mode}>
        <ModeToggle clientOnly />
      </div>
      <MenuToggle menuItems={menuItems} clientMedia="(max-width: 768px)" />
    </div>
  )
}

export default Menu
