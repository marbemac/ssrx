import type { RenderPlugin } from './types';

export function defineRenderPlugin<R extends RenderPlugin<any, any>>(r: R) {
  return r;
}
