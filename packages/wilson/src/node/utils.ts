import newSpinner from 'mico-spinner'

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

function timeSince(start: number): string {
  const diff = performance.now() - start
  return diff < 750 ? `${Math.round(diff)}ms` : `${(diff / 1000).toFixed(1)}s`
}
