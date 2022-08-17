import { StaticPageProps } from 'wilson'
import { Link } from 'wouter-preact'

export default function DefaultLayout({
  children,
  translations,
}: StaticPageProps) {
  return (
    <>
      <header>
        <Link href="/">Home</Link>
        <Link href="/islands">Islands</Link>
        <Link href="/blog">Blog</Link>
      </header>
      <main>{children}</main>
      <footer>
        <ul>
          {translations &&
            translations.map((t) => (
              <li>
                <Link href={t.route}>{t.title}</Link>{' '}
              </li>
            ))}
        </ul>
      </footer>
    </>
  )
}
