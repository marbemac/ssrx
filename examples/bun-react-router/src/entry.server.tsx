import { renderAssets } from '@super-ssr/react';
import { assetsForRequest } from '@super-ssr/vite/runtime';
import { StrictMode } from 'react';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';

import { App } from '~/app.tsx';
import { routes } from '~/routes.tsx';

export async function render(req: Request) {
  const assets = await assetsForRequest(req.url);

  const { query, dataRoutes } = createStaticHandler(routes);
  const context = await query(req);

  if (context instanceof Response) {
    throw context;
  }

  const router = createStaticRouter(dataRoutes, context);

  const app = (
    <StrictMode>
      <App head={renderAssets(assets)}>
        <StaticRouterProvider router={router} context={context} nonce="the-nonce" />
      </App>
    </StrictMode>
  );

  return { app };
}
