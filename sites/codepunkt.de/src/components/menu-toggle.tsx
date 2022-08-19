import { FunctionalComponent } from 'preact'
import { StateUpdater } from 'preact/hooks'
import styles from './menu-toggle.module.scss'

const MenuToggleButton: FunctionalComponent<{
  isOpen: boolean
  setIsOpen: StateUpdater<boolean>
}> = ({ isOpen, setIsOpen }) => {
  return (
    <button
      class={styles.button}
      aria-label="Menu"
      aria-pressed={isOpen}
      onClick={() => {
        window.scrollTo(0, 0)
        setIsOpen((isOpen) => !isOpen)
      }}
    >
      <div data-open={isOpen} class={styles.buns}>
        <span data-open={isOpen} class={styles.patty} />
      </div>
    </button>
  )
}

export default MenuToggleButton
