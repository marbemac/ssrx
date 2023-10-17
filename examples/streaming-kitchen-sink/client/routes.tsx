import type { RouteObject } from 'react-router-dom';
import { route } from 'react-router-typesafe-routes/dom';

import { RouteErrorBoundary } from '~client/components/route-error-boundary.tsx';
import { Component as RootLayout } from '~client/pages/root.tsx';

export const paths = {
  Wait: route('wait'),
  Articles: route('articles', {}),
  Article: route(
    'articles/:articleId',
    {},
    {
      Edit: route('edit'),
    },
  ),
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: () => import('~client/pages/_index.tsx'),
      },

      {
        path: paths.Wait.path,
        lazy: () => import('~client/pages/wait.tsx'),
      },

      {
        path: paths.Articles.path,
        lazy: () => import('~client/pages/articles.tsx'),
        children: [
          {
            index: true,
            lazy: () => import('~client/pages/articles._index.tsx'),
          },

          {
            path: paths.Article.Edit.path,
            lazy: () => import('~client/pages/articles.$articleId.edit.tsx'),
          },

          {
            path: paths.Article.path,
            lazy: () => import('~client/pages/articles.$articleId.tsx'),
          },
        ],
      },
    ],
  },
];
