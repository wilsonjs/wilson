import { Link } from 'wouter-preact'
import type { StaticPageProps } from 'wilson'
import styles from './default.module.scss'

function languageLink(href: string, lang: string): string {
  return lang === 'en' ? href : `/${lang}${href}`.replace(/\/$/, '')
}

export default function DefaultLayout({
  children,
  language,
  translations,
}: StaticPageProps) {
  return (
    <>
      <header>
        <Link href={languageLink('/', language)}>Home</Link>
        <Link href="/islands">Islands</Link>
        <Link href={languageLink('/blog', language)}>Blog</Link>
      </header>
      <main>{children}</main>
      <footer>
        <ul class={styles.translations}>
          {translations &&
            translations.map((t) => (
              <li key={t.languageId}>
                <Link
                  href={t.route}
                  class={styles.translation}
                  aria-current={t.languageId === language ? 'page' : false}
                >
                  {t.languageName}
                </Link>
              </li>
            ))}
        </ul>
      </footer>
    </>
  )
}
