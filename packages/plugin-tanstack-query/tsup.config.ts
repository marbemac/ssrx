import { defineConfig } from 'tsup';

export default defineConfig({
  dts: true,
  format: 'esm',
  sourcemap: true,
  clean: true,
  external: ['react'],
  entry: ['src/index.ts'],
  outExtension: () => ({
    // Our output includes preserved jsx, so we need to rename the output to .jsx for downstream tooling to work
    js: `.jsx`,
  }),
  esbuildOptions: options => {
    options.jsx = 'preserve';
  },
});
