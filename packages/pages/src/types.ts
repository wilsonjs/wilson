import type { ViteDevServer } from 'vite'
import type { SiteConfig } from '@wilson/types'
import type { createApi } from './api'

// these virtual module ids should not have slashes in them, because
// module resolution of modules imported in them is harder otherwise.
export const ROUTES_MODULE_ID = 'virtual:wilson-routes'
export const RESOLVED_ROUTES_MODULE_ID = `\0${ROUTES_MODULE_ID}.tsx`
export const DATA_MODULE_ID = 'virtual:wilson-route-data'
export const RESOLVED_DATA_MODULE_ID = `\0${DATA_MODULE_ID}.tsx`

export type Awaitable<T> = T | Promise<T>

/**
 * Options this plugin is invoked with.
 */
export interface Options extends SiteConfig {
  /**
   * Vite dev server instance
   */
  server?: ViteDevServer
}

export type PagesApi = ReturnType<typeof createApi>
