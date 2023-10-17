import { superSsr } from '@super-ssr/vite/plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    superSsr({
      serverFile: 'server/index.ts',
      clientEntry: 'client/entry.client.tsx',
      routesFile: 'client/routes.tsx',
    }),
  ],
});
