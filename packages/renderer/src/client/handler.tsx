/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Simplify } from 'type-fest';

import type {
  ClientHandlerFn,
  ClientHandlerOpts,
  CommonHooks,
  Config,
  RenderPlugin,
  ServerHandlerFn,
} from '../types.ts';

export function createApp<P extends RenderPlugin<any>[]>({ RootLayout, appRenderer, plugins }: ClientHandlerOpts<P>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const req = new Request(`${window.location.pathname}${window.location.search}`);

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

  const clientHandler: ClientHandlerFn = async ({ renderProps = {} } = {}) => {
    const appCtx: Record<string, any> = {};

    const commonHooks = {
      extendCtx: [] as NonNullable<CommonHooks['extendCtx']>[],
      renderApp: [] as NonNullable<CommonHooks['renderApp']>[],
      wrapApp: [] as NonNullable<CommonHooks['wrapApp']>[],
    };

    for (const p of plugins ?? []) {
      if (p.hooksForReq) {
        const hooks = await p?.hooksForReq({ req, renderProps, ctx: appCtx });
        if (!hooks) continue;

        if (hooks.common) {
          for (const name in hooks.common) {
            const hook = hooks.common[name as keyof CommonHooks];
            if (!hook) continue;
            commonHooks[name as keyof CommonHooks]!.push(hook as any);
          }
        }
      }
    }

    for (const fn of commonHooks.extendCtx ?? []) {
      Object.assign(appCtx, fn() || {});
    }

    // @ts-expect-error ignore
    window.__PAGE_CTX__ = { appCtx };

    let AppComp = appRenderer ? await appRenderer({ req, renderProps }) : undefined;

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

    return renderApp;
  };

  return {
    ctx,

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

type ExtractPluginsAppContext<T extends RenderPlugin<any>[]> = Simplify<
  UnionToIntersection<
    Flatten<{
      [K in T[number]['id']]: ExtractPluginAppContext<T, K>;
    }>
  >
>;

type ExtractPluginAppContext<T extends RenderPlugin<any>[], K extends T[number]['id']> = ExtractPluginExtendCtxFn<
  Extract<T[number], { id: K }>
> extends (...args: any[]) => infer R
  ? R
  : never;

type ExtractPluginExtendCtxFn<T extends RenderPlugin<any>> = NonNullable<
  NonNullable<Awaited<ReturnType<NonNullable<T['hooksForReq']>>>>['common']
>['extendCtx'];
