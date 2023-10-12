import {
  createApp as baseCreateApp,
  type RenderPlugin,
  type ServerHandlerOpts,
  type SetOptional,
} from '@super-ssr/renderer-core/server';
import rd from 'react-dom/server';
// @ts-expect-error ignore
import { renderToReadableStream as fallbackRenderToReadableStream } from 'react-dom/server.browser';

import { Root } from '../default-root.tsx';

export function createApp<P extends RenderPlugin<any, any>[]>(
  opts: SetOptional<ServerHandlerOpts<P>, 'renderer' | 'rootLayout'>,
) {
  return baseCreateApp({
    rootLayout: Root,
    renderer: {
      renderToStream: ({ app }) => {
        /**
         * Infuriatingly, react-dom/server does not include renderToReadableStream in the node production build.
         *
         * https://github.com/facebook/react/issues/26906
         *
         * This is a workaround to attempt to use the renderToReadableStream from the server build (in case it's resolves to something specific like bun's renderToReadableStream impl),
         * with a fallback to the implementation provided by the browser build. This is what we want in the case of node on the server, since we're targeting
         * node versions that support web streams.
         */
        return rd.renderToReadableStream ? rd.renderToReadableStream(app()) : fallbackRenderToReadableStream(app());
      },
    },
    ...opts,
  });
}
