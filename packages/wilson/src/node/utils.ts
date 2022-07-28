import fs from 'fs'
import newSpinner from 'mico-spinner'
import Debug from 'debug'

/**
 * Object holding specific debug instances
 */
export const debug = {
  config: Debug('wilson:config'),
  build: Debug('wilson:build'),
}

/**
 * Recursively removes a directory
 */
export function rmDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true })
}

/**
 * Show a spinner, message and timing information for an async function
 * @param message Message to be shown
 * @param fn Async function
 * @returns Result of the async function
 */
export async function withSpinner<T>(message: string, fn: () => Promise<T>) {
  const spinner = newSpinner(message).start()
  const startTime = performance.now()
  try {
    const result = await fn()
    spinner.succeed()
    console.info(`  done in ${timeSince(startTime)}\n`)
    return result
  } catch (e) {
    spinner.fail()
    throw e
  }
}

/**
 * Simple duration formatter for seconds and miliseconds
 * @param start Start time in miliseconds
 * @returns Formatted duration string
 */
export function timeSince(start: number): string {
  const diff = performance.now() - start
  return diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`
}

/**
 * Returns the unique values of an array
 * @param arr The array
 * @returns New array with unique values
 */
export function uniq<T>(arr: Array<T>) {
  return [...new Set(arr.filter((x) => x))]
}
