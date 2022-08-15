import { h, render } from 'preact'
import type { ComponentType } from 'preact'

/**
 * Arbitrary component props
 */
type Props = Record<string, unknown>
type AsyncComponent = () => Promise<ComponentType>

/**
 * Returns HTMLElement by id.
 */
const findById = (id: string): HTMLElement | void =>
  document.getElementById(id) ||
  console.error(`Missing #${id}, could not mount island.`)

/**
 * Hydrates an interactive island immediately.
 *
 * @param component Component to render
 * @param id "id" attribute of the element to render the component into
 * @param props Props to render the component with
 */
export function hydrateNow(Component: ComponentType, id: string, props: Props) {
  const islandMount = findById(id)
  if (islandMount) {
    const slots = Array.from(islandMount.querySelectorAll('wilson-slot'))
    const closestSlot = slots.find(
      (s) => s.closest('wilson-island') === islandMount,
    )
    const children = h(StaticHtml, {
      value: closestSlot ? closestSlot.innerHTML : '',
    })
    render(h(Component, props, children), islandMount)
    islandMount.setAttribute('hydrated', '')
  }
}

/**
 * Waits for async import of island component and then hydrates it.
 *
 * @param componentFn Async function that resolves to the component to render
 * @param id "id" attribute of the element to render the component into
 * @param props Props to render the component with
 */
async function resolveAndHydrate(
  componentFn: AsyncComponent,
  id: string,
  props: Props,
) {
  const component = await componentFn()
  hydrateNow(component, id, props)
}

/**
 * Hydrates an interactive island as soon as the main thread is free.
 * If `requestIdleCallback` isn't supported, it uses a small `setTimeout` delay
 *
 * @param componentFn Async function that resolves to the component to render
 * @param id "id" attribute of the element to render the component into
 * @param props Props to render the component with
 */
export function hydrateWhenIdle(
  componentFn: AsyncComponent,
  id: string,
  props: Props,
) {
  const whenIdle = window.requestIdleCallback || setTimeout
  whenIdle(() => resolveAndHydrate(componentFn, id, props))
}

/**
 * Hydrates an interactive island when it matches a given media query.
 *
 * @param componentFn Async function that resolves to the component to render
 * @param id "id" attribute of the element to render the component into
 * @param props Props to render the component with
 */
export function hydrateOnMediaQuery(
  componentFn: AsyncComponent,
  id: string,
  props: Props,
) {
  const mediaQuery = matchMedia(props.clientMedia as string)
  delete props.clientMedia

  const onChange = (fn: any = null) => (mediaQuery.onchange = fn)

  const hydrate = () => {
    onChange()
    resolveAndHydrate(componentFn, id, props)
  }

  mediaQuery.matches ? hydrate() : onChange(hydrate)
}

/**
 * Hydrates an interactive island when it becomes visible.
 *
 * @param componentFn Async function that resolves to the component to render
 * @param id "id" attribute of the element to render the component into
 * @param props Props to render the component with
 */
export function hydrateWhenVisible(
  componentFn: AsyncComponent,
  id: string,
  props: Props,
) {
  const islandMount = findById(id)
  if (islandMount) {
    // display style for wilson-island is set to "contents". we need to revert
    // this as long as we want to do a detection with IntersectionObserver
    islandMount.style.display = 'initial'

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        stopObserver()
        // restore display style
        islandMount.style.display = ''
        resolveAndHydrate(componentFn, id, props)
      }
    })
    const stopObserver = () => {
      observer.disconnect()
    }

    observer.observe(islandMount)
  }
}

/**
 * Wilson passes `children` as a string of HTML, so we need
 * a wrapper element to render that content as VNodes.
 *
 * As a bonus, we can signal to Preact that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }: { value: string; name?: string }) => {
  if (!value) return null
  return h('wilson-slot', { name, dangerouslySetInnerHTML: { __html: value } })
}

/**
 * This tells Preact to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false
