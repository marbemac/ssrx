import './client/globals.css';

import { reactRouterPlugin } from '@ssrx/plugin-react-router';
import { tanstackQueryPlugin } from '@ssrx/plugin-tanstack-query';
import { trpcPlugin } from '@ssrx/plugin-trpc-react';
import { unheadPlugin } from '@ssrx/plugin-unhead';
import { createApp } from '@ssrx/react';
import { viteRendererPlugin } from '@ssrx/vite/renderer';
import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools as QueryDevtools } from '@tanstack/react-query-devtools';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { routes } from '~client/routes.tsx';
import type { AppRouter } from '~server/trpc/index.ts';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

const { clientHandler, serverHandler, ctx } = createApp({
  plugins: [
    viteRendererPlugin(),
    unheadPlugin(),
    tanstackQueryPlugin({
      QueryClientProvider,

      // @TODO: hydration error with devtools atm..
      // due to the way react-router works
      // devTools: { QueryDevtools, options: { buttonPosition: 'bottom-right' } },
    }),
    trpcPlugin<AppRouter>(),
    reactRouterPlugin({ routes }),
  ],
});

export { clientHandler, ctx, serverHandler };
