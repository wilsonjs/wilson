import { FunctionalComponent } from 'preact'
import Header from '../components/header'

const DefaultLayout: FunctionalComponent = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}

export default DefaultLayout
