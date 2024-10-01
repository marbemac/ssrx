import { AsyncLocalStorage } from 'node:async_hooks';

import type { Simplify } from 'type-fest';

import type {
  ClientHandlerFn,
  CommonHooks,
  Config,
  RenderPlugin,
  ServerHandlerFn,
  ServerHandlerOpts,
  ServerHooks,
} from '../types.ts';

export const storage = new AsyncLocalStorage<{ appCtx: Record<string, any> }>();

export function createApp<P extends RenderPlugin<any>[]>({
  RootLayout,
  renderer,
  appRenderer,
  plugins,
}: ServerHandlerOpts<P>) {
  const ctx = new Proxy({} as ExtractPluginsAppContext<P>, {
    get(_target, prop) {
      const store = storage.getStore()?.appCtx ?? {};
      // @ts-expect-error ignore
      return store[prop];
    },
  });

  const clientHandler = (() => {
    throw new Error(
      'The client handler should not be called on the server. . Something is wrong, make sure you are not calling `appHandler.client()` in code that is included in the server.',
    );
  }) as ClientHandlerFn;

  const serverHandler: ServerHandlerFn = async ({ req, meta, renderProps }) => {
    const appCtx: Record<string, any> = {};

    const commonHooks = {
      extendCtx: [] as NonNullable<CommonHooks['extendCtx']>[],
      renderApp: [] as NonNullable<CommonHooks['renderApp']>[],
      wrapApp: [] as NonNullable<CommonHooks['wrapApp']>[],
    };

    const serverHooks: ServerHooks[] = [];

    for (const p of plugins ?? []) {
      if (p.hooksForReq) {
        const hooks = await p?.hooksForReq({ req, meta, renderProps, ctx: appCtx });
        if (!hooks) continue;

        if (hooks.common) {
          for (const name in hooks.common) {
            const hook = hooks.common[name as keyof CommonHooks];
            if (!hook) continue;
            commonHooks[name as keyof CommonHooks]!.push(hook as any);
          }
        }

        if (hooks.server) {
          serverHooks.push(hooks.server);
        }
      }
    }

    for (const fn of commonHooks.extendCtx ?? []) {
      Object.assign(appCtx, fn() || {});
    }

    async function createAppStream() {
      let AppComp = appRenderer ? await appRenderer({ req, meta, renderProps }) : undefined;

      for (const fn of commonHooks.renderApp ?? []) {
        if (AppComp) {
          throw new Error('Only one plugin can implement app:render. app:wrap might be what you are looking for.');
        }

        AppComp = await fn();

        break;
      }

      const wrappers: ((props: { children: () => Config['jsxElement'] }) => Config['jsxElement'])[] = [];
      for (const fn of commonHooks.wrapApp ?? []) {
        wrappers.push(fn());
      }

      const renderApp = () => {
        if (!AppComp) {
          throw new Error('No plugin implemented renderApp');
        }

        let finalApp: Config['jsxElement'];
        if (wrappers.length) {
          const wrapFn = (w: typeof wrappers): Config['jsxElement'] => {
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

      return renderer.renderToStream({
        app: renderApp,
        req,
        injectToStream: serverHooks,
      });
    }

    /**
     * Run the rest of the hooks in storage scope so we can access the ctx
     */
    return storage.run({ appCtx }, createAppStream);
  };

  return {
    ctx,

    clientHandler,

    serverHandler,
  };
}

/**
 * Have to duplicate these extract types in client and server entry, or downstream packages don't work correctly
 */

type Flatten<T> = {
  [K in keyof T]: T[K] extends object ? T[K] : never;
}[keyof T];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type ExtractPluginsAppContext<T extends RenderPlugin<any>[]> = Simplify<
  UnionToIntersection<
    Flatten<{
      [K in T[number]['id']]: ExtractPluginAppContext<T, K>;
    }>
  >
>;

type ExtractPluginAppContext<T extends RenderPlugin<any>[], K extends T[number]['id']> = ExtractGenericArg1<
  Extract<T[number], { id: K }>
>;

type ExtractGenericArg1<T> = T extends RenderPlugin<infer X> ? X : never;
