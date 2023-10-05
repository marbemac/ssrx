import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Http2ServerRequest, Http2ServerResponse } from 'node:http2';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';

import type { Connect, Plugin, ViteDevServer } from 'vite';

import type { Config } from '../config.ts';
import { PLUGIN_NAMESPACE } from '../consts.ts';
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

      server.middlewares.use(await createMiddleware(server, { entry: config.serverFile }));
    },

    transformIndexHtml: {
      handler(html, ctx) {
        return manifest.getAssetsHtmlTags(ctx.path);
      },
    },
  };
};

export type DevServerOptions = {
  entry: string;
  injectClientScript?: boolean;
  exclude?: (string | RegExp)[];
};

const defaultOptions: Required<Omit<DevServerOptions, 'entry'>> = {
  injectClientScript: true,
  exclude: ['.*.ts', '.*.tsx', '.*.css', '/@.+', '/node_modules/.*', '/inc/.*', '.*.txt', '.*.ico'],
};

type Fetch = (request: Request) => Promise<Response>;

const SKIP_REQ = Symbol('skip_req');

async function createMiddleware(server: ViteDevServer, options: DevServerOptions): Promise<Connect.HandleFunction> {
  return async function (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction): Promise<void> {
    const entry = options.entry;
    const exclude = options?.exclude ?? defaultOptions.exclude;

    for (const pattern of exclude) {
      const regExp = new RegExp(`^${pattern}$`);
      const pathname = req.url?.split('?')[0];
      if (pathname && regExp.test(pathname)) {
        return next();
      }
    }

    const appModule = await server.ssrLoadModule(entry);
    const app = appModule['default'] as { fetch: Fetch };

    if (!app) {
      console.error(`Failed to find a named export "default" from ${entry}`);
      return next();
    }

    void getRequestListener(async (request: Request) => {
      try {
        const response = await app.fetch(request);

        if (
          options?.injectClientScript !== false &&
          // If the response is a stream, it does not inject the script (end user must handle it themselves):
          !response.headers.get('transfer-encoding')?.match('chunked') &&
          response.headers.get('content-type')?.match(/^text\/html/)
        ) {
          const resText = await response.text();
          const body = await server.transformIndexHtml(request.url, resText);
          const headers = new Headers(response.headers);
          headers.delete('content-length');

          return new Response(body, {
            status: response.status,
            headers,
          });
        }

        return response;
      } catch (err: any) {
        console.error(`There was an unhandled error in your server fetch handler.`);

        server.ssrFixStacktrace(err);
        next(err);
        return SKIP_REQ;
      }
    })(req, res);
  };
}

type FetchCallback = (request: Request) => Promise<unknown> | unknown;

/**
 * Adapted from https://github.com/honojs/node-server/blob/main/src/listener.ts
 */
const getRequestListener = (fetchCallback: FetchCallback) => {
  return async (incoming: IncomingMessage | Http2ServerRequest, outgoing: ServerResponse | Http2ServerResponse) => {
    const method = incoming.method || 'GET';
    const url = `http://${incoming.headers.host}${incoming.url}`;

    const headerRecord: [string, string][] = [];
    const len = incoming.rawHeaders.length;
    for (let i = 0; i < len; i += 2) {
      headerRecord.push([incoming.rawHeaders[i]!, incoming.rawHeaders[i + 1]!]);
    }

    const init = {
      method: method,
      headers: headerRecord,
    } as RequestInit;

    if (!(method === 'GET' || method === 'HEAD')) {
      // lazy-consume request body
      init.body = Readable.toWeb(incoming) as ReadableStream<Uint8Array>;
      // node 18 fetch needs half duplex mode when request body is stream
      (init as any).duplex = 'half';
    }

    let res: Response;

    try {
      const possibleRes = (await fetchCallback(new Request(url.toString(), init))) as any;

      if (possibleRes === SKIP_REQ) return;

      res = possibleRes as Response;
    } catch (e: unknown) {
      res = new Response(null, { status: 500 });
      if (e instanceof Error) {
        // timeout error emits 504 timeout
        if (e.name === 'TimeoutError' || e.constructor.name === 'TimeoutError') {
          res = new Response(null, { status: 504 });
        }
      }
    }

    const contentType = res.headers.get('content-type') || '';
    // nginx buffering variant
    const buffering = res.headers.get('x-accel-buffering') || '';
    const contentEncoding = res.headers.get('content-encoding');
    const contentLength = res.headers.get('content-length');
    const transferEncoding = res.headers.get('transfer-encoding');

    for (const [k, v] of res.headers) {
      if (k === 'set-cookie') {
        // node native Headers.prototype has getSetCookie method
        outgoing.setHeader(k, (res.headers as any).getSetCookie(k));
      } else {
        outgoing.setHeader(k, v);
      }
    }
    outgoing.statusCode = res.status;

    if (res.body) {
      try {
        /**
         * If content-encoding is set, we assume that the response should be not decoded.
         * Else if transfer-encoding is set, we assume that the response should be streamed.
         * Else if content-length is set, we assume that the response content has been taken care of.
         * Else if x-accel-buffering is set to no, we assume that the response should be streamed.
         * Else if content-type is not application/json nor text/* but can be text/event-stream,
         * we assume that the response should be streamed.
         */
        if (
          contentEncoding ||
          transferEncoding ||
          contentLength ||
          /^no$/i.test(buffering) ||
          !/^(application\/json\b|text\/(?!event-stream\b))/i.test(contentType)
        ) {
          await pipeline(Readable.fromWeb(res.body as NodeReadableStream), outgoing);
        } else {
          const text = await res.text();
          outgoing.setHeader('Content-Length', Buffer.byteLength(text));
          outgoing.end(text);
        }
      } catch (e: unknown) {
        const err = (e instanceof Error ? e : new Error('unknown error', { cause: e })) as Error & {
          code: string;
        };
        if (err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
          console.info('The user aborted a request.');
        } else {
          console.error(e);
          outgoing.destroy(err);
        }
      }
    } else {
      outgoing.end();
    }
  };
};
