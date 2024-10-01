import type { StreamInjectorHooks } from '@ssrx/streaming';

import type { SSRx } from './namespace.ts';

type ConfigBuiltIn = {
  jsxElement: unknown;
};

export type Config = ConfigBuiltIn & SSRx.Config;

export type RenderToStreamFn<O extends object = object> = (props: {
  app: () => Config['jsxElement'];
  req: Request;
  injectToStream?: StreamInjectorHooks | StreamInjectorHooks[];
  opts?: O;
}) => Promise<{ stream: ReadableStream; statusCode: () => number }>;

export type ServerRenderer = {
  renderToStream: RenderToStreamFn;
};

type BaseHandlerOpts = {
  RootLayout?: null | false | ((props: { children: Config['jsxElement'] }) => Config['jsxElement']);
  appRenderer?: (props: {
    req: Request;
    renderProps: SSRx.RenderProps;
    meta?: SSRx.ReqMeta;
  }) => (() => Config['jsxElement']) | Promise<() => Config['jsxElement']>;
};

export type ClientHandlerOpts<P extends RenderPlugin<any>[]> = BaseHandlerOpts & {
  plugins?: P;
};

export type ClientHandlerFn = (props: { renderProps: SSRx.RenderProps }) => Promise<() => Config['jsxElement']>;

export type ServerHandlerOpts<P extends RenderPlugin<any>[]> = BaseHandlerOpts & {
  renderer: ServerRenderer;
  plugins?: P;
};

export type ServerHandlerFn = (props: {
  req: Request;
  renderProps: SSRx.RenderProps;
  meta?: SSRx.ReqMeta;
}) => Promise<{ stream: ReadableStream<Uint8Array>; statusCode: () => number }>;

export type CommonHooks<AC extends Record<string, unknown> = Record<string, unknown>> = {
  /**
   * Extend the app ctx object with additional properties. The app ctx object is made available
   * to the end application on the server and the client, and to subsequent plugins.
   */
  extendCtx?: () => AC;

  /**
   * Wrap the app component with a higher-order component. This is useful for wrapping the app with providers, etc.
   */
  wrapApp?: () => (props: { children: () => Config['jsxElement'] }) => Config['jsxElement'];

  /**
   * Render the final inner-most app component. Only one plugin may do this - usually a routing plugin.
   */
  renderApp?: () => (() => Config['jsxElement']) | Promise<() => Config['jsxElement']>;
};

export type ServerHooks = StreamInjectorHooks;

export type RenderPlugin<AC extends Record<string, unknown>> = {
  id: Readonly<string>;

  hooksForReq?: (props: {
    req: Request;
    meta?: SSRx.ReqMeta;
    renderProps: SSRx.RenderProps;
    ctx: Record<string, unknown>;
  }) =>
    | null
    | {
        common?: CommonHooks<AC>;
        server?: ServerHooks;
      }
    | Promise<null | {
        common?: CommonHooks<AC>;
        server?: ServerHooks;
      }>;
};

/**
 * Some types useful to downstream consumers.
 */
export type { SetOptional } from 'type-fest';
