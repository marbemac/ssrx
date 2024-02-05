import {
  chainTransformers,
  createBodyInsertionStream,
  createBufferedTransformStream,
  createHTMLInsertionStream,
  createMoveSuffixStream,
  createTagInsertionStream,
} from './stream-utils.ts';

export type StreamInjectorHooks = {
  /**
   * Return a string to emit some HTML into the SSR stream just before the document's closing </head> tag.
   *
   * Called once per request.
   */
  emitToDocumentHead?: () => Promise<string | undefined> | string | undefined;

  /**
   * Return a string to emit into the SSR stream just before the rendering
   * framework (react, solid, etc) emits a chunk of the page.
   *
   * Called one or more times per request.
   */
  emitBeforeStreamChunk?: () => Promise<string | undefined> | string | undefined;

  /**
   * Return a string to emit some HTML to the document body, after the client renderer's first flush.
   *
   * Called once per request.
   */
  emitToDocumentBody?: () => Promise<string | undefined> | string | undefined;

  /**
   * Runs when the stream is done processing.
   */
  onStreamComplete?: () => Promise<void> | void;
};

export function injectIntoStream(
  req: Request,
  renderStream: ReadableStream,
  originalHooks: StreamInjectorHooks | StreamInjectorHooks[],
): ReadableStream<Uint8Array> {
  const headFns: NonNullable<StreamInjectorHooks['emitToDocumentHead']>[] = [];
  const chunkFns: NonNullable<StreamInjectorHooks['emitBeforeStreamChunk']>[] = [];
  const bodyFns: NonNullable<StreamInjectorHooks['emitToDocumentBody']>[] = [];
  const completeFns: NonNullable<StreamInjectorHooks['onStreamComplete']>[] = [];

  const hooks = Array.isArray(originalHooks) ? originalHooks : [originalHooks];
  for (const hook of hooks) {
    if (hook.emitToDocumentHead) headFns.push(hook.emitToDocumentHead);
    if (hook.emitBeforeStreamChunk) chunkFns.push(hook.emitBeforeStreamChunk);
    if (hook.emitToDocumentBody) bodyFns.push(hook.emitToDocumentBody);
    if (hook.onStreamComplete) completeFns.push(hook.onStreamComplete);
  }

  return chainTransformers(renderStream, [
    // Buffer everything to avoid flushing too frequently, and to avoid injecting into the middle of a tag (important!)
    createBufferedTransformStream(),

    // Insert arbitrary HTML into the document head (triggers once)
    headFns.length
      ? createTagInsertionStream('</head>', async () => {
          const work = headFns.map(fn => fn());
          return (await Promise.all(work)).filter(Boolean).join('');
        })
      : null,

    // Insert arbitrary HTML into the document body on first flush (triggers once)
    bodyFns.length
      ? createBodyInsertionStream(async () => {
          const work = bodyFns.map(fn => fn());
          return (await Promise.all(work)).filter(Boolean).join('');
        })
      : null,

    // Insert generated tags on flush (can trigger 1-n times)
    chunkFns.length
      ? createHTMLInsertionStream(
          async () => {
            const work = chunkFns.map(fn => fn());
            return (await Promise.all(work)).filter(Boolean).join('');
          },
          { loc: 'before' },
        )
      : null,

    // Close tags should always be deferred to the end
    createMoveSuffixStream(
      '</body></html>',
      completeFns.length
        ? async () => {
            const work = completeFns.map(fn => fn());
            await Promise.all(work);
          }
        : undefined,
    ),
  ]);
}
