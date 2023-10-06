import type { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';

import { Component as RootLayout } from './pages/root.tsx';

export const routes: RouteDefinition = {
  path: '/',
  element: RootLayout,
  children: [
    {
      path: '/',
      component: lazy(() => import('~/pages/_index.tsx')),
    },

    {
      path: 'lazy-component',
      component: lazy(() => import('~/pages/lazy-component.tsx')),
    },

    {
      path: 'admin',
      component: lazy(() => import('~/pages/admin.tsx')),
      children: [
        {
          path: '',
          component: lazy(() => import('~/pages/admin._index.tsx')),
        },

        {
          path: 'members',
          component: lazy(() => import('~/pages/admin.members.tsx')),
          children: [
            {
              path: '',
              component: lazy(() => import('~/pages/admin.members._index.tsx')),
            },

            {
              path: ':memberId',
              component: lazy(() => import('~/pages/admin.members.$memberId.tsx')),
            },
          ],
        },
      ],
    },
  ],
};
