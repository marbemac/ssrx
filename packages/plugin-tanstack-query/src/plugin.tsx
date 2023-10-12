import { defineRenderPlugin } from '@super-ssr/renderer-core';
import {
  defaultShouldDehydrateQuery,
  dehydrate,
  type DehydratedState,
  type QueryClient,
  type QueryClientConfig,
} from '@tanstack/query-core';
import { stringify } from 'devalue';

import { hydrateStreamingData } from './hydrate.ts';
import { createQueryClient } from './query-client.ts';

export const PLUGIN_ID = 'tanstackQuery' as const;

export type TanstackQueryPluginOpts = {
  QueryClientProvider: (props: { client: QueryClient; children?: any }) => any;

  /**
   * If your adapter handles hydration itself (solidjs, for example), set this to true.
   */
  skipHydration?: boolean;

  /**
   * Override the default query client config
   */
  queryClientConfig?: QueryClientConfig;
};

type TanstackQueryCtx = {
  queryClient: QueryClient;
  trackedQueries: Set<string>;
  blockingQueries: Map<string, Promise<void>>;
};

declare global {
  export let $TQD: DehydratedState[];
  export let $TQS: (data: DehydratedState) => void;
}

export const tanstackQueryPlugin = ({
  QueryClientProvider,
  skipHydration,
  queryClientConfig,
}: TanstackQueryPluginOpts) =>
  defineRenderPlugin({
    id: PLUGIN_ID,

    hooks: {
      extendRequestCtx: () => {
        const trackedQueries = new Set<string>();
        const blockingQueries = new Map<string, Promise<void>>();
        const queryClient = createQueryClient({ trackedQueries, blockingQueries, clientConfig: queryClientConfig });

        if (!import.meta.env.SSR) {
          // hydrate on the client
          hydrateStreamingData({ queryClient });
        }

        return { trackedQueries, blockingQueries, queryClient };
      },

      wrapApp: ({ ctx, children }) => {
        return <QueryClientProvider client={(ctx as TanstackQueryCtx).queryClient}>{children}</QueryClientProvider>;
      },

      emitToDocumentHead() {
        if (skipHydration) return;

        /**
         * $TQD is the global we'll use to track the queries
         * - see hydrate.ts for how the client uses this
         * - see emitBeforeSsrChunk() to see how the server uses this
         */
        const html: string[] = [`$TQD = [];`, `$TQS = data => $TQD.push(data);`];

        return `<script>${html.join('')}</script>`;
      },

      async emitBeforeSsrChunk({ ctx }) {
        if (skipHydration) return;

        const { blockingQueries, trackedQueries, queryClient } = ctx as TanstackQueryCtx;

        // If there are any queries marked with deferStream, block the stream until they are completed
        if (blockingQueries.size) {
          await Promise.allSettled(blockingQueries.values());
          blockingQueries.clear();
        }

        if (!trackedQueries.size) return;

        /**
         * Dehydrated state of the client where we only include the queries
         * that were added/updated since the last flush
         */
        const shouldDehydrate = defaultShouldDehydrateQuery;

        const dehydratedState = dehydrate(queryClient, {
          shouldDehydrateQuery(query) {
            return trackedQueries.has(query.queryHash) && shouldDehydrate(query);
          },
        });
        trackedQueries.clear();

        if (!dehydratedState.queries.length) return;

        const dehydratedString = JSON.stringify(stringify(dehydratedState));

        return `<script>${[`$TQS(${dehydratedString})`].join('')}</script>`;
      },
    },

    // @TODO: queryClient.clear() on request finished
  });
