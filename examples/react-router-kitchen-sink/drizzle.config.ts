import type { Config } from 'drizzle-kit';

export default {
  dialect: 'sqlite',
  schema: './server/db/schema/index.ts',
  out: './drizzle',
} satisfies Config;
