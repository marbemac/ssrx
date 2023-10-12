import { deepmerge, defineRenderPlugin } from '@super-ssr/renderer-core';
import { InferSeoMetaPlugin } from '@unhead/addons';
import type { CreateHeadOptions, SchemaAugmentations, Unhead } from '@unhead/schema';
import { renderSSRHead } from '@unhead/ssr';
import { createHead } from 'unhead';

import { HeadProvider } from './provider.tsx';

export const PLUGIN_ID = 'unhead' as const;

export type UnheadPluginOpts = {
  createHeadOptions?: CreateHeadOptions;
};

type UnheadCtx = {
  head: ReturnType<typeof createHead>;
};

export const unheadPlugin = (opts: UnheadPluginOpts = {}) =>
  defineRenderPlugin({
    id: PLUGIN_ID,

    hooks: {
      extendRequestCtx() {
        const head: Unhead<SchemaAugmentations> = createHead(
          deepmerge(
            {
              plugins: [InferSeoMetaPlugin()],
            },
            opts?.createHeadOptions || {},
          ),
        );

        return { head };
      },

      wrapApp: ({ ctx, children }) => {
        const { head } = ctx as UnheadCtx;

        return <HeadProvider value={head}>{children}</HeadProvider>;
      },

      async emitToDocumentHead({ ctx }) {
        const { head } = ctx as UnheadCtx;

        const { headTags, ...rest } = await renderSSRHead(head);

        console.log('UNHEAD', headTags, rest);

        return headTags;
      },
    },
  });
