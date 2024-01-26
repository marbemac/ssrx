import * as http2 from 'http2';
import * as http from 'http';
import { Hono } from 'hono';

declare const handle: (app: Hono<any, any, any>) => (incoming: http.IncomingMessage | http2.Http2ServerRequest, outgoing: http.ServerResponse<http.IncomingMessage> | http2.Http2ServerResponse) => void | Promise<void>;

export { handle };
