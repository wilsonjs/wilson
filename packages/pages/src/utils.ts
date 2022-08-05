import createDebug from 'debug'

export const debug = {
  hmr: createDebug('wilson:pages:hmr'),
  virtual: createDebug('wilson:pages:virtual'),
}

export function slash(path: string): string {
  return path.replace(/\\/g, '/')
}
