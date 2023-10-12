import './app.css';

import { reactRouterPlugin } from '@super-ssr/plugin-react-router';
import { tanstackQueryPlugin } from '@super-ssr/plugin-tanstack-query';
import { unheadPlugin } from '@super-ssr/plugin-unhead';
import { createApp } from '@super-ssr/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { routes } from './routes.tsx';

const { clientHandler, serverHandler, ctx } = createApp({
  plugins: [unheadPlugin(), tanstackQueryPlugin({ QueryClientProvider }), reactRouterPlugin({ routes })],
});

export { clientHandler, ctx, serverHandler };
