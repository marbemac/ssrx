import { assetsForRequest, renderAssetsToHtml } from '@super-ssr/vite/runtime';
import type { Simplify } from 'type-fest';

import type { RenderPlugin, ServerHandlerOpts } from '../types.ts';
import { storage } from './ctx.ts';
import { injectIntoStream } from './stream-transformer.ts';

/** Have to duplicate these extract types, or downstream packages don't work correctly */
type ExtractPluginsContext<T extends RenderPlugin<any>[]> = {
  [K in T[number]['id']]: ExtractPluginContext<T, K>;
};

type ExtractPluginContext<T extends RenderPlugin<any>[], K extends T[number]['id']> = NonNullable<
  Extract<T[number], { id: K }>['hooks']
>['extendRequestCtx'] extends (...args: any[]) => infer R
  ? R
  : never;

export function createHandler<P extends RenderPlugin<any>[]>({
  renderRoot,
  renderer,
  renderApp,
  plugins,
}: ServerHandlerOpts<P>) {
  function getPageCtx<K extends P[number]['id']>(pluginId: K): Simplify<ExtractPluginContext<P, K>>;
  function getPageCtx<K extends P[number]['id']>(pluginId?: K): Simplify<ExtractPluginsContext<P>>;
  function getPageCtx<K extends P[number]['id']>(
    pluginId?: K,
  ): Simplify<ExtractPluginsContext<P> | ExtractPluginContext<P, K>> {
    const store = storage.getStore() || {};

    // @ts-expect-error ignore, complicated
    if (typeof pluginId !== 'undefined') return store[pluginId] || {};

    // @ts-expect-error ignore, complicated
    return store;
  }

  return {
    getPageCtx,

    client: () => {
      throw new Error(
        'The client handler should not be called on the server. . Something is wrong, make sure you are not calling `appHandler.client()` in code that is included in the server.',
      );
    },

    server: async ({ req }: { req: Request }) => {
      const assets = await assetsForRequest(req.url);

      const ctx: Record<string, any> = {};

      for (const p of plugins || []) {
        if (p.hooks?.extendRequestCtx) {
          ctx[p.id] = p.hooks.extendRequestCtx({ req });
        }
      }

      /**
       * Run the rest of the hooks in storage scope so we can access the ctx
       */
      const appStream = await storage.run(ctx, async () => {
        let appElem = renderApp ? await renderApp({ req }) : undefined;

        for (const p of plugins || []) {
          if (!p.hooks?.renderApp) continue;

          if (appElem) {
            throw new Error('Only one plugin can implement renderApp. Use wrapApp instead.');
          }

          appElem = await p.hooks.renderApp({ req });

          break;
        }

        if (!appElem) {
          throw new Error('No plugin implemented renderApp');
        }

        for (const p of plugins || []) {
          if (!p.hooks?.wrapApp) continue;

          appElem = p.hooks.wrapApp({ req, ctx: ctx[p.id], children: appElem });
        }

        const RootComp = renderRoot;

        return (await renderer.renderToStream({ app: <RootComp>{appElem}</RootComp> })).pipeThrough(
          injectIntoStream({
            async emitToDocumentHead() {
              const work = [];
              for (const p of plugins || []) {
                if (!p.hooks?.emitToDocumentHead) continue;

                work.push(p.hooks.emitToDocumentHead({ req, ctx: ctx[p.id] }));
              }

              const html = [renderAssetsToHtml(assets), ...(await Promise.all(work))];

              return html.filter(Boolean).join('');
            },

            async emitBeforeSsrChunk() {
              const work = [];
              for (const p of plugins || []) {
                if (!p.hooks?.emitBeforeSsrChunk) continue;

                work.push(p.hooks.emitBeforeSsrChunk({ req, ctx: ctx[p.id] }));
              }

              return (await Promise.all(work)).filter(Boolean).join('');
            },

            async emitToDocumentBody() {
              const work = [];
              for (const p of plugins || []) {
                if (!p.hooks?.emitToDocumentBody) continue;

                work.push(p.hooks.emitToDocumentBody({ req, ctx: ctx[p.id] }));
              }

              return (await Promise.all(work)).filter(Boolean).join('');
            },
          }),
        );
      });

      return appStream;
    },
  };
}
