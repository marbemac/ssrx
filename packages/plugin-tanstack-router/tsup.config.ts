import { defineConfig } from 'tsup';

export default defineConfig({
  format: 'esm',
  sourcemap: true,
  clean: true,
  external: ['react', 'virtual:ssrx-manifest'],
  entry: ['src/index.ts', 'src/adapter.ts'],
});
