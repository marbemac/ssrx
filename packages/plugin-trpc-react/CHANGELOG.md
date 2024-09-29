# @ssrx/plugin-trpc-react

## 0.6.2

### Patch Changes

- [`7540345`](https://github.com/marbemac/ssrx/commit/7540345e18377690488cded7cb7a40566f8642f2) Thanks
  [@marbemac](https://github.com/marbemac)! - explicitly set plugin-trpc-react dep versions

## 0.6.1

### Patch Changes

- [`8df5fea`](https://github.com/marbemac/ssrx/commit/8df5fea9c2a308c321ae181942f011e834d010e4) Thanks
  [@marbemac](https://github.com/marbemac)! - Fix various import resolution issues.

- Updated dependencies [[`8df5fea`](https://github.com/marbemac/ssrx/commit/8df5fea9c2a308c321ae181942f011e834d010e4)]:
  - @ssrx/renderer@0.5.1
  - @ssrx/plugin-tanstack-query@0.6.1
  - @ssrx/trpc-react-query@0.4.1

## 0.6.0

### Minor Changes

- [`162432d`](https://github.com/marbemac/ssrx/commit/162432d8e333c8fa5d8fdf17956c20dd5bef01cb) Thanks
  [@marbemac](https://github.com/marbemac)! - Update module resolution strategy. Update tanstack router plugin and
  example to the latest router version.

### Patch Changes

- Updated dependencies [[`162432d`](https://github.com/marbemac/ssrx/commit/162432d8e333c8fa5d8fdf17956c20dd5bef01cb)]:
  - @ssrx/plugin-tanstack-query@0.6.0
  - @ssrx/renderer@0.5.0
  - @ssrx/trpc-react-query@0.4.0

## 0.5.0

### Minor Changes

- [`91042c2`](https://github.com/marbemac/ssrx/commit/91042c2512c828d942c2e5c2e2fce16dbc0ded67) Thanks
  [@marbemac](https://github.com/marbemac)! - - New packages: `@ssrx/streaming` and `@ssrx/plugin-tanstack-router`
  - New example: `tanstack-router-simple`, re-organize kitchen sink examples
  - Minimum required solid-router version is now 0.10
  - Fix a number of edge cases around lazy route detection
  - Update `RenderPlugin` plugin signature

### Patch Changes

- Updated dependencies [[`91042c2`](https://github.com/marbemac/ssrx/commit/91042c2512c828d942c2e5c2e2fce16dbc0ded67)]:
  - @ssrx/plugin-tanstack-query@0.4.0
  - @ssrx/trpc-react-query@0.2.0
  - @ssrx/renderer@0.4.0

## 0.4.0

### Minor Changes

- [`040ee48`](https://github.com/marbemac/ssrx/commit/040ee4869cf7fa5bb12cbb711be9d47d3d539c29) Thanks
  [@marbemac](https://github.com/marbemac)! - Update deps, split trpc-react out into its own package.

### Patch Changes

- Updated dependencies [[`040ee48`](https://github.com/marbemac/ssrx/commit/040ee4869cf7fa5bb12cbb711be9d47d3d539c29)]:
  - @ssrx/plugin-tanstack-query@0.3.0
  - @ssrx/renderer@0.3.0
  - @ssrx/trpc-react-query@0.1.0

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
  - @ssrx/plugin-tanstack-query@0.2.0

## 0.2.0

### Minor Changes

- [`cec262e`](https://github.com/marbemac/ssrx/commit/cec262ec3c80fba5f5d6c9af066672137e534e1d) Thanks
  [@marbemac](https://github.com/marbemac)! - Do not make onSuccess decision in trpc react, allow user to pass their own
  if needed

## 0.1.0

### Minor Changes

- [`991b34d`](https://github.com/marbemac/ssrx/commit/991b34d3faf0195401ac99a0094718b11db493a5) Thanks
  [@marbemac](https://github.com/marbemac)! - Expose fetchQuery on the query TRPC client

### Patch Changes

- Updated dependencies [[`991b34d`](https://github.com/marbemac/ssrx/commit/991b34d3faf0195401ac99a0094718b11db493a5)]:
  - @ssrx/plugin-tanstack-query@0.1.0

## 0.0.3

### Patch Changes

- [`d63f59c`](https://github.com/marbemac/ssrx/commit/d63f59cf72ccd37ca9682f14108883ae3dd90229) Thanks
  [@marbemac](https://github.com/marbemac)! - Externalize react

## 0.0.2

### Patch Changes

- Updated dependencies [[`63cde46`](https://github.com/marbemac/ssrx/commit/63cde4631a142ffe352a9fa008b09f153a45ce1d)]:
  - @ssrx/renderer@0.1.0
