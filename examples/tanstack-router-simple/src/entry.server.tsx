import { renderAssets } from '@ssrx/react/server';
import { assetsForRequest } from '@ssrx/vite/runtime';
import {
  type AnyRouteMatch,
  type AnyRouter,
  createControlledPromise,
  createMemoryHistory,
  defer,
  type ExtractedEntry,
  isPlainArray,
  isPlainObject,
  type StreamState,
} from '@tanstack/react-router';
import { StartServer } from '@tanstack/start/server';

import { createRouter } from '~/router.tsx';

export async function render(req: Request) {
  const assets = await assetsForRequest(req.url);

  const router = createRouter({
    context: {
      headTags: () => renderAssets(assets.headAssets),
      bodyTags: () => renderAssets(assets.bodyAssets),
    },
  });

  // required if using defer() in loaders
  router.serializeLoaderData = serializeLoaderData;

  const url = new URL(req.url);
  const memoryHistory = createMemoryHistory({
    initialEntries: [url.pathname + url.search],
  });

  router.update({ history: memoryHistory });

  // Wait for critical, non-deferred data
  await router.load();

  const app = <StartServer router={router} />;

  return { app, router };
}

/**
 * This serializeLoaderData() function is required to support deferred data, but is not exported from @tanstack/start.
 *
 * For now, we're copying the implementation from:
 *
 * https://github.com/TanStack/router/blob/main/packages/start/src/client/serialization.tsx
 */
function serializeLoaderData(
  dataType: '__beforeLoadContext' | 'loaderData',
  data: any,
  ctx: {
    match: AnyRouteMatch;
    router: AnyRouter;
  },
) {
  if (!ctx.router.isServer) {
    return data;
  }

  (ctx.match as any).extracted = (ctx.match as any).extracted || [];

  const extracted = (ctx.match as any).extracted;

  const replacedLoaderData = replaceBy(data, (value, path) => {
    const type = value instanceof ReadableStream ? 'stream' : value instanceof Promise ? 'promise' : undefined;

    if (type) {
      const entry: ExtractedEntry = {
        dataType,
        type,
        path,
        id: extracted.length,
        value,
        matchIndex: ctx.match.index,
      };

      extracted.push(entry);

      // If it's a stream, we need to tee it so we can read it multiple times
      if (type === 'stream') {
        const [copy1, copy2] = value.tee();
        entry.streamState = createStreamState({ stream: copy2 });

        return copy1;
      } else {
        void defer(value);
      }
    }

    return value;
  });

  return replacedLoaderData;
}

function replaceBy<T>(obj: T, cb: (value: any, path: Array<string>) => any, path: Array<string> = []): T {
  if (isPlainArray(obj)) {
    return obj.map((value, i) => replaceBy(value, cb, [...path, `${i}`])) as any;
  }

  if (isPlainObject(obj)) {
    // Do not allow objects with illegal
    const newObj: any = {};

    for (const key in obj) {
      newObj[key] = replaceBy(obj[key], cb, [...path, key]);
    }

    return newObj;
  }

  // // Detect classes, functions, and other non-serializable objects
  // // and return undefined. Exclude some known types that are serializable
  // if (
  //   typeof obj === 'function' ||
  //   (typeof obj === 'object' &&
  //     ![Object, Promise, ReadableStream].includes((obj as any)?.constructor))
  // ) {
  //   console.info(obj)
  //   warning(false, `Non-serializable value ☝️ found at ${path.join('.')}`)
  //   return undefined as any
  // }

  const newObj = cb(obj, path);

  if (newObj !== obj) {
    return newObj;
  }

  return obj;
}

// Readable stream with state is a stream that has a promise that resolves to the next chunk
function createStreamState({ stream }: { stream: ReadableStream }): StreamState {
  const streamState: StreamState = {
    promises: [],
  };

  const reader = stream.getReader();

  const read = (index: number): any => {
    streamState.promises[index] = createControlledPromise();

    return reader.read().then(({ done, value }) => {
      if (done) {
        streamState.promises[index]!.resolve(null);
        reader.releaseLock();
        return;
      }

      streamState.promises[index]!.resolve(value);

      return read(index + 1);
    });
  };

  read(0).catch((err: any) => {
    console.error('stream read error', err);
  });

  return streamState;
}
