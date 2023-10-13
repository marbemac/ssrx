import { wrap } from '@decs/typeschema';
import { omit } from 'valibot';

import { createDbId } from '~/server/db/ids.ts';
import { insertPostSchema, posts } from '~/server/db/schema/index.ts';

import { publicProcedure, router } from './trpc.ts';

export const postsRouter = router({
  create: publicProcedure.input(wrap(omit(insertPostSchema, ['id', 'authorId']))).mutation(async ({ input, ctx }) => {
    const post = await ctx.db
      .insert(posts)
      .values({
        ...input,
        id: `p_${createDbId()}`,
        authorId: 'TODO',
      })
      .returning()
      .execute();

    return post[0];
  }),

  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(posts);
  }),
});
