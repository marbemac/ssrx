import { ssrx } from '@ssrx/vite/plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/react-router-records',

  plugins: [tsconfigPaths(), react(), ssrx()],

  server: {
    port: 3000,
  },
});
