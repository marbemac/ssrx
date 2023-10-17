export type ServerRenderer = {
  renderToStream: (props: { app: () => JSX.Element }) => Promise<ReadableStream>;
};

type BaseHandlerOpts = {
  RootLayout: (props: { children: JSX.Element }) => JSX.Element;
  appRenderer?: (props: { req: Request }) => (() => JSX.Element) | Promise<() => JSX.Element>;
};

export type ClientHandlerOpts<P extends RenderPlugin<any, any>[]> = BaseHandlerOpts & {
  plugins?: P;
};

export type ServerHandlerOpts<P extends RenderPlugin<any, any>[]> = BaseHandlerOpts & {
  renderer: ServerRenderer;
  plugins?: P;
};

export type RenderPlugin<C extends Record<string, unknown>, AC extends Record<string, unknown>> = {
  id: Readonly<string>;

  /**
   * Create a context object that will be passed to all of this plugin's hooks.
   */
  createCtx?: (props: { req: Request; meta?: Record<string, unknown> }) => C;

  hooks?: {
    /**
     * Extend the app ctx object with additional properties. The app ctx object is made available
     * to the end application on the server and the client.
     */
    'app:extendCtx'?: (props: {
      ctx: C;
      getPluginCtx: <T extends Record<string, unknown>>(id: string) => T;
      meta?: Record<string, unknown>;
    }) => AC;

    /**
     * Wrap the app component with a higher-order component. This is useful for wrapping the app with providers, etc.
     */
    'app:wrap'?: (props: { req: Request; ctx: C }) => (props: { children: () => JSX.Element }) => JSX.Element;

    /**
     * Render the final inner-most app component. Only one plugin may do this - usually a routing plugin.
     */
    'app:render'?: (props: { req: Request }) => (() => JSX.Element) | Promise<() => JSX.Element>;

    /**
     * Return a string or ReactElement to emit some HTML into the document's head.
     */
    'ssr:emitToHead'?: (props: {
      req: Request;
      ctx: C;
    }) => string | void | undefined | Promise<string | void | undefined>;

    /**
     * Return a string to emit into the SSR stream just before the rendering
     * framework (react, solid, etc) emits a chunk of the page.
     */
    'ssr:emitBeforeFlush'?: (props: {
      req: Request;
      ctx: C;
    }) => string | void | undefined | Promise<string | void | undefined>;

    /**
     * Return a string to emit some HTML into the document's body before it is closed.
     */
    'ssr:emitToBody'?: (props: {
      req: Request;
      ctx: C;
    }) => string | void | undefined | Promise<string | void | undefined>;

    /**
     * @TODO: not actually implemented yet
     */
    'ssr:completed'?: (props: { req: Request; ctx: C }) => void | Promise<void>;
  };
};

/**
 * Some types useful to downstream consumers.
 */
export type { SetOptional } from 'type-fest';
