import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, matchRoutes, RouterProvider } from 'react-router-dom';

import { routes } from '~/routes.tsx';
import { App } from '~/app.tsx';

hydrate();

async function hydrate() {
  const lazyMatches = matchRoutes(routes, window.location)?.filter(m => m.route.lazy);

  // Load the lazy matches and update the routes before creating your router
  // so we can hydrate the SSR-rendered content synchronously
  if (lazyMatches && lazyMatches?.length > 0) {
    await Promise.all(
      lazyMatches.map(async m => {
        const routeModule = await m.route.lazy!();
        Object.assign(m.route, { ...routeModule, lazy: undefined });
      }),
    );
  }

  const router = createBrowserRouter(routes);

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <App>
          <RouterProvider router={router} fallbackElement={null} />
        </App>
      </StrictMode>,
    );
  });
}
