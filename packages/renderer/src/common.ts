import type { RenderPlugin } from './types';

export const ASSETS_PLUGIN_ID = 'viteAssets' as const;

export function defineRenderPlugin<
  AC extends Record<string, unknown> = Record<string, unknown>,
  R extends RenderPlugin<any> = RenderPlugin<AC>,
>(r: R) {
  return r;
}
