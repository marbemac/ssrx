import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import * as React from 'react';

import { routes } from '~/routes.tsx';
import { App } from '~/app.tsx';

export async function render(req: Request) {
  const { query, dataRoutes } = createStaticHandler(routes);
  const context = await query(req);

  if (context instanceof Response) {
    throw context;
  }

  const router = createStaticRouter(dataRoutes, context);

  const app = (
    <React.StrictMode>
      <App>
        <StaticRouterProvider router={router} context={context} nonce="the-nonce" />
      </App>
    </React.StrictMode>
  );

  return { app };
}
