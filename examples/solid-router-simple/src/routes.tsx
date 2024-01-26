import type { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';

import { loader as homeLoader } from '~/routes/_index/loader.ts';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    load: homeLoader,
    component: lazy(() => import('~/routes/_index/route.tsx')),
  },

  {
    path: 'lazy-component',
    component: lazy(() => import('~/routes/lazy-component.tsx')),
  },

  {
    path: 'admin',
    component: lazy(() => import('~/routes/admin.tsx')),
    children: [
      {
        path: '',
        component: lazy(() => import('~/routes/admin._index.tsx')),
      },

      {
        path: 'members',
        component: lazy(() => import('~/routes/admin.members.tsx')),
        children: [
          {
            path: '',
            component: lazy(() => import('~/routes/admin.members._index.tsx')),
          },

          {
            path: ':memberId',
            component: lazy(() => import('~/routes/admin.members.$memberId.tsx')),
          },
        ],
      },
    ],
  },
];
