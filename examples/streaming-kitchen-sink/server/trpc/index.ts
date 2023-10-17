import { articlesRouter } from './articles.ts';
import { authRouter } from './auth.ts';
import { router } from './trpc.ts';

export type AppRouter = typeof appRouter;

export const appRouter = router({
  auth: authRouter,
  articles: articlesRouter,
});
