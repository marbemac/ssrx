export type ServerRenderer = {
  renderToStream: (props: { app: React.ReactNode }) => Promise<ReadableStream>;
};

type BaseHandlerOpts = {
  renderRoot: (props: { children: React.ReactNode }) => React.ReactNode;
  renderApp?: (props: { req: Request }) => React.ReactNode | Promise<React.ReactNode>;
};

export type ClientHandlerOpts<P extends RenderPlugin<any, any>[]> = BaseHandlerOpts & {
  plugins?: P;
};

export type ServerHandlerOpts<P extends RenderPlugin<any, any>[]> = BaseHandlerOpts & {
  renderer: ServerRenderer;
  plugins?: P;
};

export type RenderPlugin<C extends Record<string, unknown>, AC extends Record<string, unknown>> = {
  id: string;

  hooks?: {
    extendRequestCtx?: (props: { req: Request }) => C;

    extendAppCtx?: (props: { ctx: C }) => AC;

    wrapApp?: (props: { req: Request; ctx: C; children: React.ReactNode }) => React.ReactNode;
    renderApp?: (props: { req: Request }) => React.ReactNode | Promise<React.ReactNode>;

    // Return a string or ReactElement to emit
    // some HTML into the document's head.
    emitToDocumentHead?: (props: {
      req: Request;
      ctx: C;
    }) => string | void | undefined | Promise<string | void | undefined>;

    // Return a string to emit into the
    // SSR stream just before the rendering framework (react, solid, etc) emits a
    // chunk of the page.
    emitBeforeSsrChunk?: (props: {
      req: Request;
      ctx: C;
    }) => string | void | undefined | Promise<string | void | undefined>;

    // Return a string or ReactElement to emit
    // some HTML into the document's body before it is closed.
    emitToDocumentBody?: (props: {
      req: Request;
      ctx: C;
    }) => string | void | undefined | Promise<string | void | undefined>;
  };
};

/**
 * Some types useful to downstream consumers.
 */
export type { SetOptional } from 'type-fest';
