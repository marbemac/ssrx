import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { compress } from 'hono/compress';

import { serverHandler } from './app.tsx';
import { routes } from './routes.tsx';

const server = new Hono();

if (import.meta.env.PROD) {
  /**
   * These two serveStatic's will be used to serve production assets.
   * Vite dev server handles assets during development.
   */
  server
    .use('/assets/*', compress(), serveStatic({ root: './dist/public' }))
    .use(
      '/react-router-records/mp3/*',
      serveStatic({
        root: './dist/public',
        rewriteRequestPath(path) {
          return path.replace(/^\/react-router-records/, '/');
        },
      }),
    )
    .use('/react-router-records/vinyl-lp.webp', serveStatic({ path: './dist/public/vinyl-lp.webp' }))
    .use('/favicon.ico', serveStatic({ path: './dist/public/favicon.ico' }));
}

server.get('*', async c => {
  try {
    const appStream = await serverHandler({
      req: c.req.raw,
      renderProps: { routes, basename: '/react-router-records' },
    });

    return new Response(appStream, { headers: { 'Content-Type': 'text/html' } });
  } catch (err: any) {
    /**
     * Handle react-router redirects
     */
    if (err instanceof Response && err.status >= 300 && err.status <= 399) {
      return c.redirect(err.headers.get('Location') || '/', err.status);
    }

    /**
     * In development, pass the error back to the vite dev server to display in the
     * vite error overlay
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
