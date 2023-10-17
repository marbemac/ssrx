import { RootRoute, Route } from '@tanstack/react-router';

import { lazyRouteComponent } from '../../lazy-route-component.ts';
import { Component as RootLayout } from './pages/root.tsx';

const rootRoute = new RootRoute({ component: RootLayout });

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('./pages/_index.tsx')),
});

const blogRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'blog',
  component: lazyRouteComponent(() => import('./pages/blog.tsx'), 'BlogNamed'),
});

const blogIndexRoute = new Route({ getParentRoute: () => blogRoute, path: '/' });

const userRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'users/$userId/',
});

const splat1Route = new Route({
  getParentRoute: () => rootRoute,
  path: 'catch-all-1/$',
});

const splat2Route = new Route({
  getParentRoute: () => rootRoute,
  path: 'catch-all-2/*',
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  userRoute,
  blogRoute.addChildren([blogIndexRoute]),
  splat1Route,
  splat2Route,
]);
