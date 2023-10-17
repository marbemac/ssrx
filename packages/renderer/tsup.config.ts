import { defineConfig } from 'tsup';

export default defineConfig({
  dts: true,
  format: 'esm',
  sourcemap: true,
  clean: true,
  entry: ['src/client/index.ts', 'src/server/index.ts'],
});
