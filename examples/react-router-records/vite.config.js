import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/react-router-records',
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'docs',
  },
});
