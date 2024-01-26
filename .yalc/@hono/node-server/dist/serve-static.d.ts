import { Context, MiddlewareHandler } from 'hono';

type ServeStaticOptions = {
    /**
     * Root path, relative to current working directory. (absolute paths are not supported)
     */
    root?: string;
    path?: string;
    index?: string;
    rewriteRequestPath?: (path: string) => string;
    onNotFound?: (path: string, c: Context) => void | Promise<void>;
};
declare const serveStatic: (options?: ServeStaticOptions) => MiddlewareHandler;

export { ServeStaticOptions, serveStatic };
