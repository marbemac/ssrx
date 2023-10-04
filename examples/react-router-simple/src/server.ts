import { renderToString } from 'react-dom/server';

import * as entry from '~/entry.server.tsx';

import { Hono } from 'hono';

const createAppServer = () => {
  // const app = new Hono()
  //   .use("/assets/*", serveStatic({ root: "./dist" }))
  //   .use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));

  const app = new Hono();

  app.get('*', async c => {
    try {
      const { app: reactApp } = await entry.render(c.req.raw);

      const html = renderToString(reactApp);

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } catch (err) {
      /**
       * Handle redirects
       */
      if (err instanceof Response && err.status >= 300 && err.status <= 399) {
        return c.redirect(err.headers.get('Location') || '/', err.status);
      }

      throw err;
    }
  });

  return { app };
};

const { app } = createAppServer();

export default {
  port: 3099,
  fetch: app.fetch,
};
