import createDebug from 'debug'

export const debug = {
  hmr: createDebug('wilson:pages:hmr'),
  virtual: createDebug('wilson:pages:virtual'),
}

export function slash(path: string): string {
  return path.replace(/\\/g, '/')
}

export function isObject(obj: any): obj is object {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}
