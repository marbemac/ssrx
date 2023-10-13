import { sql } from 'drizzle-orm';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot';

import { users } from './users.ts';

export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    body: text('title').notNull(),
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

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);
