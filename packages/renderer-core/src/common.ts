import type { RenderPlugin } from './types';

export function defineRenderPlugin<R extends RenderPlugin<Record<string, unknown>>>(r: R) {
  return r;
}
