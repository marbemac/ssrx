import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import deteVitePlugin from '@dete/vite/plugin';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3003,

    watch: {
      // During tests, we edit the files too fast and sometimes chokidar
      // misses change events, so enforce polling for consistency
      usePolling: true,
      interval: 100,
    },

    hmr: true,
  },

  ssr: {
    resolve: {
      conditions: ['worker', 'browser'],
      externalConditions: ['worker', 'browser'],
    },
  },

  resolve: {
    conditions: ['worker', 'browser'],
  },

  plugins: [tsconfigPaths(), react(), deteVitePlugin()],
});
