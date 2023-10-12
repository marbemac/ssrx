import {
  type ClientHandlerOpts,
  createApp as baseCreateApp,
  type RenderPlugin,
  type SetOptional,
} from '@super-ssr/renderer-core/client';

import { Root } from '../default-root.tsx';

export function createApp<P extends RenderPlugin<any, any>[]>(opts: SetOptional<ClientHandlerOpts<P>, 'rootLayout'>) {
  return baseCreateApp({
    rootLayout: Root,
    ...opts,
  });
}
