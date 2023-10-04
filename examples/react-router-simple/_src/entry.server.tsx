import { QueryClientProvider } from "@tanstack/react-query";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router-dom/server";
import * as React from "react";

// import { createQueryClient } from "~/libs/react-query.ts";
import { Root } from "~/root.tsx";
import { routes } from "~/routes.tsx";

export async function render(req: Request) {
  // console.log(await import.meta.env.MANIFEST.getAssetsHtml(req.url));

  /**
   * Create a new router on every request - cannot share caches on server.
   */
  const trackedQueries = new Set<string>();
  const blockingQueries = new Map<string, Promise<void>>();
  // const queryClient = createQueryClient({ trackedQueries, blockingQueries });

  const { query, dataRoutes } = createStaticHandler(routes);

  /**
   * Run the data loaders for the initial route tree
   */
  // const requestContext: DataLoaderCtx = { queryClient };
  const requestContext = {};
  const context = await query(req, { requestContext });

  if (context instanceof Response) {
    throw context;
  }

  const router = createStaticRouter(dataRoutes, context);

  const app = (
    <React.StrictMode>
      <Root>
        {/* <QueryClientProvider client={queryClient}> */}
        <StaticRouterProvider
          router={router}
          context={context}
          nonce="the-nonce"
        />
        {/* </QueryClientProvider> */}
      </Root>
    </React.StrictMode>
  );

  return { app, trackedQueries, blockingQueries };
}
