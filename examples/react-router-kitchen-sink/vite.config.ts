import { ssrx } from '@ssrx/vite/plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    ssrx({
      serverFile: 'src/server.tsx',
      clientEntry: 'src/entry.client.tsx',
      routesFile: 'src/routes.tsx',
    }),
  ],
});
