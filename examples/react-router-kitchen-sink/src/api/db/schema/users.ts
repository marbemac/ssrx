import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { createInsertSchema, createSelectSchema } from '../drizzle-valibot.ts';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
