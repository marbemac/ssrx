import { createRootRoute, createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { Component as RootLayout } from './pages/root.tsx';

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
}).lazy(() => import('./pages/_index.tsx').then(d => d.Route));

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'blog',
}).lazy(() => import('./pages/blog.tsx').then(d => d.Route));

const blogIndexRoute = createRoute({ getParentRoute: () => blogRoute, path: '/' });

const expensiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'expensive',
  component: lazyRouteComponent(() => import('./components/expensive.tsx')),
});

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'users/$userId/',
});

const splat1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: 'catch-all-1/$',
});

const splat2Route = createRoute({
  getParentRoute: () => rootRoute,
  path: 'catch-all-2/*',
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  expensiveRoute,
  userRoute,
  blogRoute.addChildren([blogIndexRoute]),
  splat1Route,
  splat2Route,
]);
