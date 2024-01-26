import './namespace.ts';

import { RemixBrowser } from '@remix-run/react';
import {
  type ClientHandlerOpts,
  createApp as baseCreateApp,
  type RenderPlugin,
  type SetOptional,
} from '@ssrx/renderer/client';

export function createApp<P extends RenderPlugin<any, any>[]>(
  opts: SetOptional<ClientHandlerOpts<P>, 'appRenderer'> & { abortDelay?: number },
) {
  return baseCreateApp({
    appRenderer: () => () => <RemixBrowser />,
    ...opts,
  });
}
