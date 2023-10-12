import { initTRPC } from '@trpc/server';

import { getMembers } from '~/utils.ts';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export type AppRouter = typeof appRouter;

export const appRouter = router({
  membersList: publicProcedure.query(async () => {
    console.log('trpc.getMembers()');
    return getMembers();
  }),
});
