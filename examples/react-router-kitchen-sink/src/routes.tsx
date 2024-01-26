import type { RouteObject } from 'react-router-dom';
import { route } from 'react-router-typesafe-routes/dom';

import { RouteErrorBoundary } from '~/components/route-error-boundary.tsx';
import { Component as RootLayout } from '~/routes/root.tsx';

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
        lazy: () => import('~/routes/_index.tsx'),
      },

      {
        path: paths.Wait.path,
        lazy: () => import('~/routes/wait.tsx'),
      },

      {
        path: paths.Articles.path,
        lazy: () => import('~/routes/articles.tsx'),
        children: [
          {
            index: true,
            lazy: () => import('~/routes/articles._index.tsx'),
          },

          {
            path: paths.Article.Edit.path,
            lazy: () => import('~/routes/articles.$articleId.edit.tsx'),
          },

          {
            path: paths.Article.path,
            lazy: () => import('~/routes/articles.$articleId.tsx'),
          },
        ],
      },
    ],
  },
];
