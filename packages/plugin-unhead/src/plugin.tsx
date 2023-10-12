import { deepmerge, defineRenderPlugin } from '@super-ssr/renderer-core';
import { InferSeoMetaPlugin } from '@unhead/addons';
import type {
  ActiveHeadEntry,
  CreateHeadOptions,
  Head,
  HeadEntryOptions,
  SchemaAugmentations,
  Unhead,
} from '@unhead/schema';
import { renderSSRHead } from '@unhead/ssr';
import { createHead } from 'unhead';

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

      extendAppCtx({ ctx }) {
        const { head } = ctx as UnheadCtx;

        return { useHead: createUseHead(head) };
      },

      async emitToDocumentHead({ ctx }) {
        const { head } = ctx as UnheadCtx;

        const { headTags } = await renderSSRHead(head);

        return headTags;
      },
    },
  });

type SupportedHead = Pick<
  Head,
  'title' | 'titleTemplate' | 'templateParams' | 'link' | 'meta' | 'style' | 'script' | 'noscript'
>;

const createUseHead = <T extends SupportedHead>(head: Unhead<T>) => {
  return function useHead(input: T, options: HeadEntryOptions = {}): ActiveHeadEntry<T> | void {
    const isBrowser = !import.meta.env.SSR;
    if ((options.mode === 'server' && isBrowser) || (options.mode === 'client' && !isBrowser)) return;

    return head.push(input, options);
  };
};
