export const routes = [
  {
    path: '/',
    children: [
      {
        index: true,
        lazy: () => import('./routes/_index.tsx').then(r => r.Component),
      },
    ],
  },
];
