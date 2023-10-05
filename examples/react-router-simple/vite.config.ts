import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import deteVitePlugin from '@dete/vite/plugin';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3003,
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
