# @ssrx/trpc-react

## 0.4.1

### Patch Changes

- [`8df5fea`](https://github.com/marbemac/ssrx/commit/8df5fea9c2a308c321ae181942f011e834d010e4) Thanks
  [@marbemac](https://github.com/marbemac)! - Fix various import resolution issues.

## 0.4.0

### Minor Changes

- [`162432d`](https://github.com/marbemac/ssrx/commit/162432d8e333c8fa5d8fdf17956c20dd5bef01cb) Thanks
  [@marbemac](https://github.com/marbemac)! - Update module resolution strategy. Update tanstack router plugin and
  example to the latest router version.

## 0.3.0

### Minor Changes

- [`da6fec0`](https://github.com/marbemac/ssrx/commit/da6fec0fd261b56796e6665af0efbf884ac7e476) Thanks
  [@marbemac](https://github.com/marbemac)! - Per tanstack query recommendations, stop using the suspense: true option
  by default. Thus you must change your .useQuery() instances to .useSuspenseQuery() if you would like to preserve the
  SSR data fetching.

## 0.2.0

### Minor Changes

- [`91042c2`](https://github.com/marbemac/ssrx/commit/91042c2512c828d942c2e5c2e2fce16dbc0ded67) Thanks
  [@marbemac](https://github.com/marbemac)! - - New packages: `@ssrx/streaming` and `@ssrx/plugin-tanstack-router`
  - New example: `tanstack-router-simple`, re-organize kitchen sink examples
  - Minimum required solid-router version is now 0.10
  - Fix a number of edge cases around lazy route detection
  - Update `RenderPlugin` plugin signature

## 0.1.2

### Patch Changes

- [`a4ebe64`](https://github.com/marbemac/ssrx/commit/a4ebe64d5b8f8c5e62182b3224dd36c4c73ba2b1) Thanks
  [@marbemac](https://github.com/marbemac)! - Extend QueryObserverOptions in useQuery

## 0.1.1

### Patch Changes

- [`8fe572b`](https://github.com/marbemac/ssrx/commit/8fe572b87f0bf2f86d51933f97118beeec44413b) Thanks
  [@marbemac](https://github.com/marbemac)! - Remove reliance on react-query context.

## 0.1.0

### Minor Changes

- [`040ee48`](https://github.com/marbemac/ssrx/commit/040ee4869cf7fa5bb12cbb711be9d47d3d539c29) Thanks
  [@marbemac](https://github.com/marbemac)! - Update deps, split trpc-react out into its own package.
