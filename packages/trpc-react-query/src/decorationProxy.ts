/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AnyRouter } from '@trpc/server';
import { createRecursiveProxy } from '@trpc/server/shared';

import type { CreateQueryHooks } from './createHooksInternal.tsx';
import { getQueryKey, getQueryKeyInternal } from './getQueryKey.ts';

// const HOOKS_WITH_PLAIN_INPUT = ['invalidate', 'ensureQueryData', 'prefetchQuery', 'setData'];

/**
 * Create proxy for decorating procedures
 * @internal
 */
export function createSolidProxyDecoration<TRouter extends AnyRouter>(name: string, hooks: CreateQueryHooks<TRouter>) {
  return createRecursiveProxy(opts => {
    const args = opts.args;

    const pathCopy = [name, ...opts.path];

    // The last arg is for instance `.useMutation` or `.useQuery()`
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let lastArg = pathCopy.pop()!;
    if (lastArg.startsWith('$')) {
      // $ methods are defined on routers, pass through to the underlying hook
      lastArg = lastArg.slice(1);
    }

    // The `path` ends up being something like `post.byId`
    const path = pathCopy.join('.');

    if (lastArg === 'useMutation') {
      return (hooks as any)[lastArg](path, ...args);
    }

    const [input, ...otherArgs] = args;

    const queryKey = getQueryKeyInternal(path, input);

    if (['setData', 'setInfiniteData'].includes(lastArg)) {
      const [updater, input, ...otherArgs] = args;
      return (hooks as any)[lastArg](
        // @ts-expect-error ignore
        getQueryKey(path, typeof input === 'function' ? input() : input),
        updater,
        ...otherArgs,
      );
    }

    // if (HOOKS_WITH_PLAIN_INPUT.includes(lastArg)) {
    //   return (hooks as any)[lastArg](getQueryKey(path, typeof input === 'function' ? input() : input), ...otherArgs);
    // }

    return (hooks as any)[lastArg](queryKey, ...otherArgs);
  });
}
