# @ssrx/trpc-react

Similar https://github.com/trpc/trpc/tree/main/packages/react-query, with the following major changes:

- Does not rely on global/react context - supports instanced use (for example in SSR where a fresh client per request is
  required).
- Scoped + typesafe `.$invalidate()` function on queries, e.g. `trpc.articles.$invalidate({ id })`.

**Example instantiation from a react-query client:**

```ts
import type { QueryClient } from '@tanstack/react-query';
import { createTRPCUntypedClient } from '@trpc/client';
import { type CreateTRPCQueryOptions, createTRPCReact } from '@ssrx/trpc-react-query';

export const createTrpc = ({
  queryClient,
  createTRPCQueryOptions,
}: {
  queryClient: QueryClient;
  options?: CreateTRPCQueryOptions;
}) => {
  const trpcClient = createTRPCUntypedClient();

  const trpc = createTRPCReact<TRouter>({
    client: trpcClient,
    queryClient,
    ...createTRPCQueryOptions,
  });

  return trpc;
};
```
