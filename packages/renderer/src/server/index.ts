import deepmerge from 'deepmerge';

export { defineRenderPlugin } from '../common.ts';
export type { Config, RenderPlugin, RenderToStreamFn, ServerHandlerOpts, SetOptional } from '../types.ts';
export { assetsPlugin } from './assets-plugin.ts';
export { getPageCtx } from './ctx.ts';
export { createApp } from './handler.tsx';
export { deepmerge };
