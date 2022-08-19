import 'typeface-fira-code'
import 'typeface-montserrat'
import 'typeface-open-sans'
import 'what-input'
import '../assets/global.scss'
import styles from './layout.module.scss'
import Header from '../components/header'
import Footer from '../components/footer'
import ColorModeProvider from '../components/color-mode-provider'
import type { StaticPageProps } from 'wilson'

export default function Layout(props: StaticPageProps) {
  return (
    <ColorModeProvider>
      <Header />
      <main class={styles.main}>{props.children}</main>
      <Footer {...props} />
    </ColorModeProvider>
  )
}
