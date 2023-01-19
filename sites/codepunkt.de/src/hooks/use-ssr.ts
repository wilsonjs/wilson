/**
 * Checks if the code is running on the server or the client.
 *
 * @returns An object with `isBrowser` and `isServer` booleans.
 */
export default function useSsr() {
  const isDOM =
    typeof window !== 'undefined' &&
    window.document &&
    window.document.documentElement

  return {
    isBrowser: isDOM,
    isServer: !isDOM,
  }
}
