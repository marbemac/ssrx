import { assetsForRequest, renderAssetsToHtml } from '@ssrx/vite/runtime';
import { serverOnly$ } from 'vite-env-only/macros';

import { ASSETS_PLUGIN_ID, defineRenderPlugin } from '../common.ts';

export const assetsPluginServer = serverOnly$(() => {
  return defineRenderPlugin({
    id: ASSETS_PLUGIN_ID,

    hooksForReq: async ({ req }) => ({
      server: await injectAssetsToStream({ req }),
    }),
  });
});

const injectAssetsToStream = async ({ req }: { req: Request }) => {
  const assets = await assetsForRequest(req.url);

  return {
    emitToDocumentHead: () => renderAssetsToHtml(assets.headAssets),
    emitToDocumentBody: () => renderAssetsToHtml(assets.bodyAssets),
  };
};
