import { TRPCError } from '@trpc/server';
import { desc, eq, or } from 'drizzle-orm';
import * as v from 'valibot';

import { createDbId } from '~/api/db/ids.ts';
import { articles, insertArticleSchema, selectArticleSchema } from '~/api/db/schema/index.ts';
import { sleep } from '~/utils.ts';

import { protectedProcedure, publicProcedure, router } from './trpc.ts';

export const articlesRouter = router({
  /**
   * Queries
   */

  list: publicProcedure.query(async ({ ctx }) => {
    await sleep(1000);

    return ctx.db
      .select()
      .from(articles)
      .where(or(eq(articles.status, 'published'), eq(articles.authorId, ctx.user?.id)))
      .orderBy(desc(articles.createdAt))
      .execute();
  }),

  byId: publicProcedure
    .input(i => v.parse(v.pick(selectArticleSchema, ['id']), i))
    .query(async ({ input, ctx }) => {
      await sleep(500);

      const article = (await ctx.db.select().from(articles).where(eq(articles.id, input.id)).execute())[0];
      if (!article || (article.status === 'draft' && article.authorId !== ctx.user?.id)) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return article;
    }),

  /**
   * Mutations
   */

  create: protectedProcedure
    .input(i => v.parse(v.omit(insertArticleSchema, ['id', 'authorId']), i))
    .mutation(async ({ input, ctx }) => {
      const article = await ctx.db
        .insert(articles)
        .values({
          ...input,
          id: `p_${createDbId()}`,
          authorId: ctx.user.id,
        })
        .returning()
        .execute();

      return article[0]!;
    }),

  update: protectedProcedure
    .input(i =>
      v.parse(
        v.object({
          lookup: v.pick(insertArticleSchema, ['id']),
          set: v.partial(v.pick(insertArticleSchema, ['title', 'body', 'status'])),
        }),
        i,
      ),
    )
    .mutation(async ({ input: { lookup, set }, ctx }) => {
      const existing = (await ctx.db.select().from(articles).where(eq(articles.id, lookup.id)).execute())[0];
      if (!existing || existing.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const article = await ctx.db
        .update(articles)
        .set({
          ...set,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(articles.id, lookup.id))
        .returning()
        .execute();

      return article[0];
    }),

  delete: protectedProcedure
    .input(i => v.parse(v.pick(selectArticleSchema, ['id']), i))
    .mutation(async ({ input: { id }, ctx }) => {
      const existing = (await ctx.db.select().from(articles).where(eq(articles.id, id)).execute())[0];
      if (!existing || existing.authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      await ctx.db.delete(articles).where(eq(articles.id, id)).execute();

      return null;
    }),
});
