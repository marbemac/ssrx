type InjectIntoStreamOpts = {
  emitToDocumentHead?: () => Promise<string> | string;
  emitBeforeSsrChunk?: () => Promise<string>;
  emitToDocumentBody?: () => Promise<string>;
};

const encoder = /* #__PURE__ */ new TextEncoder();
const decoder = /* #__PURE__ */ new TextDecoder();

export const sleep = (n = 2000) => new Promise(r => setTimeout(r, n));

export function injectIntoStream({ emitToDocumentHead, emitBeforeSsrChunk, emitToDocumentBody }: InjectIntoStreamOpts) {
  // regex pattern for matching closing body and html tags
  const patternHead = /(<\/head>)/;
  const patternBody = /(<\/body>)/;

  let leftover = '';
  let headMatched = false;

  return new TransformStream({
    async transform(chunk, controller) {
      const chunkString = leftover + decoder.decode(chunk);

      let processed = chunkString;

      if (!headMatched) {
        const headMatch = processed.match(patternHead);
        if (!headMatch) {
          leftover = chunkString;
          return;
        }

        headMatched = true;

        if (emitToDocumentHead) {
          const strToInject = (await emitToDocumentHead()).trim();
          if (strToInject) {
            if (headMatch) {
              const headIndex = headMatch.index!;
              const headChunk =
                processed.slice(0, headIndex) + strToInject + processed.slice(headIndex, headMatch[0].length);
              controller.enqueue(encoder.encode(headChunk));
              processed = processed.slice(headIndex + headMatch[0].length);

              // await sleep();
            }
          }
        }
      }

      const bodyMatch = processed.match(patternBody);
      if (bodyMatch) {
        // If a </body> sequence was found
        const bodyIndex = bodyMatch.index!;

        const html = emitToDocumentBody ? await emitToDocumentBody() : '';

        // Add the arbitrary HTML before the closing body tag
        processed = processed.slice(0, bodyIndex) + html + processed.slice(bodyIndex);

        controller.enqueue(encoder.encode(processed));
        // await sleep();

        leftover = '';
      } else {
        const html = emitBeforeSsrChunk ? await emitBeforeSsrChunk() : '';
        if (html) {
          processed = html + processed;
        }

        controller.enqueue(encoder.encode(processed));
        // await sleep();
      }
    },

    flush(controller) {
      if (leftover) {
        controller.enqueue(encoder.encode(leftover));
      }
    },
  });
}
