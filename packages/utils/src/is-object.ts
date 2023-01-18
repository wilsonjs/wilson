/**
 * Check if variable is an object
 * @param maybeObject Variable that might be an object
 */
export default function isObject(maybeObject: any): maybeObject is object {
  return (
    maybeObject !== null &&
    typeof maybeObject === 'object' &&
    !Array.isArray(maybeObject)
  )
}
