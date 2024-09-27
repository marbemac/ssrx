import type { RemixServerProps } from '@remix-run/react';
import { RemixServer } from '@remix-run/react';
import { renderToStream } from '@ssrx/react/server';
import type { RenderPlugin, ServerHandlerOpts, SetOptional } from '@ssrx/renderer';
import { createApp as baseCreateApp } from '@ssrx/renderer/server';
import { serverOnly$ } from 'vite-env-only/macros';

export const createAppServer = serverOnly$(_createAppServer);

function _createAppServer<P extends RenderPlugin<any>[]>(
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
