import type { StaticPageProps } from 'wilson'
import '../assets/global.scss'
import Layout from '../components/layout'

export default function DefaultLayout(props: StaticPageProps) {
  return <Layout {...props} />
}

// import { Link } from 'wouter-preact'
// import type { StaticPageProps } from 'wilson'
// import styles from './default.module.scss'

// function languageLink(href: string, lang: string): string {
//   return lang === 'en' ? href : `/${lang}${href}`.replace(/\/$/, '')
// }

// export default function DefaultLayout({
//   children,
//   language,
//   translations,
// }: StaticPageProps) {
//   return (
//     <>
//       <header>
//         <Link href={languageLink('/', language)}>Home</Link>
//         <Link href={languageLink('/writing', language)}>Writing</Link>
//         <Link href={languageLink('/about', language)}>About</Link>
//       </header>
//       <main>{children}</main>
//       <footer>
//         <ul class={styles.translations}>
//           {translations &&
//             translations.map((t) => (
//               <li key={t.languageId}>
//                 <Link
//                   href={t.route}
//                   class={styles.translation}
//                   aria-current={t.languageId === language ? 'page' : false}
//                 >
//                   {t.languageName}
//                 </Link>
//               </li>
//             ))}
//         </ul>
//       </footer>
//     </>
//   )
// }
