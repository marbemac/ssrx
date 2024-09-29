import type { RenderPlugin, ServerHandlerOpts, SetOptional } from '@ssrx/renderer';
import { createApp as baseCreateApp } from '@ssrx/renderer/server';

import { RootLayout } from '../default-root.tsx';
import { renderToStream } from './stream.ts';

export function createApp<P extends RenderPlugin<any>[]>(
  opts: SetOptional<ServerHandlerOpts<P>, 'renderer' | 'RootLayout'>,
) {
  return baseCreateApp({
    RootLayout,
    renderer: {
      renderToStream,
    },
    ...opts,
  });
}
