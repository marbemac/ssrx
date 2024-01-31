import './namespace.ts';

import type { RemixServerProps } from '@remix-run/react';
import { RemixServer } from '@remix-run/react';
import type { EntryContext } from '@remix-run/react/dist/entry';
import { renderToStream } from '@ssrx/react/server';
import type { RenderPlugin, ServerHandlerOpts, SetOptional } from '@ssrx/renderer/server';
import { createApp as baseCreateApp } from '@ssrx/renderer/server';

declare global {
  namespace SSRx {
    interface ReqMeta {
      entryContext: EntryContext;
    }
  }
}

export function createApp<P extends RenderPlugin<any, any>[]>(
  opts: SetOptional<ServerHandlerOpts<P>, 'appRenderer' | 'renderer'> & Pick<RemixServerProps, 'abortDelay'> = {},
) {
  return baseCreateApp({
    appRenderer:
      ({ req, meta }) =>
      () => {
        return <RemixServer context={meta!.entryContext} url={req.url} abortDelay={opts.abortDelay} />;
      },

    renderer: {
      renderToStream,
    },
    ...opts,
  });
}
