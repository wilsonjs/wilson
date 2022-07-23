declare module 'virtual:wilson-routes' {
  import type { Route } from '@tanstack/react-location'
  const routes: Route[]
  export default routes
}

declare module 'virtual:wilson-route-data' {
  import type { Route } from '@wilson/pages'
  const routeData: Route[]
  export default routeData
}
