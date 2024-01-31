import type { TanstackQueryPluginCtx } from '@ssrx/plugin-tanstack-query';
import { PLUGIN_ID as QUERY_PLUGIN_ID } from '@ssrx/plugin-tanstack-query';
import { defineRenderPlugin } from '@ssrx/renderer';
import { type CreateTRPCQueryOptions, createTRPCReact } from '@ssrx/trpc-react-query';
import type { HTTPBatchLinkOptions, TRPCLink } from '@trpc/client';
import { createTRPCUntypedClient } from '@trpc/client';
import { httpBatchLink } from '@trpc/client';
import type { AnyRouter } from '@trpc/server';
import { observable } from '@trpc/server/observable';

export const PLUGIN_ID = 'trpc' as const;

export type TrpcPluginOpts<TRouter extends AnyRouter> = {
  httpBatchLinkOpts?: HTTPBatchLinkOptions;
  createTRPCQueryOptions?: Partial<Omit<CreateTRPCQueryOptions<TRouter>, 'client' | 'queryClient'>>;
};

declare global {
  namespace SSRx {
    interface ReqMeta {
      trpcCaller: ReturnType<AnyRouter['createCaller']>;
    }
  }
}

export const trpcPlugin = <TRouter extends AnyRouter>({
  httpBatchLinkOpts,
  createTRPCQueryOptions,
}: TrpcPluginOpts<TRouter> = {}) => {
  return defineRenderPlugin({
    id: PLUGIN_ID,

    hooks: {
      extendAppCtx: ({ getPluginCtx, meta }) => {
        const { queryClient } = getPluginCtx<TanstackQueryPluginCtx>(QUERY_PLUGIN_ID);

        const trpcClient = createTRPCUntypedClient({
          links: buildLinks({
            trpcCaller: meta?.trpcCaller,
            httpBatchLinkOpts: httpBatchLinkOpts ?? {
              url: '/trpc',
            },
          }),
        });

        const trpc = createTRPCReact<TRouter>({
          client: trpcClient,
          queryClient,
          ...createTRPCQueryOptions,
        });

        return { trpc };
      },
    },
  });
};

export type BuildLinksOpts<T extends AnyRouter> = {
  httpBatchLinkOpts: HTTPBatchLinkOptions;
  trpcCaller?: ReturnType<T['createCaller']>;
};

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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
