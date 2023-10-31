import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import { db } from './client.ts';

await migrate(db, { migrationsFolder: 'drizzle' });
