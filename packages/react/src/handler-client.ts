import { type ClientHandlerOpts, type RenderPlugin, type SetOptional } from '@ssrx/renderer';
import { createApp as baseCreateApp } from '@ssrx/renderer/client';
import { clientOnly$ } from 'vite-env-only/macros';

import { RootLayout } from './default-root.tsx';

export const createAppClient = clientOnly$(_createAppClient);

function _createAppClient<P extends RenderPlugin<any>[]>(opts: SetOptional<ClientHandlerOpts<P>, 'RootLayout'>) {
  return baseCreateApp({
    RootLayout,
    ...opts,
  });
}
