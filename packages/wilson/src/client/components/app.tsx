import {
  routes,
  siteData,
  pageData,
  LanguageProvider,
  useAllLanguages,
} from 'wilson/virtual'
import { ErrorBoundary, LocationProvider, Router } from 'preact-iso'
import { FunctionalComponent } from 'preact'
import { useTitleTemplate } from 'hoofd/preact'
import { AutoPrefetchProvider } from '../context/prefetch'
import { getLCP, getFID, getCLS } from 'web-vitals'
import { useState } from 'preact/hooks'

if (!import.meta.env.SSR) {
  getCLS(console.log)
  getFID(console.log)
  getLCP(console.log)
}

const NotFound: FunctionalComponent = () => <>Not Found</>
const getRouteLanguage = (currentRoute: string): string =>
  pageData.find((page) => page.route === currentRoute)?.language ??
  siteData.lang

interface AppProps {
  serverRenderUrl?: string
}

// TODO:
// - check why production built pages ALWAYS append the index page
const App: FunctionalComponent<AppProps> = ({ serverRenderUrl }) => {
  useTitleTemplate(siteData.titleTemplate)
  const allLanguages = useAllLanguages()
  const isInternationalized = allLanguages.length > 0
  const [language, setLanguage] = useState(
    isInternationalized
      ? getRouteLanguage(serverRenderUrl ?? document.location.pathname)
      : undefined
  )

  return (
    <LocationProvider>
      <div id="wilson">
        <LanguageProvider value={language}>
          <AutoPrefetchProvider>
            <ErrorBoundary>
              <Router
                onRouteChange={(url) => setLanguage(getRouteLanguage(url))}
              >
                {[...routes, <NotFound key="notFound" default />]}
              </Router>
            </ErrorBoundary>
          </AutoPrefetchProvider>
        </LanguageProvider>
      </div>
    </LocationProvider>
  )
}

export default App
