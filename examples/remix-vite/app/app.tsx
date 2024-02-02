import { tanstackQueryPlugin } from '@ssrx/plugin-tanstack-query';
import { trpcPlugin } from '@ssrx/plugin-trpc-react';
import { createApp } from '@ssrx/remix';
import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools as QueryDevtools } from '@tanstack/react-query-devtools';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '~api/trpc/index.ts';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const TRPC_ROOT = 'api/_rpc';

const { clientHandler, serverHandler, ctx } = createApp({
  abortDelay: 5000,
  plugins: [
    tanstackQueryPlugin({
      provider: ({ children, queryClient }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),

      queryClientConfig: {
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 1000 * 60,
            refetchOnReconnect: true,
            refetchOnWindowFocus: true,
          },
        },
      },

      // @TODO: hydration error with devtools atm..
      // due to the way react-router works
      // devTools: { QueryDevtools, options: { buttonPosition: 'bottom-right' } },
    }),

    trpcPlugin<AppRouter>({ httpBatchLinkOpts: { url: `/${TRPC_ROOT}` } }),
  ],
});

export { clientHandler, ctx, serverHandler };
