import { deepmerge, defineRenderPlugin } from '@super-ssr/renderer-core';
import { InferSeoMetaPlugin } from '@unhead/addons';
import type {
  ActiveHeadEntry,
  CreateHeadOptions,
  Head,
  HeadEntryOptions,
  SchemaAugmentations,
  Unhead,
  UseSeoMetaInput,
} from '@unhead/schema';
import { whitelistSafeInput } from '@unhead/shared';
import { renderSSRHead } from '@unhead/ssr';
import { createHead, useSeoMeta as baseUseSeoMeta, useServerSeoMeta as baseUseServerSeoMeta } from 'unhead';

export const PLUGIN_ID = 'unhead' as const;

export type UnheadPluginOpts = {
  createHeadOptions?: CreateHeadOptions;
};

export type UnheadPluginCtx = {
  head: Unhead<SchemaAugmentations>;
};

export const unheadPlugin = (opts: UnheadPluginOpts = {}) =>
  defineRenderPlugin({
    id: PLUGIN_ID,

    createCtx: (): UnheadPluginCtx => {
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

    hooks: {
      'app:extendCtx': ({ ctx }) => {
        const { head } = ctx as UnheadPluginCtx;

        return { useHead: createUseHead(head as any), useSeoMeta: createUseSeoMeta(head as any) };
      },

      'ssr:emitToHead': async ({ ctx }) => {
        const { head } = ctx as UnheadPluginCtx;

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

    return head.push(input, {
      // @ts-expect-error untyped
      transform: whitelistSafeInput,
      mode: import.meta.env.SSR ? 'server' : 'client',
      ...options,
    });
  };
};

const createUseSeoMeta = (head: Unhead) => {
  return function useSeoMeta(input: UseSeoMetaInput): ActiveHeadEntry<any> | void {
    const fn = import.meta.env.SSR ? baseUseServerSeoMeta : baseUseSeoMeta;
    return fn(input, { head });
  };
};
