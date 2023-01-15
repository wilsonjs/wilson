import type { FunctionalComponent } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import type { StaticPageProps } from 'wilson'
import useIsSsr from '../hooks/use-is-ssr'
import { MAIN_MENU, SOCIAL_LINKS } from '../constants'
import usePrevious from '../hooks/use-previous'
import styles from './menu-toggle.module.scss'
import useMedia from 'use-media'

interface MenuToggleButtonProps {
  menuItems: { exact: boolean; name: string; url: string }[]
}

export default function MenuToggleButton({ menuItems }: MenuToggleButtonProps) {
  if (useIsSsr()) return null
  const [isOpen, setIsOpen] = useState(false)

  const wasOpen = usePrevious(isOpen, false)
  const isWide = useMedia({ minWidth: '768px' }, true)
  const wasWide = usePrevious(isWide, true)

  // when screen gets wide, hide menu
  useEffect(() => {
    if (!wasWide && isWide) setIsOpen(false)
  }, [isWide, wasWide])

  // change body overflow when menu status changes
  useEffect(() => {
    if (wasOpen !== undefined && isOpen !== wasOpen) {
      document.documentElement.style.setProperty(
        '--body-overflow',
        isOpen ? 'hidden' : 'visible',
      )
    }
  }, [isOpen, wasOpen])

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
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
      {isOpen && (
        <>
          <div class={styles.background} />
          <nav class={styles.nav}>
            <div class={styles.content}>
              <ol class={styles.menu}>
                {menuItems.map(({ exact, name, url }) => {
                  return (
                    <li key={name}>
                      <a href={url} onClick={closeMenu} class={styles.menuLink}>
                        {name}
                      </a>
                    </li>
                  )
                })}
              </ol>
              <footer class={styles.menuFooter}>
                <ol class={styles.menuSocial}>
                  {SOCIAL_LINKS.map(({ url, name, path, color }) => {
                    return (
                      <li key={url}>
                        <a href={url} aria-label={name}>
                          <svg
                            role="img"
                            viewBox="0 0 512 512"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-labelledby={`social-icon-${name}`}
                            class={styles.socialIcon}
                          >
                            <title id={`social-icon-${name}`}>{name}</title>
                            <path d={path} fill={color} />
                          </svg>
                        </a>
                      </li>
                    )
                  })}
                </ol>
              </footer>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
