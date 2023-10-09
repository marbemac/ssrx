import deteVitePlugin from '@dete/vite/plugin';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), solid({ ssr: true }), deteVitePlugin()],
});
