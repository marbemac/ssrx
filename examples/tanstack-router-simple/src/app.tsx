// import './globals.css';

import { tanstackRouterPlugin } from '@ssrx/plugin-tanstack-router';
import { createApp } from '@ssrx/react';
import { assetsPlugin } from '@ssrx/renderer/assets';

export const { clientHandler, serverHandler, ctx } = createApp({
  plugins: [assetsPlugin(), tanstackRouterPlugin()],

  // tanstack-router handles the entire root layout, so
  // override the default layout to just pass the children through
  RootLayout: ({ children }) => <>{children}</>,
});
