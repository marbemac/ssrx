import { sql } from 'drizzle-orm';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createInsertSchema, createSelectSchema } from '../drizzle-valibot.ts';
import { users } from './users.ts';

export const articles = sqliteTable(
  'articles',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    status: text('status', { enum: ['published', 'draft'] })
      .notNull()
      .default('draft'),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at'),
  },
  table => {
    return {
      nameIdx: index('posts_author_id_idx').on(table.authorId),
    };
  },
);

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

export const insertArticleSchema = createInsertSchema(articles);
export const selectArticleSchema = createSelectSchema(articles);
