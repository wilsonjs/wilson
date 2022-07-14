import { renderToString } from 'react-dom/server'
import { createMemoryHistory, ReactLocation, RouterInstance } from '@tanstack/react-location'
import routes from 'virtual:wilson-routes'

export const render = async (url: string): Promise<string> => {
  const history = createMemoryHistory({ initialEntries: [url] })
  const location = new ReactLocation({ history })
  const router = new RouterInstance({ location, routes })
  await router.updateLocation(location.current).promise
  router.

  return renderToString(
    <R />
  )
}