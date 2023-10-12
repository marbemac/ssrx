import type { TanstackQueryPluginCtx } from '@super-ssr/plugin-tanstack-query';
import { PLUGIN_ID as QUERY_PLUGIN_ID } from '@super-ssr/plugin-tanstack-query';
import { defineRenderPlugin } from '@super-ssr/renderer-core';
import type { HTTPBatchLinkOptions, TRPCLink } from '@trpc/client';
import { createTRPCUntypedClient } from '@trpc/client';
import { httpBatchLink } from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import { observable } from '@trpc/server/observable';

import { createTRPCReact } from './trpc-react/index.ts';

export const PLUGIN_ID = 'trpc' as const;

export type TrpcPluginOpts = {
  httpBatchLinkOpts?: HTTPBatchLinkOptions;
};

export const trpcPlugin = <TRouter extends AnyRouter>({ httpBatchLinkOpts }: TrpcPluginOpts = {}) => {
  return defineRenderPlugin({
    id: PLUGIN_ID,

    hooks: {
      'app:extendCtx': ({ getPluginCtx, meta }) => {
        const { queryClient } = getPluginCtx<TanstackQueryPluginCtx>(QUERY_PLUGIN_ID);

        const trpcClient = createTRPCUntypedClient({
          links: buildLinks({
            trpcCaller: meta?.['trpcCaller'] as any,
            httpBatchLinkOpts: httpBatchLinkOpts || {
              url: '/trpc',
            },
          }),
        });

        const trpc = createTRPCReact<TRouter>({
          client: trpcClient,
          queryClient,
          unstable_overrides: {
            useMutation: {
              async onSuccess(opts) {
                // Calls the `onSuccess` defined in the `useQuery()`-options:
                await opts.originalFn();

                // Simplest cache strategy.. always invalidate active queries after any mutation
                return queryClient.invalidateQueries({
                  // mark all queries as stale
                  type: 'all',
                  // only immediately refetch active queries
                  refetchType: 'active',
                });
              },
            },
          },
        });

        return { trpc };
      },
    },
  });
};

export interface BuildLinksOpts<T extends AnyRouter> {
  httpBatchLinkOpts: HTTPBatchLinkOptions;
  trpcCaller?: ReturnType<T['createCaller']>;
}

export const buildLinks = <T extends AnyRouter>(opts: BuildLinksOpts<T>) => {
  const links: TRPCLink<T>[] = [];

  if (import.meta.env.SSR) {
    const { trpcCaller } = opts;
    if (!trpcCaller) {
      throw new Error('Error building TRPC links. trpcCaller must be passed in on the server');
    }

    /**
     * On the server, call the procedure directly rather than making a remote http request.
     * Adapted from info in https://github.com/trpc/trpc/issues/3335.
     */
    const procedureLink: TRPCLink<T> = () => {
      return ({ op }) => {
        if (op.type === 'query') {
          return observable(observer => {
            // @ts-expect-error we don't need to strongly type this
            const promise: Promise<unknown> = op.path.split('.').reduce(function (o, key) {
              return o[key];
            }, trpcCaller)(op.input);

            promise
              .then(data => {
                observer.next({ result: { data } });
                observer.complete();
              })
              .catch(error => {
                observer.error(error);
              });
          });
        }

        throw new Error('Only query operations are supported on the server');
      };
    };

    links.push(procedureLink);
  } else {
    links.push(httpBatchLink(opts.httpBatchLinkOpts));
  }

  return links;
};
