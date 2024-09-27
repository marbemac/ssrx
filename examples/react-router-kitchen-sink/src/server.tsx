import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import type { RedirectStatusCode } from 'hono/utils/http-status';

import { type ReqCtx, reqCtxMiddleware } from '~/api/middleware/context.ts';
import { trpcServer } from '~/api/middleware/trpc.ts';
import { appRouter, createCaller } from '~/api/trpc/index.ts';
import { deleteCookie, setCookie } from '~/api/utils/cookies.ts';
import { serverHandler } from '~/app.tsx';
import { routes } from '~/routes.tsx';

type HonoEnv = { Variables: ReqCtx };

const server = new Hono<HonoEnv>();

if (import.meta.env.PROD) {
  /**
   * These two serveStatic's will be used to serve production assets.
   * Vite dev server handles assets during development.
   */
  server
    .use('/assets/*', serveStatic({ root: './dist/public' }))
    .use('/favicon.ico', serveStatic({ path: './dist/public/favicon.ico' }));
}

/**
 * TRPC
 */
server
  .use(
    '/trpc/*',
    reqCtxMiddleware,
    trpcServer<HonoEnv>({
      router: appRouter,
      createContext: ({ c, resHeaders }) => ({
        ...c.var,
        // trpc manages it's own headers, so use those in the cookie helpers
        setCookie: (...args) => setCookie(resHeaders, ...args),
        deleteCookie: (...args) => deleteCookie(resHeaders, ...args),
      }),
    }),
  )

  /**
   * Just quick demonstration that there is a natural way to mount a more public
   * facing API as needed. In real-world you'd likely break this out into a separate group
   * of routes that you mount to the /api root.
   */
  .get('/api/auth/me', reqCtxMiddleware, c => {
    return c.json(c.var.user || null);
  })

  /**
   * The frontend app
   */
  .get('*', reqCtxMiddleware, async c => {
    try {
      const { stream, statusCode } = await serverHandler({
        req: c.req.raw,
        renderProps: { routes },
        meta: {
          // used by @ssrx/plugin-trpc-react
          trpcCaller: createCaller(c.var),
        },
      });

      return new Response(stream, { status: statusCode(), headers: { 'Content-Type': 'text/html' } });
    } catch (err: any) {
      /**
       * Handle react-router redirects
       */
      if (err instanceof Response && err.status >= 300 && err.status <= 399) {
        return c.redirect(err.headers.get('Location') || '/', err.status as RedirectStatusCode);
      }

      /**
       * In development, pass the error back to the vite dev server to display in the error overlay
       */
      if (import.meta.env.DEV) return err;

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
