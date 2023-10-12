import type { DehydratedState, QueryClient } from '@tanstack/query-core';
import { hydrate } from '@tanstack/query-core';
import { parse } from 'devalue';

export const hydrateStreamingData = ({ queryClient }: { queryClient: QueryClient }) => {
  function hydrateData(data: DehydratedState) {
    // @ts-expect-error ignore
    const sanitized = parse(data);

    hydrate(queryClient, sanitized);
  }

  // Insert data that was already streamed before this point
  // @ts-expect-error ignore
  (globalThis.$TQD ?? []).map(hydrateData);

  // Delete the global variable so that it doesn't get serialized again
  // @ts-expect-error ignore
  delete globalThis.$TQD;

  // From now on, insert data directly
  // @ts-expect-error ignore
  globalThis.$TQS = hydrateData;
};
