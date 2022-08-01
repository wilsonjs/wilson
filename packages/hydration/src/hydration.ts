import { h, render, toChildArray } from 'preact'
import type { ComponentType } from 'preact'

import type { Props, Slots } from './types'

/**
 * Returns HTMLElement by id.
 */
const findById = (id: string): HTMLElement | void =>
  document.getElementById(id) ||
  console.error(`Missing #${id}, could not mount island.`)

// Public: Hydrates the component immediately.
export function hydrateNow(
  component: ComponentType,
  id: string,
  props: Props,
  slots: Slots,
) {
  const el = findById(id)
  if (el) {
    createIsland(component, el, props, slots)
    el.setAttribute('hydrated', '')
  }
}

// async function resolveAndHydrate(
//   frameworkFn: AsyncFrameworkFn,
//   componentFn: AsyncComponent,
//   id: string,
//   props: Props,
//   slots: Slots,
// ) {
//   const [framework, component] = await Promise.all([
//     frameworkFn(),
//     componentFn(),
//   ])
//   hydrateNow(component, id, props, slots)
// }

// // Public: Hydrate this component as soon as the main thread is free.
// // If `requestIdleCallback` isn't supported, it uses a small delay.
// export function hydrateWhenIdle(
//   framework: AsyncFrameworkFn,
//   component: AsyncComponent,
//   id: string,
//   props: Props,
//   slots: Slots,
// ) {
//   const whenIdle = window.requestIdleCallback || setTimeout
//   const cancelIdle = window.cancelIdleCallback || clearTimeout

//   const idleId: any = whenIdle(() =>
//     resolveAndHydrate(framework, component, id, props, slots),
//   )

// }

// // Public: Hydrate this component when the specified media query is matched.
// export function hydrateOnMediaQuery(
//   framework: AsyncFrameworkFn,
//   component: AsyncComponent,
//   id: string,
//   props: Props,
//   slots: Slots,
// ) {
//   const mediaQuery = matchMedia(props._mediaQuery as string)
//   delete props._mediaQuery

//   const onChange = (fn: any = null) => (mediaQuery.onchange = fn)

//   const hydrate = () => {
//     onChange()
//     resolveAndHydrate(framework, component, id, props, slots)
//   }

//   mediaQuery.matches ? hydrate() : onChange(hydrate)

// }

// // Public: Hydrate this component when one of it's children becomes visible.
// export function hydrateWhenVisible(
//   framework: AsyncFrameworkFn,
//   component: AsyncComponent,
//   id: string,
//   props: Props,
//   slots: Slots,
// ) {
//   const el = findById(id)
//   if (el) {
//     // NOTE: Force detection of the element for non-Vue frameworks.
//     if (import.meta.env.DEV) el.style.display = 'initial'

//     const observer = new IntersectionObserver(([{ isIntersecting }]) => {
//       if (isIntersecting) {
//         stopObserver()

//         // NOTE: Reset the display value.
//         if (import.meta.env.DEV) el.style.display = ''

//         resolveAndHydrate(framework, component, id, props, slots)
//       }
//     })
//     const stopObserver = () => observer.disconnect()

//     observer.observe(el)
//   }
// }

function createIsland(
  Component: ComponentType,
  el: Element,
  props: Props,
  { default: children, ...otherSlots }: Slots,
) {
  for (const [key, value] of Object.entries(otherSlots)) {
    props[key] = h(StaticHtml, { value, name: key })
  }
  render(
    h(
      Component,
      props,
      children !== null ? h(StaticHtml, { value: children }) : children,
    ),
    el,
  )
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
