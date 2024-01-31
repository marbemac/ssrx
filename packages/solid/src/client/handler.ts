import {
  type ClientHandlerOpts,
  createApp as baseCreateApp,
  type RenderPlugin,
  type SetOptional,
} from '@ssrx/renderer/client';

import { RootLayout } from '../default-root.tsx';

export function createApp<P extends RenderPlugin<any>[]>(opts: SetOptional<ClientHandlerOpts<P>, 'RootLayout'>) {
  return baseCreateApp({
    RootLayout,
    ...opts,
  });
}
