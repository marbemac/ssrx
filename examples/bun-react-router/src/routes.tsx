import type { RouteObject } from 'react-router-dom';

import { Component as RootLayout } from '~/routes/root.tsx';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: () => import('~/routes/_index.tsx'),
      },

      {
        path: 'lazy-component',
        lazy: () => import('~/routes/lazy-component.tsx'),
      },

      {
        path: 'admin',
        lazy: () => import('~/routes/admin.tsx'),
        children: [
          {
            index: true,
            lazy: () => import('~/routes/admin._index.tsx'),
          },

          {
            path: 'members',
            lazy: () => import('~/routes/admin.members.tsx'),
            children: [
              {
                index: true,
                lazy: () => import('~/routes/admin.members._index.tsx'),
              },

              {
                path: ':memberId',
                lazy: () => import('~/routes/admin.members.$memberId.tsx'),
              },
            ],
          },
        ],
      },
    ],
  },
];
