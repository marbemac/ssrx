import { clientOnly$ } from 'vite-env-only/macros';

import { ASSETS_PLUGIN_ID, defineRenderPlugin } from '../common.ts';

export const assetsPluginClient = clientOnly$(() => {
  return defineRenderPlugin({
    id: ASSETS_PLUGIN_ID,
  });
});
