import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createInsertSchema, createSelectSchema } from '../drizzle-valibot.ts';
import { users } from './users.ts';

export const userKeys = sqliteTable(
  'user_keys',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    hashedPassword: text('hashed_password'),
  },
  table => {
    return {
      nameIdx: index('user_keys_user_id_idx').on(table.userId),
    };
  },
);

export type UserKey = typeof userKeys.$inferSelect;
export type InsertUserKey = typeof userKeys.$inferInsert;

export const insertUserKeySchema = createInsertSchema(userKeys);
export const selectUserKeySchema = createSelectSchema(userKeys);
