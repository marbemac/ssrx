# `@ssrx/streaming`

Exports a `injectToStream` function that gives the consumer several convenient hooks into the stream lifecycle.

Expects web streams, not node streams (however, can pass a node web stream in).

```tsx
import { injectIntoStream } from '@ssrx/streaming';
import { renderToReadableStream } from 'react-dom';

import { MyApp } from './app.tsx';

export const handler = (req: Request) => {
  const originalStream = renderToReadableStream(<MyApp />);

  let counter = 0;

  const stream = injectIntoStream(req, originalStream, {
    /**
     * Return a string to emit some HTML into the SSR stream just before the document's closing </head> tag.
     *
     * Called once per request.
     */
    emitToDocumentHead: async () => {
      return `<link href='foo.css' />`
    };

    /**
     * Return a string to emit into the SSR stream just before the rendering
     * framework (react, solid, etc) emits a chunk of the page.
     *
     * Called one or more times per request.
     */
    emitToDocumentBody: async () => {
      return `<script src='foo.js' />`
    };

    /**
     * Return a string to emit some HTML to the document body, after the client renderer's first flush.
     *
     * Called once per request.
     */
    emitToDocumentBody: async () => {
      counter += 1;

      return `<script>console.log('emitToDocumentBody number ${counter}')</script>`
    };

    /**
     * Runs when the stream is done processing.
     */
    onStreamComplete: () => {
      // cleanup, etc
    };
  })

  return new Response(stream, { headers: { 'content-type': 'text/html' } });
}
```
