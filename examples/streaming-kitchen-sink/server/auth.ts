// Uncomment this if using node 18. Node >= 20, or other runtimes like bun, cloudflare, etc, do not need to polyfill.
// https://lucia-auth.com/getting-started/#polyfill
// import 'lucia/polyfill/node';

import { betterSqlite3 } from '@lucia-auth/adapter-sqlite';
import { lucia } from 'lucia';
import { hono } from 'lucia/middleware';

import { sqliteDatabase } from '~server/db/client.ts';

export type Auth = typeof auth;

export const auth = lucia({
  env: import.meta.env.DEV ? 'DEV' : 'PROD',

  middleware: hono(),

  adapter: betterSqlite3(sqliteDatabase, {
    user: 'users',
    session: 'user_sessions',
    key: 'user_keys',
  }),

  getUserAttributes: data => {
    return {
      username: data.username,
    };
  },

  experimental: {
    // debugMode: true,
  },
});
