import { blob, index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot';

import { users } from './users.ts';

export const userSessions = sqliteTable(
  'user_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    activeExpires: blob('active_expires', {
      mode: 'bigint',
    }).notNull(),
    idleExpires: blob('idle_expires', {
      mode: 'bigint',
    }).notNull(),
  },
  table => {
    return {
      nameIdx: index('user_sessions_user_id_idx').on(table.userId),
    };
  },
);

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

export const insertUserSessionSchema = createInsertSchema(userSessions);
export const selectUserSessionSchema = createSelectSchema(userSessions);
