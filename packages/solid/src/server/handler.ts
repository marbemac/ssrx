import {
  createApp as baseCreateApp,
  type RenderPlugin,
  type ServerHandlerOpts,
  type SetOptional,
} from '@super-ssr/renderer-core/server';
import { renderToStream } from 'solid-js/web';

import { Root } from '../default-root.tsx';

export function createApp<P extends RenderPlugin<any, any>[]>(
  opts: SetOptional<ServerHandlerOpts<P>, 'renderer' | 'rootLayout'>,
) {
  return baseCreateApp({
    rootLayout: Root,
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
