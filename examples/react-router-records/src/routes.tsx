import type { RouteObject } from 'react-router-dom';

import { Component as AlbumComponent, loader as albumLoader } from './routes/Album.tsx';
import { Component as HomeComponent, loader as homeLoader } from './routes/Home.tsx';
import Layout from './routes/Layout.tsx';

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        loader: homeLoader,
        Component: HomeComponent,
      },
      {
        path: 'album/:id',
        loader: albumLoader,
        Component: AlbumComponent,
      },
    ],
  },
];
