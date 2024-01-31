import type { RenderToStreamFn } from '@ssrx/renderer/server';
import { injectIntoStream } from '@ssrx/streaming';
import { renderToStream as renderToSolidStream } from 'solid-js/web';

export const renderToStream: RenderToStreamFn<{
  nonce?: string;
  renderId?: string;
  onCompleteShell?: (info: { write: (v: string) => void }) => void;
  onCompleteAll?: (info: { write: (v: string) => void }) => void;
}> = async ({ req, app, injectToStream, opts }) => {
  const stream = renderToSolidStream(() => app(), opts);
  const { readable, writable } = new TransformStream();
  stream.pipeTo(writable);

  return {
    stream: injectToStream ? injectIntoStream(req, readable, injectToStream) : readable,
    statusCode: () => 200,
  };
};
