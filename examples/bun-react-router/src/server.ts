import { staticPlugin } from '@elysiajs/static';
import { Elysia } from 'elysia';
import { renderToString } from 'react-dom/server';

import { render as renderApp } from '~/entry.server.tsx';

const server = new Elysia();

if (import.meta.env.PROD) {
  /**
   * These two serveStatic's will be used to serve production assets.
   * Vite dev server handles assets during development.
   */
  server
    .use(staticPlugin({ prefix: '/assets', assets: './dist/public/assets' }))
    .get('/favicon.ico', () => Bun.file('./dist/public/favicon.ico'));
}

server.get('*', async c => {
  try {
    const { app } = await renderApp(c.request);

    const html = renderToString(app);

    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err: any) {
    /**
     * Handle react-router redirects
     */
    if (err instanceof Response && err.status >= 300 && err.status <= 399) {
      return c.redirect(err.headers.get('Location') || '/', err.status as any);
    }

    /**
     * In development, pass the error back to the vite dev server to display in the
     * vite error overlay
     */
    if (import.meta.env.DEV) return err;

    throw err;
  }
});

const port = Number(process.env['PORT'] || 3000);

/**
 * In development, vite handles starting up the server
 * In production, bun does
 */
if (import.meta.env.PROD) {
  console.log(`🚀 Starting server at http://localhost:${port}`);
}

export default {
  port,
  fetch: server.fetch,
};
