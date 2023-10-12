import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { serverHandler } from '~/app.tsx';

import { trpcServer } from './trpc/hono-middleware.ts';
import { appRouter } from './trpc/index.ts';

const server = new Hono()
  /**
   * These two serveStatic's will be used to serve production assets.
   * Vite dev server handles assets during development.
   */
  .use('/assets/*', serveStatic({ root: './dist/public' }))
  .use('/favicon.ico', serveStatic({ path: './dist/public/favicon.ico' }))

  /**
   * TRPC
   */
  .use('/trpc/*', trpcServer({ router: appRouter }))

  /**
   * The frontend app
   */
  .get('*', async c => {
    try {
      const appStream = await serverHandler({
        req: c.req.raw,
        meta: {
          // used by @super-ssr/plugin-trpc-react
          trpcCaller: appRouter.createCaller({
            // @TODO hook trpc router context up to this
          }),
        },
      });

      return new Response(appStream);
    } catch (err) {
      /**
       * Handle react-router redirects
       */
      if (err instanceof Response && err.status >= 300 && err.status <= 399) {
        return c.redirect(err.headers.get('Location') || '/', err.status);
      }

      throw err;
    }
  });

/**
 * In development, vite handles starting up the server
 * In production, we need to start the server ourselves
 */
if (import.meta.env.PROD) {
  const port = Number(process.env['PORT'] || 3000);
  serve(
    {
      port,
      fetch: server.fetch,
    },
    () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    },
  );
}

export default server;
