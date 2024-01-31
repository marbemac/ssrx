# @ssrx/vite

## 0.6.0

### Minor Changes

- [`91042c2`](https://github.com/marbemac/ssrx/commit/91042c2512c828d942c2e5c2e2fce16dbc0ded67) Thanks
  [@marbemac](https://github.com/marbemac)! - - New packages: `@ssrx/streaming` and `@ssrx/plugin-tanstack-router`
  - New example: `tanstack-router-simple`, re-organize kitchen sink examples
  - Minimum required solid-router version is now 0.10
  - Fix a number of edge cases around lazy route detection
  - Update `RenderPlugin` plugin signature

## 0.5.0

### Minor Changes

- [`c44d7bf`](https://github.com/marbemac/ssrx/commit/c44d7bf463ff41eeb53ea4bd79580a9d8ce87471) Thanks
  [@marbemac](https://github.com/marbemac)! - Dropped support for vite 4

- [`db81922`](https://github.com/marbemac/ssrx/commit/db819220a1ed2006c8e2bdbd50ff6d6ab6d40b16) Thanks
  [@marbemac](https://github.com/marbemac)! - Support CSS modules.

### Patch Changes

- [`b9b25b3`](https://github.com/marbemac/ssrx/commit/b9b25b37fecc4a443599d59d73dfdf506769517d) Thanks
  [@marbemac](https://github.com/marbemac)! - Fixed ssr build issue due to Vite v5 breaking change from rc -> stable

- [`dc4b723`](https://github.com/marbemac/ssrx/commit/dc4b723b031fc89e36beff8c1b1bde0b64283673) Thanks
  [@marbemac](https://github.com/marbemac)! - Response base resolve conditions in ssr conditions during builds. Fixes an
  issue with solidjs.

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
