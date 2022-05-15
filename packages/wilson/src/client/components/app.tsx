import { routes, siteData, Layout } from 'wilson/virtual'
import { ErrorBoundary, LocationProvider, Router } from 'preact-iso'
import { FunctionalComponent } from 'preact'
import { useTitleTemplate } from 'hoofd/preact'
import { AutoPrefetchProvider } from '../context/prefetch'
import { getLCP, getFID, getCLS } from 'web-vitals'

if (!import.meta.env.SSR) {
  getCLS(console.log)
  getFID(console.log)
  getLCP(console.log)
}

const NotFound: FunctionalComponent = () => <>Not Found</>

const App: FunctionalComponent = () => {
  useTitleTemplate(siteData.titleTemplate)

  return (
    <LocationProvider>
      <Layout>
        <AutoPrefetchProvider>
          <ErrorBoundary>
            <Router>{[...routes, <NotFound key="notFound" default />]}</Router>
          </ErrorBoundary>
        </AutoPrefetchProvider>
      </Layout>
    </LocationProvider>
  )
}

export default App
