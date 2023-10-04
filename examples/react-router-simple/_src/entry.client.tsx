import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
// import { createQueryClient } from "~/libs/react-query";
// import { hydrateStreamingData } from "~/utils/query-streaming/hydrate.ts";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  matchRoutes,
  RouterProvider,
} from "react-router-dom";

import { Root } from "./root.tsx";
import { routes } from "./routes.tsx";

hydrate();

async function hydrate() {
  // console.log(await import.meta.env.MANIFEST.getAssetsHtml("/"));

  // const queryClient = createQueryClient();
  // hydrateStreamingData({ queryClient });

  // Determine if any of the initial routes are lazy
  const lazyMatches = matchRoutes(routes, window.location)?.filter(
    (m) => m.route.lazy
  );

  // Load the lazy matches and update the routes before creating your router
  // so we can hydrate the SSR-rendered content synchronously
  if (lazyMatches && lazyMatches?.length > 0) {
    await Promise.all(
      lazyMatches.map(async (m) => {
        const routeModule = await m.route.lazy!();
        Object.assign(m.route, { ...routeModule, lazy: undefined });
      })
    );
  }

  const router = createBrowserRouter(routes, {
    // requestContext: { queryClient },
    requestContext: {},
  });

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <Root>
          {/* <QueryClientProvider client={queryClient}> */}
          <RouterProvider router={router} fallbackElement={null} />
          {/* </QueryClientProvider> */}
        </Root>
      </StrictMode>
    );
  });
}
