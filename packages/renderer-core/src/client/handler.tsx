import type { Simplify } from 'type-fest';

import type { ClientHandlerOpts, RenderPlugin } from '../types.ts';

/** Have to duplicate these extract types, or downstream packages don't work correctly */
type ExtractPluginsContext<T extends RenderPlugin<any>[]> = {
  [K in T[number]['id']]: ExtractPluginContext<T, K>;
};

type ExtractPluginContext<T extends RenderPlugin<any>[], K extends T[number]['id']> = NonNullable<
  Extract<T[number], { id: K }>['hooks']
>['extendRequestCtx'] extends (...args: any[]) => infer R
  ? R
  : never;

export function createHandler<P extends RenderPlugin<any>[]>({ renderRoot, renderApp, plugins }: ClientHandlerOpts<P>) {
  // @ts-expect-error ignore
  const req = new Request(`${window.location.pathname}${window.location.search}`);

  function getPageCtx<K extends P[number]['id']>(pluginId: K): Simplify<ExtractPluginContext<P, K>>;
  function getPageCtx<K extends P[number]['id']>(pluginId?: K): Simplify<ExtractPluginsContext<P>>;
  function getPageCtx<K extends P[number]['id']>(
    pluginId?: K,
  ): Simplify<ExtractPluginsContext<P> | ExtractPluginContext<P, K>> {
    // @ts-expect-error ignore, complicated
    const store = window.__PAGE_CTX__ || {};

    if (typeof pluginId !== 'undefined') return store[pluginId] || {};

    return store;
  }

  return {
    getPageCtx,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    server: (props: { req: Request }) => {
      throw new Error(
        'The server handler should not be called on the client. Something is wrong, make sure you are not calling `appHandler.server()` in code that is included in the client.',
      );
    },

    client: async () => {
      const ctx: Record<string, any> = {};

      for (const p of plugins || []) {
        if (p.hooks?.extendRequestCtx) {
          ctx[p.id] = p.hooks.extendRequestCtx({ req });
        }
      }

      // @ts-expect-error ignore
      window.__PAGE_CTX__ = ctx;

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

      return <RootComp>{appElem}</RootComp>;
    },
  };
}
