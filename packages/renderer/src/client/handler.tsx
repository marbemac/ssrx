/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Simplify } from 'type-fest';

import type { ClientHandlerFn, ClientHandlerOpts, RenderPlugin, ServerHandlerFn } from '../types.ts';

export function createApp<P extends RenderPlugin<any, any>[]>({
  RootLayout,
  appRenderer,
  plugins,
}: ClientHandlerOpts<P>) {
  // @ts-expect-error ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const req = new Request(`${window.location.pathname}${window.location.search}`);

  function __getPluginCtx<K extends P[number]['id']>(pluginId: K): Simplify<ExtractPluginContext<P, K>>;
  function __getPluginCtx<K extends P[number]['id']>(pluginId?: K): Simplify<ExtractPluginsContext<P>>;
  function __getPluginCtx<K extends P[number]['id']>(
    pluginId?: K,
  ): Simplify<ExtractPluginsContext<P> | ExtractPluginContext<P, K>> {
    // @ts-expect-error ignore, complicated
    const store = window.__PAGE_CTX__?.pluginCtx || {};

    if (typeof pluginId !== 'undefined') return store[pluginId] || {};

    return store;
  }

  const ctx = new Proxy({} as ExtractPluginsAppContext<P>, {
    get(_target, prop) {
      // @ts-expect-error ignore
      const store = window.__PAGE_CTX__?.appCtx || {};

      return store[prop];
    },
  });

  const serverHandler = (() => {
    throw new Error(
      'The server handler should not be called on the client. Something is wrong, make sure you are not calling `appHandler.server()` in code that is included in the client.',
    );
  }) as ServerHandlerFn;

  const clientHandler: ClientHandlerFn = async () => {
    const pluginCtx: Record<string, any> = {};
    for (const p of plugins ?? []) {
      if (p.createCtx) {
        pluginCtx[p.id] = p.createCtx({ req });
      }
    }

    const appCtx: Record<string, any> = {};
    for (const p of plugins ?? []) {
      if (p.hooks?.['app:extendCtx']) {
        Object.assign(
          appCtx,
          p.hooks['app:extendCtx']({
            ctx: pluginCtx[p.id],
            getPluginCtx<T>(id: string) {
              return pluginCtx[id] as T;
            },
          }) || {},
        );
      }
    }

    // @ts-expect-error ignore
    window.__PAGE_CTX__ = { pluginCtx, appCtx };

    let AppComp = appRenderer ? await appRenderer({ req }) : undefined;

    for (const p of plugins ?? []) {
      if (!p.hooks?.['app:render']) continue;

      if (AppComp) {
        throw new Error('Only one plugin can implement renderApp. Use wrapApp instead.');
      }

      AppComp = await p.hooks['app:render']({ req });

      break;
    }

    if (!AppComp) {
      throw new Error('No plugin implemented renderApp');
    }

    const wrappers: ((props: { children: () => JSX.Element }) => JSX.Element)[] = [];
    for (const p of plugins ?? []) {
      if (!p.hooks?.['app:wrap']) continue;

      wrappers.push(p.hooks['app:wrap']({ req, ctx: pluginCtx[p.id] }));
    }

    const renderApp = () => {
      if (!AppComp) {
        throw new Error('No plugin implemented renderApp');
      }

      let finalApp: JSX.Element;
      if (wrappers.length) {
        const wrapFn = (w: typeof wrappers): JSX.Element => {
          const [child, ...remainingWrappers] = w;

          if (!child) return AppComp!();

          return child({ children: () => wrapFn(remainingWrappers) });
        };

        finalApp = wrapFn(wrappers);
      } else {
        finalApp = AppComp();
      }

      return RootLayout ? RootLayout({ children: finalApp }) : finalApp;
    };

    return renderApp;
  };

  return {
    ctx,

    // for internal debugging
    __getPluginCtx,

    serverHandler,

    clientHandler,
  };
}

/**
 * Have to duplicate these extract types in client and server entry, or downstream packages don't work correctly
 */

type Flatten<T> = {
  [K in keyof T]: T[K] extends object ? T[K] : never;
}[keyof T];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type ExtractPluginsContext<T extends RenderPlugin<any, any>[]> = {
  [K in T[number]['id']]: ExtractPluginContext<T, K>;
};

type ExtractPluginContext<T extends RenderPlugin<any, any>[], K extends T[number]['id']> = NonNullable<
  Extract<T[number], { id: K }>
>['createCtx'] extends (...args: any[]) => infer R
  ? R
  : never;

type ExtractPluginsAppContext<T extends RenderPlugin<any, any>[]> = Simplify<
  UnionToIntersection<
    Flatten<{
      [K in T[number]['id']]: ExtractPluginAppContext<T, K>;
    }>
  >
>;

type ExtractPluginAppContext<T extends RenderPlugin<any, any>[], K extends T[number]['id']> = NonNullable<
  Extract<T[number], { id: K }>['hooks']
>['app:extendCtx'] extends (...args: any[]) => infer R
  ? R
  : never;
