import {
  chainTransformers,
  createBodyInsertionStream,
  createBufferedTransformStream,
  createHTMLInsertionStream,
  createMoveSuffixStream,
  createTagInsertionStream,
} from './stream-utils.ts';

export type StreamInjectorHooks = {
  emitToDocumentHead?: () => Promise<string> | string;
  emitBeforeStreamChunk?: () => Promise<string> | string;
  emitToDocumentBody?: () => Promise<string> | string;
  onStreamComplete?: () => Promise<void> | void;
};

export type StreamInjectorOpts = {
  hooks: StreamInjectorHooks | StreamInjectorHooks[];
};

export function injectIntoStream(
  req: Request,
  renderStream: ReadableStream,
  opts: StreamInjectorOpts,
): ReadableStream<Uint8Array> {
  const headFns: NonNullable<StreamInjectorHooks['emitToDocumentHead']>[] = [];
  const chunkFns: NonNullable<StreamInjectorHooks['emitBeforeStreamChunk']>[] = [];
  const bodyFns: NonNullable<StreamInjectorHooks['emitToDocumentBody']>[] = [];
  const completeFns: NonNullable<StreamInjectorHooks['onStreamComplete']>[] = [];

  const hooks = Array.isArray(opts.hooks) ? opts.hooks : [opts.hooks];
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
    chunkFns.length
      ? createBodyInsertionStream(async () => {
          const work = bodyFns.map(fn => fn());
          return (await Promise.all(work)).filter(Boolean).join('');
        })
      : null,

    // Insert generated tags on flush (can trigger 1-n times)
    bodyFns.length
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
