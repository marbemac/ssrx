import { defineRenderPlugin } from '@ssrx/renderer';

import type { AssetHtmlTag } from './assets.server.ts';

export const PLUGIN_ID = 'viteAssets' as const;

export type AssetsPluginCtx = {
  assets: AssetHtmlTag[];
};

export const assetsPlugin = () =>
  defineRenderPlugin({
    id: PLUGIN_ID,

    hooks: {
      'ssr:emitToHead': async ({ req }) => {
        const { assetsForRequest } = await import('./assets.server.ts');
        const { renderAssetsToHtml } = await import('./html.server.ts');

        const assets = await assetsForRequest(req.url);

        return renderAssetsToHtml(assets.headAssets);
      },

      'ssr:emitToBody': async ({ req }) => {
        const { assetsForRequest } = await import('./assets.server.ts');
        const { renderAssetsToHtml } = await import('./html.server.ts');

        const assets = await assetsForRequest(req.url);

        return renderAssetsToHtml(assets.bodyAssets);
      },
    },
  });
