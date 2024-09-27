import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { envOnlyMacros } from 'vite-env-only';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [envOnlyMacros(), tsconfigPaths(), remix()],

  ssr: {
    resolve: {
      conditions: ['workerd', 'worker', 'browser'],
      externalConditions: ['workerd', 'worker', 'browser'],
    },
  },
});
