import { Server, ServerOptions as ServerOptions$1, createServer } from 'node:http';
import { Http2Server, Http2SecureServer, ServerOptions as ServerOptions$3, createServer as createServer$2, SecureServerOptions, createSecureServer } from 'node:http2';
import { ServerOptions as ServerOptions$2, createServer as createServer$1 } from 'node:https';

type FetchCallback = (request: Request) => Promise<unknown> | unknown;
type NextHandlerOption = {
    fetch: FetchCallback;
};
type ServerType = Server | Http2Server | Http2SecureServer;
type createHttpOptions = {
    serverOptions?: ServerOptions$1;
    createServer?: typeof createServer;
};
type createHttpsOptions = {
    serverOptions?: ServerOptions$2;
    createServer?: typeof createServer$1;
};
type createHttp2Options = {
    serverOptions?: ServerOptions$3;
    createServer?: typeof createServer$2;
};
type createSecureHttp2Options = {
    serverOptions?: SecureServerOptions;
    createServer?: typeof createSecureServer;
};
type ServerOptions = createHttpOptions | createHttpsOptions | createHttp2Options | createSecureHttp2Options;
type Options = {
    fetch: FetchCallback;
    port?: number;
    hostname?: string;
} & ServerOptions;

export { FetchCallback, NextHandlerOption, Options, ServerType };
