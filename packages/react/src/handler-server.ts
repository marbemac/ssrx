import { type RenderPlugin, type ServerHandlerOpts, type SetOptional } from '@ssrx/renderer';
import { createApp as baseCreateApp } from '@ssrx/renderer/server';
import { serverOnly$ } from 'vite-env-only/macros';

import { RootLayout } from './default-root.tsx';
import { renderToStreamServer } from './server/stream.ts';

export const createAppServer = serverOnly$(_createAppServer);

function _createAppServer<P extends RenderPlugin<any>[]>(
  opts: SetOptional<ServerHandlerOpts<P>, 'renderer' | 'RootLayout'>,
) {
  return baseCreateApp({
    RootLayout,
    renderer: {
      renderToStream: renderToStreamServer!,
    },
    ...opts,
  });
}
