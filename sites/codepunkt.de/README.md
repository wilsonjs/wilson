# Wilson I18N

## Todo

### Minimum requirements

- Adapt html lang attribute (e.g. `<html lang="en">` vs `<html lang="de">`)
- Add `<link rel="alternate" hreflang="lang_code">` elements to page header

### Might be interesting

- Consider adding a fallback page for unmatched languages, especially on language/country selectors or auto-redirecting homepages. Use the the x-default value

  `<link rel="alternate" href="https://example.com/" hreflang="x-default" />`

- Use `hreflang` attribute for links that point to different language versions of the same or another site (_maybe this can be done automatically by checking the locale of the current page and finding all links to pages in a different locale_)

## Questions

- How to detect the locale of a given Page?
  - in SSR
  - in interactive islands
- How to detect other locale versions of a given Page?
  - in SSR
  - in interactive islands

## References

- [Tell Google about localized versions of your page](https://developers.google.com/search/docs/advanced/crawling/localized-versions)
- [Introducing "x-default hreflang" for international landing pages](https://developers.google.com/search/blog/2013/04/x-default-hreflang-for-international-pages)
- [Hugo Multilingual Mode](https://gohugo.io/content-management/multilingual/)
- [Astro Configuration](https://docs.astro.build/en/guides/integrations-guide/sitemap/#configuration)
