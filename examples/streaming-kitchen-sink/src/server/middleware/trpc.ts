/**
 * Adapted from https://github.com/honojs/middleware/tree/main/packages/trpc-server
 */

import type { AnyRouter } from '@trpc/server';
import type { FetchHandlerRequestOptions } from '@trpc/server/adapters/fetch';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { Context, Env } from 'hono';
import { createMiddleware } from 'hono/factory';

type tRPCOptions<HonoEnv extends Env, TrpcCtx = HonoEnv['Variables']> = Omit<
  FetchHandlerRequestOptions<AnyRouter>,
  'req' | 'endpoint' | 'createContext'
> &
  Partial<Pick<FetchHandlerRequestOptions<AnyRouter>, 'endpoint'>> & {
    createContext?: (opts: { c: Context<HonoEnv>; req: Request; resHeaders: Headers }) => TrpcCtx;
  };

export const trpcServer = <HonoEnv extends Env, TrpcCtx = HonoEnv['Variables']>({
  endpoint = '/trpc',
  createContext,
  ...rest
}: tRPCOptions<HonoEnv, TrpcCtx>) => {
  return createMiddleware(async c => {
    const res = await fetchRequestHandler({
      ...rest,
      endpoint,
      req: c.req.raw,
      createContext: createContext ? ({ req, resHeaders }) => createContext({ c, req, resHeaders }) : undefined,
    });

    return res;
  });
};
