import { defineConfig } from 'tsup';

export default defineConfig({
  dts: true,
  format: 'esm',
  sourcemap: true,
  clean: true,
  external: ['react'],
  entry: ['src/client/index.ts', 'src/server/index.ts'],
});
