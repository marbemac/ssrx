# @ssrx/plugin-trpc-react

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
