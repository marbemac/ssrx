import { defineConfig } from 'tsup';

export default defineConfig({
  dts: true,
  format: 'esm',
  sourcemap: true,
  clean: true,
  entry: ['src/plugin-entry.ts', 'src/runtime/index.ts'],
  external: ['virtual:ssrx-manifest'],
});
