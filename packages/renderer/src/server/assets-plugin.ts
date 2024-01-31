import type { AssetHtmlTag } from '@ssrx/vite/runtime';
import { assetsForRequest, renderAssetsToHtml } from '@ssrx/vite/runtime';

import { ASSETS_PLUGIN_ID, defineRenderPlugin } from '../common.ts';

export type AssetsPluginCtx = {
  headAssets: AssetHtmlTag[];
  bodyAssets: AssetHtmlTag[];
};

export const assetsPlugin = () =>
  defineRenderPlugin({
    id: ASSETS_PLUGIN_ID,

    createCtx: ({ req }) => assetsForRequest(req.url),

    hooks: {
      emitToDocumentHead: ({ ctx }) => renderAssetsToHtml((ctx as AssetsPluginCtx).headAssets),
      emitToDocumentBody: ({ ctx }) => renderAssetsToHtml((ctx as AssetsPluginCtx).bodyAssets),
    },
  });

export const injectAssetsToStream = async ({ req }: { req: Request }) => {
  const assets = await assetsForRequest(req.url);

  return {
    emitToDocumentHead: () => renderAssetsToHtml(assets.headAssets),
    emitToDocumentBody: () => renderAssetsToHtml(assets.bodyAssets),
  };
};
