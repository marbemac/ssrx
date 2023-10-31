---
'@ssrx/plugin-solid-router': minor
'@ssrx/plugin-trpc-react': minor
'@ssrx/plugin-unhead': minor
'@ssrx/renderer': minor
'@ssrx/react': minor
'@ssrx/solid': minor
'@ssrx/vite': minor
'@ssrx/plugin-react-router': minor
'@ssrx/plugin-tanstack-query': minor
'@ssrx/plugin-tanstack-router': minor
'@ssrx/remix': minor
---

- Refactor stream injector in `@ssrx/renderer`
- Add `@ssrx/remix` and remix-vite example
- Switch to rollup for the build process on most packages
- Pass the req.signal to renderToReadableStream in the react/remix renderers
- Decouple `@ssrx/renderer` from `@ssrx/vite`
