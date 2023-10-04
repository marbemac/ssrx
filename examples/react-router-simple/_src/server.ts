import { renderToReadableStream } from "react-dom/server";
import type { Serve } from "bun";
import type { ReactDOMServerReadableStream } from "react-dom/server";

import * as entry from "~/entry.server.tsx";

import { Hono } from "hono";
import { createDataInjector } from "./data-injector.server";

console.log(
  `server.ts is running with "${
    typeof Bun !== "undefined" ? "bun" : "node"
  }" and NODE_ENV "${process.env.NODE_ENV}"`
);

const createAppServer = () => {
  const isProd = process.env.NODE_ENV === "production";

  // const app = new Hono()
  //   .use("/assets/*", serveStatic({ root: "./dist" }))
  //   .use("/favicon.ico", serveStatic({ path: "./public/favicon.ico" }));

  const app = new Hono();

  app.get("*", async (c) => {
    try {
      const { app: reactApp } = await entry.render(c.req.raw);

      const assets = await import.meta.env.MANIFEST.getAssetsHtml(c.req.url);

      const appStream = (
        await renderToReadableStream(reactApp, {
          bootstrapModules: ["/@vite/client", "/src/entry.client.tsx"],
          bootstrapScriptContent: isProd
            ? undefined
            : [addFastRefreshPreamble()].join("\n"),
        })
      ).pipeThrough(
        createDataInjector({
          headString: assets.join(""),
          // trackedQueries: new Set<string>(),
          // blockingQueries: new Map<string, Promise<void>>(),
        })
      ) as ReactDOMServerReadableStream;

      return new Response(appStream);
    } catch (err) {
      /**
       * Handle redirects
       */
      if (err instanceof Response && err.status >= 300 && err.status <= 399) {
        return c.redirect(err.headers.get("Location") || "/", err.status);
      }

      throw err;
    }
  });

  return { app };
};

const createQueryStreamData = (): QueryStreamOpts => {
  /**
   * Create a new queryClient on every request - cannot share caches on server.
   */
  const trackedQueries = new Set<string>();
  const blockingQueries = new Map<string, Promise<void>>();
  const queryClient = createQueryClient({ trackedQueries, blockingQueries });

  return {
    trackedQueries,
    blockingQueries,
    queryClient,
  };
};

const { app } = createAppServer();

export default {
  port: 3000,
  fetch: app.fetch,
} satisfies Serve;

const addFastRefreshPreamble = () => {
  return `
  var script = document.createElement("script");
  script.type = "module";
  script.text = ${JSON.stringify(fastRefreshPreamble)};
  document.body.appendChild(script);
`.trim();
};

const fastRefreshPreamble = `
import RefreshRuntime from "/@react-refresh"
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`.trim();
