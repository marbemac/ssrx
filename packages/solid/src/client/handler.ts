import type { ClientHandlerOpts, RenderPlugin, SetOptional } from '@ssrx/renderer';
import { createApp as baseCreateApp } from '@ssrx/renderer/client';

import { RootLayout } from '../default-root.tsx';

export function createApp<P extends RenderPlugin<any>[]>(opts: SetOptional<ClientHandlerOpts<P>, 'RootLayout'>) {
  return baseCreateApp({
    RootLayout,
    ...opts,
  });
}
