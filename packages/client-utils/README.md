this has been split from @wilson/utils because parts of that package
use `fast-glob`, which in turn uses nodejs internals like `path`, which leads
to errors like these

- https://dev.to/0xbf/vite-module-path-has-been-externalized-for-browser-compatibility-2bo6
- https://github.com/vitejs/vite/issues/9200

One possibility to fix these would be to alias polyfills like `path-browserify`, but that sounds a little brittle to me, so I decided to split the utils into those used in the browser in development (this package)
and those used by the dev server or in production builds (@wilson/utils).

Another possible fix might be code-splitting a single utils package, so that
only specific functions are loaded into the browser and those that use node internals are not.
