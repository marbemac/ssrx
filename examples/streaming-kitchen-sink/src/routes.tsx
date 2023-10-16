import type { RouteObject } from 'react-router-dom';

import { RouteErrorBoundary } from './components/route-error-boundary.tsx';
import { Component as RootLayout } from './pages/root.tsx';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: () => import('~/pages/_index.tsx'),
      },

      {
        path: 'wait',
        lazy: () => import('~/pages/wait.tsx'),
      },

      {
        path: 'articles',
        lazy: () => import('~/pages/articles.tsx'),
        children: [
          {
            index: true,
            lazy: () => import('~/pages/articles._index.tsx'),
          },

          {
            path: ':articleId/edit',
            lazy: () => import('~/pages/articles.$articleId.edit.tsx'),
          },

          {
            path: ':articleId',
            lazy: () => import('~/pages/articles.$articleId.tsx'),
          },
        ],
      },
    ],
  },
];
