/**
 * You can define which components should remain interactive in the
 * production build by using client: attributes in your components.
 */
export interface LazyHydrationAttributes {
  /**
   * Hydrates the component immediately as the page loads.
   */
  clientLoad?: true
  /**
   * Hydrate the component as soon as the main thread is free.
   */
  clientIdle?: true
  /**
   * Hydrates the component as soon as the element enters the viewport.
   */
  clientVisible?: true
  /**
   * Hydrates the component as soon as the browser matches the given media query.
   * Useful to avoid unnecessary work depending on the available viewport, such as in mobile devices.
   */
  clientMedia?: string
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
