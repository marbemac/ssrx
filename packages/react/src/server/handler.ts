import {
  createApp as baseCreateApp,
  type RenderPlugin,
  type ServerHandlerOpts,
  type SetOptional,
} from '@ssrx/renderer/server';
// @ts-expect-error no types
import isbot from 'isbot-fast';
import rd from 'react-dom/server';
// @ts-expect-error ignore
import { renderToReadableStream as fallbackRenderToReadableStream } from 'react-dom/server.browser';

import { RootLayout } from '../default-root.tsx';

export function createApp<P extends RenderPlugin<any, any>[]>(
  opts: SetOptional<ServerHandlerOpts<P>, 'renderer' | 'RootLayout'>,
) {
  return baseCreateApp({
    RootLayout,
    renderer: {
      renderToStream: async ({ app, req }) => {
        /**
         * Infuriatingly, react-dom/server does not include renderToReadableStream in the node production build.
         *
         * https://github.com/facebook/react/issues/26906
         *
         * This is a workaround to attempt to use the renderToReadableStream from the server build (in case it's resolves to something specific like bun's renderToReadableStream impl),
         * with a fallback to the implementation provided by the browser build. This is what we want in the case of node on the server, since we're targeting
         * node versions that support web streams.
         */
        const streamFn = rd.renderToReadableStream ?? fallbackRenderToReadableStream;

        const stream = await streamFn(app(), {
          signal: req.signal,
          // @TODO better error handling / hooking into the error boundary
          // onError(error: unknown) {
          //   // Log streaming rendering errors from inside the shell
          //   console.error(error);
          //   responseStatusCode = 500;
          // }
        });

        const ua = req.headers.get('user-agent');
        const isGoogle = ua?.toLowerCase().includes('googlebot') ?? false;
        if (ua && !isGoogle && isbot(ua)) {
          await stream.allReady;
        }

        return stream;
      },
    },
    ...opts,
  });
}
