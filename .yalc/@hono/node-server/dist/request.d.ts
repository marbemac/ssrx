import { IncomingMessage } from 'node:http';
import { Http2ServerRequest } from 'node:http2';

declare const newRequest: (incoming: IncomingMessage | Http2ServerRequest) => any;

export { newRequest };
