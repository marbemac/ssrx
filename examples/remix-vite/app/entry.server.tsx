import type { EntryContext } from '@remix-run/server-runtime';

import { createReqCtx } from '~api/middleware/context.ts';
import { createCaller } from '~api/trpc/index.ts';

import { serverHandler } from './app.ts';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const reqCtx = await createReqCtx(request, responseHeaders);

  const stream = await serverHandler({
    req: request,
    meta: {
      // used by @ssrx/remix
      entryContext: remixContext,

      // used by @ssrx/plugin-trpc-react
      trpcCaller: createCaller(reqCtx),
    },
  });

  return new Response(stream, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
