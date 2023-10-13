import { initTRPC, TRPCError } from '@trpc/server';

import type { ReqCtx } from '~/server/middleware/context.ts';

const t = initTRPC.context<ReqCtx>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.isAuthed) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      sessionId: ctx.sessionId!,
      user: ctx.user!,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
