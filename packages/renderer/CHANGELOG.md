# @ssrx/renderer

## 0.5.1

### Patch Changes

- [`8df5fea`](https://github.com/marbemac/ssrx/commit/8df5fea9c2a308c321ae181942f011e834d010e4) Thanks
  [@marbemac](https://github.com/marbemac)! - Fix various import resolution issues.

- Updated dependencies [[`8df5fea`](https://github.com/marbemac/ssrx/commit/8df5fea9c2a308c321ae181942f011e834d010e4)]:
  - @ssrx/vite@0.7.2
  - @ssrx/streaming@0.3.1

## 0.5.0

### Minor Changes

- [`162432d`](https://github.com/marbemac/ssrx/commit/162432d8e333c8fa5d8fdf17956c20dd5bef01cb) Thanks
  [@marbemac](https://github.com/marbemac)! - Update module resolution strategy. Update tanstack router plugin and
  example to the latest router version.

### Patch Changes

- Updated dependencies [[`162432d`](https://github.com/marbemac/ssrx/commit/162432d8e333c8fa5d8fdf17956c20dd5bef01cb)]:
  - @ssrx/streaming@0.3.0
  - @ssrx/vite@0.7.0

## 0.4.1

### Patch Changes

- [`5bc83b1`](https://github.com/marbemac/ssrx/commit/5bc83b164ec0bd53ce0d08027151ee0be965454e) Thanks
  [@marbemac](https://github.com/marbemac)! - Improve renderer ctx typings to resolve "Type instantiation is excessively
  deep and possibly infinite" issue.

## 0.4.0

### Minor Changes

- [`91042c2`](https://github.com/marbemac/ssrx/commit/91042c2512c828d942c2e5c2e2fce16dbc0ded67) Thanks
  [@marbemac](https://github.com/marbemac)! - - New packages: `@ssrx/streaming` and `@ssrx/plugin-tanstack-router`
  - New example: `tanstack-router-simple`, re-organize kitchen sink examples
  - Minimum required solid-router version is now 0.10
  - Fix a number of edge cases around lazy route detection
  - Update `RenderPlugin` plugin signature

### Patch Changes

- Updated dependencies [[`91042c2`](https://github.com/marbemac/ssrx/commit/91042c2512c828d942c2e5c2e2fce16dbc0ded67)]:
  - @ssrx/streaming@0.2.0
  - @ssrx/vite@0.6.0

## 0.3.0

### Minor Changes

- [`040ee48`](https://github.com/marbemac/ssrx/commit/040ee4869cf7fa5bb12cbb711be9d47d3d539c29) Thanks
  [@marbemac](https://github.com/marbemac)! - Update deps, split trpc-react out into its own package.

## 0.2.0

### Minor Changes

- [`443b535`](https://github.com/marbemac/ssrx/commit/443b535a5a3767a453114038796baf1f684ebfed) Thanks
  [@marbemac](https://github.com/marbemac)! - - Refactor stream injector in `@ssrx/renderer`
  - Add `@ssrx/remix` and remix-vite example
  - Switch to rollup for the build process on most packages
  - Pass the req.signal to renderToReadableStream in the react/remix renderers
  - Decouple `@ssrx/renderer` from `@ssrx/vite`

## 0.1.4

### Patch Changes

- [`98fcb32`](https://github.com/marbemac/ssrx/commit/98fcb32fea03456cc13ebbf463a89c14f2d4aa65) Thanks
  [@marbemac](https://github.com/marbemac)! - Support multiple wrapping plugins

## 0.1.3

### Patch Changes

- Updated dependencies [[`8bce0ca`](https://github.com/marbemac/ssrx/commit/8bce0cab6578b742406102013bf69cbce5de3c30),
  [`8bc2654`](https://github.com/marbemac/ssrx/commit/8bc26540aa180f53540307a58d0831a859b893f0)]:
  - @ssrx/vite@0.2.0

## 0.1.2

### Patch Changes

- [`2e3125b`](https://github.com/marbemac/ssrx/commit/2e3125b9763041b8ff3d7bede66b51b56f04628a) Thanks
  [@marbemac](https://github.com/marbemac)! - Fix support for CF and edge bundles

## 0.1.1

### Patch Changes

- [`d63f59c`](https://github.com/marbemac/ssrx/commit/d63f59cf72ccd37ca9682f14108883ae3dd90229) Thanks
  [@marbemac](https://github.com/marbemac)! - Externalize react

## 0.1.0

### Minor Changes

- [#5](https://github.com/marbemac/ssrx/pull/5)
  [`63cde46`](https://github.com/marbemac/ssrx/commit/63cde4631a142ffe352a9fa008b09f153a45ce1d) Thanks
  [@marbemac](https://github.com/marbemac)! - - Bump deps
  - Support `basepath` in the vite and react-router plugins

### Patch Changes

- Updated dependencies [[`63cde46`](https://github.com/marbemac/ssrx/commit/63cde4631a142ffe352a9fa008b09f153a45ce1d)]:
  - @ssrx/vite@0.1.0
