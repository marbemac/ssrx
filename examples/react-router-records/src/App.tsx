import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Component as AlbumComponent, loader as albumLoader } from './routes/Album.tsx';
import { Component as HomeComponent, loader as homeLoader } from './routes/Home.tsx';
import Layout from './routes/Layout.tsx';

const router = createBrowserRouter(
  [
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
  ],
  {
    basename: '/react-router-records',
  },
);

export default function App() {
  return <RouterProvider router={router} />;
}
