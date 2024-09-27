# @ssrx/solid

## 0.5.0

### Minor Changes

- [`162432d`](https://github.com/marbemac/ssrx/commit/162432d8e333c8fa5d8fdf17956c20dd5bef01cb) Thanks
  [@marbemac](https://github.com/marbemac)! - Update module resolution strategy. Update tanstack router plugin and
  example to the latest router version.

### Patch Changes

- Updated dependencies [[`162432d`](https://github.com/marbemac/ssrx/commit/162432d8e333c8fa5d8fdf17956c20dd5bef01cb)]:
  - @ssrx/renderer@0.5.0
  - @ssrx/streaming@0.3.0
  - @ssrx/vite@0.7.0

## 0.4.2

### Patch Changes

- [`a3ebb2d`](https://github.com/marbemac/ssrx/commit/a3ebb2d215b220591f457af8a373a96ab5393438) Thanks
  [@marbemac](https://github.com/marbemac)! - Require @ssrx/renderer >= 0.4

## 0.4.1

### Patch Changes

- [`973c8c0`](https://github.com/marbemac/ssrx/commit/973c8c0415bfa40365a2e363cc60e21503904a8b) Thanks
  [@marbemac](https://github.com/marbemac)! - Wrap the stream in the solid request event async ctx so that cache
  function from solid-router can be used in v0.11+.

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
  - @ssrx/renderer@0.4.0
  - @ssrx/vite@0.6.0

## 0.3.1

### Patch Changes

- Updated dependencies [[`b9b25b3`](https://github.com/marbemac/ssrx/commit/b9b25b37fecc4a443599d59d73dfdf506769517d),
  [`c44d7bf`](https://github.com/marbemac/ssrx/commit/c44d7bf463ff41eeb53ea4bd79580a9d8ce87471),
  [`db81922`](https://github.com/marbemac/ssrx/commit/db819220a1ed2006c8e2bdbd50ff6d6ab6d40b16),
  [`dc4b723`](https://github.com/marbemac/ssrx/commit/dc4b723b031fc89e36beff8c1b1bde0b64283673)]:
  - @ssrx/vite@0.5.0

## 0.3.0

### Minor Changes

- [`040ee48`](https://github.com/marbemac/ssrx/commit/040ee4869cf7fa5bb12cbb711be9d47d3d539c29) Thanks
  [@marbemac](https://github.com/marbemac)! - Update deps, split trpc-react out into its own package.

### Patch Changes

- Updated dependencies [[`040ee48`](https://github.com/marbemac/ssrx/commit/040ee4869cf7fa5bb12cbb711be9d47d3d539c29)]:
  - @ssrx/renderer@0.3.0
  - @ssrx/vite@0.4.0

## 0.2.0

### Minor Changes

- [`443b535`](https://github.com/marbemac/ssrx/commit/443b535a5a3767a453114038796baf1f684ebfed) Thanks
  [@marbemac](https://github.com/marbemac)! - - Refactor stream injector in `@ssrx/renderer`
  - Add `@ssrx/remix` and remix-vite example
  - Switch to rollup for the build process on most packages
  - Pass the req.signal to renderToReadableStream in the react/remix renderers
  - Decouple `@ssrx/renderer` from `@ssrx/vite`

### Patch Changes

- Updated dependencies [[`443b535`](https://github.com/marbemac/ssrx/commit/443b535a5a3767a453114038796baf1f684ebfed)]:
  - @ssrx/renderer@0.2.0
  - @ssrx/vite@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`8bce0ca`](https://github.com/marbemac/ssrx/commit/8bce0cab6578b742406102013bf69cbce5de3c30),
  [`8bc2654`](https://github.com/marbemac/ssrx/commit/8bc26540aa180f53540307a58d0831a859b893f0)]:
  - @ssrx/vite@0.2.0
  - @ssrx/renderer@0.1.3

## 0.1.0

### Minor Changes

- [#5](https://github.com/marbemac/ssrx/pull/5)
  [`63cde46`](https://github.com/marbemac/ssrx/commit/63cde4631a142ffe352a9fa008b09f153a45ce1d) Thanks
  [@marbemac](https://github.com/marbemac)! - - Bump deps
  - Support `basepath` in the vite and react-router plugins

### Patch Changes

- Updated dependencies [[`63cde46`](https://github.com/marbemac/ssrx/commit/63cde4631a142ffe352a9fa008b09f153a45ce1d)]:
  - @ssrx/renderer@0.1.0
  - @ssrx/vite@0.1.0
