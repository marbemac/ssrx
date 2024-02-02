import './index.css';

import { reactRouterPlugin } from '@ssrx/plugin-react-router';
import { createApp } from '@ssrx/react';
import { assetsPlugin } from '@ssrx/renderer/assets';

export const { clientHandler, serverHandler, ctx } = createApp({
  RootLayout,
  plugins: [assetsPlugin(), reactRouterPlugin()],
});

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
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
}
