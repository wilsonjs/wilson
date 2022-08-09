import type { createApi } from './api'

// these virtual module ids should not have slashes in them, because
// module resolution of modules imported in them is harder otherwise.
export const ROUTES_MODULE_ID = 'virtual:wilson-routes'
export const RESOLVED_ROUTES_MODULE_ID = `\0${ROUTES_MODULE_ID}`
export const DATA_MODULE_ID = 'virtual:wilson-route-data'
export const RESOLVED_DATA_MODULE_ID = `\0${DATA_MODULE_ID}`

export type PagesApi = ReturnType<typeof createApi>
