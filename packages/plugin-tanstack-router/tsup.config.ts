import { defineConfig } from 'tsup';

export default defineConfig({
  format: 'esm',
  sourcemap: true,
  clean: true,
  external: ['react'],
  entry: ['src/index.ts', 'src/adapter.ts'],
});
