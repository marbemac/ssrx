import {
  chainTransformers,
  createBufferedTransformStream,
  createHeadInsertionTransformStream,
  createInsertedHTMLStream,
  createMoveSuffixStream,
} from './stream-utils.ts';

type InjectIntoStreamOpts = {
  emitToDocumentHead?: () => Promise<string> | string;
  emitBeforeSsrChunk?: () => Promise<string> | string;
};

export function injectIntoStream(
  renderStream: ReadableStream,
  { emitToDocumentHead, emitBeforeSsrChunk }: InjectIntoStreamOpts,
): ReadableStream<Uint8Array> {
  const closeTag = '</body></html>';

  return chainTransformers(renderStream, [
    // Buffer everything to avoid flushing too frequently
    createBufferedTransformStream(),

    // Insert arbitrary HTML into the document head
    emitToDocumentHead ? createHeadInsertionTransformStream(emitToDocumentHead) : null,

    // Insert generated tags on flush
    emitBeforeSsrChunk ? createInsertedHTMLStream(emitBeforeSsrChunk) : null,

    // Close tags should always be deferred to the end
    createMoveSuffixStream(closeTag),
  ]);
}
