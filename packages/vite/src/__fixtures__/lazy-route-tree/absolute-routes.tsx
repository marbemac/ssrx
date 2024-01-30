export const routes = [
  {
    path: '/',
    children: [
      {
        index: true,
        lazy: () => import('./routes/_index.tsx'),
      },
      {
        path: 'lazy-component',
        lazy: () => import('./routes/lazy-component.tsx'),
      },
      {
        path: 'admin',
        children: [
          {
            index: true,
          },
          {
            path: 'logs',
            lazy: () => import('./routes/lazy-component.tsx'),
          },
          {
            path: '/secret-admin/members',
            lazy: () => import('./routes/admin.members.tsx'),
            children: [
              {
                index: true,
                lazy: () => import('./routes/admin.members._index.tsx'),
              },
              {
                path: ':memberId',
                lazy: () => import('./routes/admin.members.$memberId.tsx'),
              },
            ],
          },
        ],
      },
    ],
  },
];
