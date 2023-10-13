import { getMembers } from '~/utils.ts';

import { authRouter } from './auth.ts';
import { postsRouter } from './posts.ts';
import { publicProcedure, router } from './trpc.ts';

export type AppRouter = typeof appRouter;

export const appRouter = router({
  membersList: publicProcedure.query(async () => {
    return getMembers();
  }),

  auth: authRouter,
  posts: postsRouter,
});
