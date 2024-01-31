import deepmerge from 'deepmerge';

export { defineRenderPlugin } from '../common.ts';
export type { ClientHandlerOpts, Config, RenderPlugin, SetOptional } from '../types.ts';
export { assetsPlugin } from './assets-plugin.ts';
export { getPageCtx } from './ctx.ts';
export { createApp } from './handler.tsx';
export { deepmerge };
