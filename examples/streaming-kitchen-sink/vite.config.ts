import { ssrx } from '@ssrx/vite/plugin';
import react from '@vitejs/plugin-react';
import analyze from 'rollup-plugin-analyzer';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    ssrx({
      serverFile: 'server/index.ts',
      clientEntry: 'client/entry.client.tsx',
      routesFile: 'client/routes.tsx',
    }),
  ],

  build: {
    rollupOptions: {
      plugins: [
        // @ts-expect-error ignore
        analyze({
          summaryOnly: true,
          limit: 15,
        }),
      ],
    },
  },
});
