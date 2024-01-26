import type { IncomingMessage, ServerResponse } from 'node:http';

import { getRequestListener } from '@hono/node-server';
import type { Connect, Plugin, ViteDevServer } from 'vite';

import type { Config } from '../config.ts';
import { PLUGIN_NAMESPACE } from '../consts.ts';
import { isAssetHandledByVite, isCssModulesFile } from '../helpers/vite.ts';
import type { Router } from '../router.ts';
import type { Manifest } from '../ssr-manifest.ts';

export type DevServerPluginOpts = {
  config: Config;
  router: Router<any>;
  manifest: Manifest<any>;
};

export const devServerPlugin = ({ config, manifest }: DevServerPluginOpts): Plugin => {
  let server: ViteDevServer;

  return {
    name: `${PLUGIN_NAMESPACE}:dev-server`,

    async configureServer(_server) {
      server = _server;

      manifest.setViteServer(server);

      server.middlewares.use(await createMiddleware(server, { config }));
    },

    transform(code, id) {
      if (isCssModulesFile(id)) {
        manifest.cssModules[id] = code;
      }
    },
  };
};

export type DevServerOptions = {
  config: Config;
};

type Fetch = (request: Request) => Promise<Response>;

/*!
 * Portions of this code are inspired by honojs/vite-plugins
 *
 * Credits to Hono:
 * https://github.com/honojs/vite-plugins
 */
function createMiddleware(server: ViteDevServer, options: DevServerOptions): Promise<Connect.HandleFunction> {
  // @ts-expect-error ignore
  return async function (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction): Promise<void> {
    const { config } = options;
    const entry = config.serverFile;

    if (isAssetHandledByVite(req.url ?? '', config.basePath)) {
      return next();
    }

    let app: { fetch: Fetch } | undefined;

    try {
      const appModule = await server.ssrLoadModule(entry, { fixStacktrace: true });
      app = appModule['default'] as { fetch: Fetch };
    } catch (err: any) {
      res.setHeader('Content-Type', 'text/html');
      return next(err);
    }

    if (!app) {
      res.setHeader('Content-Type', 'text/html');
      return next(new Error(`Failed to find a named export "default" from ${entry}`));
    } else if (!app.fetch) {
      res.setHeader('Content-Type', 'text/html');
      return next(
        new Error(`The 'default' export of your server file ('${entry}') must be an object with a 'fetch' method.`),
      );
    }

    void getRequestListener(
      async (request: Request) => {
        const response = await app!.fetch(request);

        // Allow the server to pass rendering errors through in development
        // we pass these through to vite to display in the error overlay
        if (response instanceof Error) {
          throw response;
        }

        return response;
      },
      /**
       * Our version of getRequestListener() is a bit different from the original.
       *
       * It accepts a second argument which allows us to pass errors through to the vite middleware.
       */
      err => {
        console.error(`There was an unhandled error in your server fetch handler.`);

        server.ssrFixStacktrace(err as Error);
        next(err);
      },
    )(req, res);
  };
}
