import './namespace.ts';

import deepmerge from 'deepmerge';

import { getPageCtxClient } from './ctx-client.ts';
import { getPageCtxServer } from './ctx-server.ts';

export const getPageCtx = (import.meta.env.SSR ? getPageCtxServer : getPageCtxClient)!;

export { defineRenderPlugin } from './common.ts';
export type {
  ClientHandlerOpts,
  Config,
  RenderPlugin,
  RenderToStreamFn,
  ServerHandlerOpts,
  SetOptional,
} from './types.ts';

export { deepmerge };
