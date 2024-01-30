export const routes = [
  {
    path: '/about',
    lazy: () => import('./routes/about.lazy.tsx'),
    children: [
      {
        path: 'nested',
        lazy: () => import('./routes/about.nested.lazy.tsx'),
      },
    ],
  },
];
