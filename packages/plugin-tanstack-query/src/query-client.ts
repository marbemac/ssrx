import { deepmerge } from '@ssrx/renderer';
import { QueryCache, QueryClient, type QueryClientConfig } from '@tanstack/query-core';

type CreateQueryClientOpts = {
  trackedQueries?: Set<string>;
  blockingQueries?: Map<string, Promise<void>>;
  clientConfig?: QueryClientConfig;
};

export const createQueryClient = ({ trackedQueries, blockingQueries, clientConfig }: CreateQueryClientOpts = {}) => {
  const blockingQueryResolvers = new Map<string, () => void>();

  const queryCache = blockingQueries
    ? new QueryCache({
        onSettled(data, error, query) {
          const blockingQuery = blockingQueryResolvers.get(query.queryHash);
          if (blockingQuery) {
            // resolve it
            blockingQuery();
          }
        },
      })
    : undefined;

  const queryClient: QueryClient = new QueryClient({
    queryCache,
    defaultOptions: deepmerge(
      {
        queries: {
          suspense: true,
          retry: false,
          staleTime: 1000 * 30,
          refetchOnReconnect: true,
          refetchOnWindowFocus: true,
        },
      },
      clientConfig?.defaultOptions || {},
    ),
  });

  if (trackedQueries && import.meta.env.SSR) {
    // Do we need to care about unsubscribing? I don't think so to be honest
    queryClient.getQueryCache().subscribe(event => {
      /**
       * A special flag that for now we're exposing on the generic meta object
       * Setting deferStream to true will cause the stream to pause until the query is resolved
       */
      const defer = event.query.meta?.['deferStream'];

      switch (event.type) {
        case 'added':
        case 'updated':
          trackedQueries.add(event.query.queryHash);

          if (event.type === 'added' && defer) {
            blockingQueries?.set(
              event.query.queryHash,
              new Promise(r => blockingQueryResolvers.set(event.query.queryHash, r)),
            );
          }
      }
    });
  }

  return queryClient;
};
