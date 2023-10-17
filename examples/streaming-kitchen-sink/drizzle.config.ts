import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema/index.ts',
  out: './drizzle',
} satisfies Config;
