import { OutgoingHttpHeaders } from 'node:http';
import { Writable } from 'node:stream';

declare function writeFromReadableStream(stream: ReadableStream<Uint8Array>, writable: Writable): Promise<undefined> | undefined;
declare const buildOutgoingHttpHeaders: (headers: Headers) => OutgoingHttpHeaders;

export { buildOutgoingHttpHeaders, writeFromReadableStream };
