import {
  chainTransformers,
  createBodyInsertionStream,
  createBufferedTransformStream,
  createHTMLInsertionStream,
  createMoveSuffixStream,
  createTagInsertionStream,
} from './stream-utils.ts';

export type InjectIntoStreamOpts = {
  emitToDocumentHead?: () => Promise<string> | string;
  emitBeforeSsrChunk?: () => Promise<string> | string;
  emitToDocumentBody?: () => Promise<string> | string;
  onStreamComplete?: () => Promise<void> | void;
};

export function injectIntoStream(
  renderStream: ReadableStream,
  { emitToDocumentHead, emitBeforeSsrChunk, emitToDocumentBody, onStreamComplete }: InjectIntoStreamOpts,
): ReadableStream<Uint8Array> {
  return chainTransformers(renderStream, [
    // Buffer everything to avoid flushing too frequently, and to avoid injecting into the middle of a tag (important!)
    createBufferedTransformStream(),

    // Insert arbitrary HTML into the document head (triggers once)
    emitToDocumentHead ? createTagInsertionStream('</head>', emitToDocumentHead) : null,

    // Insert arbitrary HTML into the document body on first flush (triggers once)
    emitToDocumentBody ? createBodyInsertionStream(emitToDocumentBody) : null,

    // Insert generated tags on flush (can trigger 1-n times)
    emitBeforeSsrChunk ? createHTMLInsertionStream(emitBeforeSsrChunk, { loc: 'before' }) : null,

    // Close tags should always be deferred to the end
    createMoveSuffixStream('</body></html>', onStreamComplete),
  ]);
}
