import './app.css';

import { reactRouterPlugin } from '@super-ssr/plugin-react-router';
import { tanstackQueryPlugin } from '@super-ssr/plugin-tanstack-query';
import { trpcPlugin } from '@super-ssr/plugin-trpc-react';
import { unheadPlugin } from '@super-ssr/plugin-unhead';
import { createApp } from '@super-ssr/react';
import { QueryClientProvider } from '@tanstack/react-query';

// import { ReactQueryDevtools as QueryDevtools } from '@tanstack/react-query-devtools';
import { routes } from '~/routes.tsx';

import type { AppRouter } from './server/trpc';

const { clientHandler, serverHandler, ctx } = createApp({
  plugins: [
    unheadPlugin(),
    tanstackQueryPlugin({
      QueryClientProvider,

      // @TODO: hydration error with devtools atm.. not sure if it's an issue in tanstack query itself or not
      // devTools: { QueryDevtools, options: { buttonPosition: 'bottom-right' } },
    }),
    trpcPlugin<AppRouter>(),
    reactRouterPlugin({ routes }),
  ],
});

export { clientHandler, ctx, serverHandler };
