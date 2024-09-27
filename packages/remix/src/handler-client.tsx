import type { RemixServerProps } from '@remix-run/react';
import { RemixBrowser } from '@remix-run/react';
import { type ClientHandlerOpts, type RenderPlugin, type SetOptional } from '@ssrx/renderer';
import { createApp as baseCreateApp } from '@ssrx/renderer/client';
import { clientOnly$ } from 'vite-env-only/macros';

export const createAppClient = clientOnly$(_createAppClient);

function _createAppClient<P extends RenderPlugin<any>[]>(
  opts: SetOptional<ClientHandlerOpts<P>, 'appRenderer'> & Pick<RemixServerProps, 'abortDelay'>,
) {
  return baseCreateApp({
    appRenderer: () => () => <RemixBrowser />,
    ...opts,
  });
}
