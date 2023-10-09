import type { RouteObject } from 'react-router-dom';

import { Component as RootLayout } from './pages/root.tsx';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: () => import('~/pages/_index.tsx'),
      },

      {
        path: 'lazy-component',
        lazy: () => import('~/pages/lazy-component.tsx'),
      },

      {
        path: 'admin',
        lazy: () => import('~/pages/admin.tsx'),
        children: [
          {
            index: true,
            lazy: () => import('~/pages/admin._index.tsx'),
          },

          {
            path: 'members',
            lazy: () => import('~/pages/admin.members.tsx'),
            children: [
              {
                index: true,
                lazy: () => import('~/pages/admin.members._index.tsx'),
              },

              {
                path: ':memberId',
                lazy: () => import('~/pages/admin.members.$memberId.tsx'),
              },
            ],
          },
        ],
      },
    ],
  },
];
