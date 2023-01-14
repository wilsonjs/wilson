import { Hydrate } from '../src/client/app.server'

/**
 * You can define which components should remain interactive in the
 * production build by using client: attributes in your components.
 */
export interface LazyHydrationAttributes {
  /**
   * Hydrates the component immediately as the page loads.
   */
  [Hydrate.OnLoad]?: true
  /**
   * Hydrate the component as soon as the main thread is free.
   */
  [Hydrate.WhenIdle]?: true
  /**
   * Hydrates the component as soon as the element enters the viewport.
   */
  [Hydrate.WhenVisible]?: true
  /**
   * Hydrates the component as soon as the browser matches the given media query.
   * Useful to avoid unnecessary work depending on the available viewport, such as in mobile devices.
   *
   * Example: `<Island clientMedia="(max-width: 968px)" />`
   */
  [Hydrate.OnMediaQuery]?: string
  /**
   * Does not prerender the component during build.
   */
  clientOnly?: true
}

export interface PotentiallyLazyHydratedVNode<
  T extends LazyHydrationAttributes = LazyHydrationAttributes,
> extends VNode<T> {
  wrapped?: true
}
