import { defineConfig } from 'tsup';

export default defineConfig({
  format: 'esm',
  sourcemap: true,
  clean: true,
  entry: ['src/client/index.ts', 'src/server/index.ts'],
  outExtension: () => ({
    // Our output includes preserved jsx, so we need to rename the output to .jsx for downstream tooling to work
    js: `.jsx`,
  }),
  esbuildOptions: options => {
    options.jsx = 'preserve';
  },
});
