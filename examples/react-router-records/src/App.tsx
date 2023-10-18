import './index.css';

import { reactRouterPlugin } from '@ssrx/plugin-react-router';
import { createApp } from '@ssrx/react';

import { routes } from './routes.tsx';

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <title>React Router View Transitions Demo</title>
    </head>
    <body className="bg-white text-gray-600 work-sans leading-normal text-base tracking-normal">{children}</body>
  </html>
);

const { clientHandler, serverHandler, ctx } = createApp({
  RootLayout,
  plugins: [reactRouterPlugin({ routes, basename: '/react-router-records' })],
});

export { clientHandler, ctx, serverHandler };
