# @ssrx/plugin-tanstack-router

## 0.3.0

### Minor Changes

- [`91042c2`](https://github.com/marbemac/ssrx/commit/91042c2512c828d942c2e5c2e2fce16dbc0ded67) Thanks
  [@marbemac](https://github.com/marbemac)! - - New packages: `@ssrx/streaming` and `@ssrx/plugin-tanstack-router`
  - New example: `tanstack-router-simple`, re-organize kitchen sink examples
  - Minimum required solid-router version is now 0.10
  - Fix a number of edge cases around lazy route detection
  - Update `RenderPlugin` plugin signature

## 0.2.0

### Minor Changes

- [`040ee48`](https://github.com/marbemac/ssrx/commit/040ee4869cf7fa5bb12cbb711be9d47d3d539c29) Thanks
  [@marbemac](https://github.com/marbemac)! - Update deps, split trpc-react out into its own package.

## 0.1.0

### Minor Changes

- [`443b535`](https://github.com/marbemac/ssrx/commit/443b535a5a3767a453114038796baf1f684ebfed) Thanks
  [@marbemac](https://github.com/marbemac)! - - Refactor stream injector in `@ssrx/renderer`
  - Add `@ssrx/remix` and remix-vite example
  - Switch to rollup for the build process on most packages
  - Pass the req.signal to renderToReadableStream in the react/remix renderers
  - Decouple `@ssrx/renderer` from `@ssrx/vite`

## 0.0.2

### Patch Changes

- [`d63f59c`](https://github.com/marbemac/ssrx/commit/d63f59cf72ccd37ca9682f14108883ae3dd90229) Thanks
  [@marbemac](https://github.com/marbemac)! - Externalize react

## 0.0.1

### Patch Changes

- [#3](https://github.com/marbemac/ssrx/pull/3)
  [`3a8b333`](https://github.com/marbemac/ssrx/commit/3a8b333020618d374f442f9476fc1f4121c7446c) Thanks
  [@marbemac](https://github.com/marbemac)! - chore: rename @ssrx/adapter-tanstack-router ->
  @ssrx/plugin-tanstack-router to be consistent.
