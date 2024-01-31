import { ASSETS_PLUGIN_ID, defineRenderPlugin } from '../common.ts';

export const assetsPlugin = () =>
  defineRenderPlugin({
    id: ASSETS_PLUGIN_ID,
  });
