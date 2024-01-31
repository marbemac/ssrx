import type { AssetHtmlTag } from '@ssrx/vite/runtime';

import { ASSETS_PLUGIN_ID, defineRenderPlugin } from '../common.ts';

export type AssetsPluginCtx = {
  assets: AssetHtmlTag[];
};

export const assetsPlugin = () =>
  defineRenderPlugin({
    id: ASSETS_PLUGIN_ID,

    hooks: {
      'ssr:emitToHead': async ({ req }) => {
        const { assetsForRequest, renderAssetsToHtml } = await import('@ssrx/vite/runtime');

        const assets = await assetsForRequest(req.url);

        return renderAssetsToHtml(assets.headAssets);
      },

      'ssr:emitToBody': async ({ req }) => {
        const { assetsForRequest, renderAssetsToHtml } = await import('@ssrx/vite/runtime');

        const assets = await assetsForRequest(req.url);

        return renderAssetsToHtml(assets.bodyAssets);
      },
    },
  });
