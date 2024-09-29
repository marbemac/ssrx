import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { envOnlyMacros } from 'vite-env-only';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [envOnlyMacros(), tsconfigPaths(), remix()],

  resolve: {
    // Better simulates a production use case that is importing @ssrx packages from node_modules, which affects
    // vite behavior. This setting is NOT needed outside of the examples in this repo.
    preserveSymlinks: true,
  },

  ssr: {
    resolve: {
      conditions: ['workerd', 'worker', 'browser'],
      externalConditions: ['workerd', 'worker', 'browser'],
    },
  },
});
