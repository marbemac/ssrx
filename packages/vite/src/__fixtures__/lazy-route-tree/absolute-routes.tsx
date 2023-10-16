export const routes = [
  {
    path: '/',
    children: [
      {
        index: true,
        lazy: () => import('./pages/_index.tsx'),
      },
      {
        path: 'lazy-component',
        lazy: () => import('./pages/lazy-component.tsx'),
      },
      {
        path: 'admin',
        children: [
          {
            index: true,
          },
          {
            path: 'logs',
            lazy: () => import('./pages/lazy-component.tsx'),
          },
          {
            path: '/secret-admin/members',
            lazy: () => import('./pages/admin.members.tsx'),
            children: [
              {
                index: true,
                lazy: () => import('./pages/admin.members._index.tsx'),
              },
              {
                path: ':memberId',
                lazy: () => import('./pages/admin.members.$memberId.tsx'),
              },
            ],
          },
        ],
      },
    ],
  },
];
