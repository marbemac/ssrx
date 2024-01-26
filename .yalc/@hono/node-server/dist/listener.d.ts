import { IncomingMessage, ServerResponse } from 'node:http';
import { Http2ServerRequest, Http2ServerResponse } from 'node:http2';
import { FetchCallback } from './types.js';
import 'node:https';

declare const getRequestListener: (fetchCallback: FetchCallback, customErrorHandler?: ((e: unknown) => void) | undefined) => (incoming: IncomingMessage | Http2ServerRequest, outgoing: ServerResponse | Http2ServerResponse) => void | Promise<void>;

export { getRequestListener };
