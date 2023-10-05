import { ReactRouterAdapter } from '@dete/adapter-react-router';
import deteVitePlugin from '@dete/vite/plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  ssr: {
    target: 'webworker',
    resolve: {
      conditions: ['worker', 'browser'],
      externalConditions: ['worker', 'browser'],
    },
  },

  resolve: {
    conditions: ['worker', 'browser'],
  },

  plugins: [
    tsconfigPaths(),
    react(),
    deteVitePlugin({
      routerAdapter: ReactRouterAdapter(),
    }),
  ],

  build: {
    minify: false,
  },
});
