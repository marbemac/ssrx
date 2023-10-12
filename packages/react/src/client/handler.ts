import {
  type ClientHandlerOpts,
  createHandler as baseCreateHandler,
  type RenderPlugin,
  type SetOptional,
} from '@super-ssr/renderer-core/client';

import { Root } from '../default-root.tsx';

export function createHandler<P extends RenderPlugin<any>[]>(opts: SetOptional<ClientHandlerOpts<P>, 'renderRoot'>) {
  return baseCreateHandler({
    renderRoot: Root,
    ...opts,
  });
}
