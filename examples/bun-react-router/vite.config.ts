import { ssrx } from '@ssrx/vite/plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react(), ssrx()],

  resolve: {
    // Better simulates a production use case that is importing @ssrx packages from node_modules, which affects
    // vite behavior. This setting is NOT needed outside of the examples in this repo.
    preserveSymlinks: true,
  },

  ssr: {
    target: 'webworker',
    resolve: {
      conditions: ['bun', 'worker', 'edge'],
      externalConditions: ['bun', 'worker', 'edge'],
    },
  },
});
