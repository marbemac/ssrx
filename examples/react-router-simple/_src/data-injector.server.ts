import type {
  DehydrateOptions,
  HydrateOptions,
  QueryClient,
} from "@tanstack/react-query";
import { defaultShouldDehydrateQuery, dehydrate } from "@tanstack/react-query";

import { injectIntoStream } from "./transformer.server.ts";

export const createDataInjector = ({
  // blockingQueries,
  // trackedQueries,
  // queryClient,
  options,
  serialize,
  headString,
}: {
  // trackedQueries: Set<string>;
  // blockingQueries: Map<string, Promise<void>>;
  // queryClient: QueryClient;
  headString?: string;
  options?: {
    hydrate?: HydrateOptions;
    dehydrate?: DehydrateOptions;
  };
  serialize?: (object: any) => any;
}) => {
  return injectIntoStream({
    async emitToDocumentHead() {
      const html: string[] = [`$TQD = [];`, `$TQS = data => $TQD.push(data);`];

      // const assets = await import.meta.env.MANIFEST.getAssetsHtml(req.url)

      return [headString, `<script>${html.join("")}</script>`].join("");
    },

    // async emitBeforeSsrChunk() {
    //   // If there are any queries marked with deferStream, block the stream until they are completed
    //   if (blockingQueries.size) {
    //     await Promise.allSettled(blockingQueries.values());
    //     blockingQueries.clear();
    //   }

    //   if (!trackedQueries.size) return "";

    //   /**
    //    * Dehydrated state of the client where we only include the queries that were added/updated since the last flush
    //    */
    //   const shouldDehydrate =
    //     options?.dehydrate?.shouldDehydrateQuery ?? defaultShouldDehydrateQuery;

    //   const dehydratedState = dehydrate(queryClient, {
    //     ...options?.dehydrate,
    //     shouldDehydrateQuery(query) {
    //       return trackedQueries.has(query.queryHash) && shouldDehydrate(query);
    //     },
    //   });
    //   trackedQueries.clear();

    //   if (!dehydratedState.queries.length) return "";

    //   const dehydratedString = JSON.stringify(
    //     serialize ? serialize(dehydratedState) : dehydratedState
    //   );

    //   const html: string[] = [`$TQS(${dehydratedString})`];

    //   return `<script>${html.join("")}</script>`;
    // },
  });
};
