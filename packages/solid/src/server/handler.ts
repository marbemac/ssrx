import {
  createApp as baseCreateApp,
  type RenderPlugin,
  type ServerHandlerOpts,
  type SetOptional,
} from '@ssrx/renderer/server';
import { renderToStream } from 'solid-js/web';

import { RootLayout } from '../default-root.tsx';

export function createApp<P extends RenderPlugin<any, any>[]>(
  opts: SetOptional<ServerHandlerOpts<P>, 'renderer' | 'RootLayout'>,
) {
  return baseCreateApp({
    RootLayout,
    renderer: {
      renderToStream: async ({ app }) => {
        const stream = renderToStream(() => app());
        const { readable, writable } = new TransformStream();
        stream.pipeTo(writable);
        return readable;
      },
    },
    ...opts,
  });
}
