import { wrap } from '@decs/typeschema';
import { TRPCError } from '@trpc/server';
import { desc, eq, or } from 'drizzle-orm';
import { object, omit, partial, pick } from 'valibot';

import { createDbId } from '~server/db/ids.ts';
import { articles, insertArticleSchema, selectArticleSchema } from '~server/db/schema/index.ts';
import { sleep } from '~client/utils.ts';

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

  byId: publicProcedure.input(wrap(pick(selectArticleSchema, ['id']))).query(async ({ input, ctx }) => {
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
    .input(wrap(omit(insertArticleSchema, ['id', 'authorId'])))
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
    .input(
      wrap(
        object({
          lookup: pick(insertArticleSchema, ['id']),
          set: partial(pick(insertArticleSchema, ['title', 'body', 'status'])),
        }),
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

  delete: protectedProcedure.input(wrap(pick(selectArticleSchema, ['id']))).mutation(async ({ input: { id }, ctx }) => {
    const existing = (await ctx.db.select().from(articles).where(eq(articles.id, id)).execute())[0];
    if (!existing || existing.authorId !== ctx.user.id) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    await ctx.db.delete(articles).where(eq(articles.id, id)).execute();

    return null;
  }),
});
