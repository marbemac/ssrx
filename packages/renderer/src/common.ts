import type { RenderPlugin } from './types';

export const ASSETS_PLUGIN_ID = 'viteAssets' as const;

export function defineRenderPlugin<R extends RenderPlugin<any, any>>(r: R) {
  return r;
}
