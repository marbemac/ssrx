import { defineConfig } from 'tsup';

export default defineConfig({
  dts: true,
  format: 'esm',
  sourcemap: true,
  clean: true,
  external: ['react'],
  noExternal: ['@trpc/server', '@trpc/client'],
  entry: ['src/index.ts'],
});
