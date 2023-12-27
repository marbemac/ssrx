# @ssrx/vite

## 0.4.0

### Minor Changes

- [`040ee48`](https://github.com/marbemac/ssrx/commit/040ee4869cf7fa5bb12cbb711be9d47d3d539c29) Thanks
  [@marbemac](https://github.com/marbemac)! - Update deps, split trpc-react out into its own package.

### Patch Changes

- Updated dependencies [[`040ee48`](https://github.com/marbemac/ssrx/commit/040ee4869cf7fa5bb12cbb711be9d47d3d539c29)]:
  - @ssrx/renderer@0.3.0

## 0.3.0

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

## 0.2.1

### Patch Changes

- [`300f361`](https://github.com/marbemac/ssrx/commit/300f3611325eb34134f37f66313642d9a074b812) Thanks
  [@marbemac](https://github.com/marbemac)! - Warn on circular client chunk imports

- [`ad52136`](https://github.com/marbemac/ssrx/commit/ad521367cdfb993d91b2af3d994eecf2ebd6b00f) Thanks
  [@marbemac](https://github.com/marbemac)! - Ensure asset URLs are absolute

## 0.2.0

### Minor Changes

- [`8bc2654`](https://github.com/marbemac/ssrx/commit/8bc26540aa180f53540307a58d0831a859b893f0) Thanks
  [@marbemac](https://github.com/marbemac)! - Generate routes and headers for cf pages runtime target

### Patch Changes

- [`8bce0ca`](https://github.com/marbemac/ssrx/commit/8bce0cab6578b742406102013bf69cbce5de3c30) Thanks
  [@marbemac](https://github.com/marbemac)! - Add cf-pages runtime target

## 0.1.2

### Patch Changes

- [`2e3125b`](https://github.com/marbemac/ssrx/commit/2e3125b9763041b8ff3d7bede66b51b56f04628a) Thanks
  [@marbemac](https://github.com/marbemac)! - Fix support for CF and edge bundles

## 0.1.1

### Patch Changes

- [`7cd40d7`](https://github.com/marbemac/ssrx/commit/7cd40d7ff7b1aeb8f0853e454e3262dee569253a) Thanks
  [@marbemac](https://github.com/marbemac)! - Make sure to process @ssrx packages with the Vite pipeline

## 0.1.0

### Minor Changes

- [#5](https://github.com/marbemac/ssrx/pull/5)
  [`63cde46`](https://github.com/marbemac/ssrx/commit/63cde4631a142ffe352a9fa008b09f153a45ce1d) Thanks
  [@marbemac](https://github.com/marbemac)! - - Bump deps
  - Support `basepath` in the vite and react-router plugins
