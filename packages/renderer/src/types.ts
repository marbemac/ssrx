import type { InjectIntoStreamOpts } from '@ssrx/streaming';

import type { SSRx } from './namespace.ts';

type ConfigBuiltIn = {
  jsxElement: unknown;
};

export type Config = ConfigBuiltIn & SSRx.Config;

export type RenderToStreamFn<O extends object = object> = (props: {
  app: () => Config['jsxElement'];
  req: Request;
  injectToStream?: InjectIntoStreamOpts;
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

export type ClientHandlerOpts<P extends RenderPlugin<any, any>[]> = BaseHandlerOpts & {
  plugins?: P;
};

export type ClientHandlerFn = (props?: { renderProps?: SSRx.RenderProps }) => Promise<() => Config['jsxElement']>;

export type ServerHandlerOpts<P extends RenderPlugin<any, any>[]> = BaseHandlerOpts & {
  renderer: ServerRenderer;
  plugins?: P;
};

export type ServerHandlerFn = (props: {
  req: Request;
  renderProps?: SSRx.RenderProps;
  meta?: SSRx.ReqMeta;
}) => Promise<{ stream: ReadableStream<Uint8Array>; statusCode: () => number }>;

export type RenderPlugin<C extends Record<string, unknown>, AC extends Record<string, unknown>> = {
  id: Readonly<string>;

  /**
   * Create a context object that will be passed to all of this plugin's hooks.
   */
  createCtx?: (props: { req: Request; meta?: SSRx.ReqMeta; renderProps: SSRx.RenderProps }) => C;

  hooks?: {
    /**
     * Extend the app ctx object with additional properties. The app ctx object is made available
     * to the end application on the server and the client.
     */
    'app:extendCtx'?: (props: {
      ctx: C;
      getPluginCtx: <T extends Record<string, unknown>>(id: string) => T;
      meta?: SSRx.ReqMeta;
    }) => AC;

    /**
     * Wrap the app component with a higher-order component. This is useful for wrapping the app with providers, etc.
     */
    'app:wrap'?: (props: {
      req: Request;
      ctx: C;
      renderProps: SSRx.RenderProps;
      meta?: SSRx.ReqMeta;
    }) => (props: { children: () => Config['jsxElement'] }) => Config['jsxElement'];

    /**
     * Render the final inner-most app component. Only one plugin may do this - usually a routing plugin.
     */
    'app:render'?: (props: {
      req: Request;
      ctx: C;
      renderProps: SSRx.RenderProps;
      meta?: SSRx.ReqMeta;
    }) => (() => Config['jsxElement']) | Promise<() => Config['jsxElement']>;

    /**
     * Return a string to emit some HTML just before the document's closing </head> tag.
     *
     * Triggers once per request.
     */
    'ssr:emitToHead'?: (props: {
      req: Request;
      ctx: C;
      renderProps: SSRx.RenderProps;
      meta?: SSRx.ReqMeta;
    }) => string | void | undefined | Promise<string | void | undefined>;

    /**
     * Return a string to emit into the SSR stream just before the rendering
     * framework (react, solid, etc) emits a chunk of the page.
     *
     * Triggers one or more times per request.
     */
    'ssr:emitBeforeFlush'?: (props: {
      req: Request;
      ctx: C;
      renderProps: SSRx.RenderProps;
      meta?: SSRx.ReqMeta;
    }) => string | void | undefined | Promise<string | void | undefined>;

    /**
     * Return a string to emit some HTML to the document body, after the client renderer's first flush.
     *
     * Triggers once per request.
     */
    'ssr:emitToBody'?: (props: {
      req: Request;
      ctx: C;
      renderProps: SSRx.RenderProps;
      meta?: SSRx.ReqMeta;
    }) => string | void | undefined | Promise<string | void | undefined>;

    /**
     * Runs when the stream is done processing.
     */
    'ssr:completed'?: (props: {
      req: Request;
      ctx: C;
      renderProps: SSRx.RenderProps;
      meta?: SSRx.ReqMeta;
    }) => void | Promise<void>;
  };
};

/**
 * Some types useful to downstream consumers.
 */
export type { SetOptional } from 'type-fest';
