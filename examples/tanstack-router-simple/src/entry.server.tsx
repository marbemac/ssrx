import { renderAssets } from '@ssrx/react';
import { assetsForRequest } from '@ssrx/vite/runtime';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';

// import { StrictMode } from 'react';
import { createRouter } from '~/router.tsx';

export async function render(req: Request) {
  const assets = await assetsForRequest(req.url);

  const router = createRouter({
    context: {
      headTags: () => renderAssets(assets.headAssets),
      bodyTags: () => renderAssets(assets.bodyAssets),
    },
  });

  const url = new URL(req.url);
  const memoryHistory = createMemoryHistory({
    initialEntries: [url.pathname + url.search],
  });

  router.update({ history: memoryHistory });

  // Since we're using renderToString, Wait for the router to finish loading
  await router.load();

  const app = <RouterProvider router={router} />;

  return { app };
}
