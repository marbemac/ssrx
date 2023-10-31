// @ts-expect-error ignore
import { solidPlugin } from 'esbuild-plugin-solid';
import { defineConfig } from 'tsup';

export default defineConfig({
  format: 'esm',
  sourcemap: true,
  clean: true,
  entry: ['src/index.ts'],
  external: ['virtual:ssrx-manifest'],
  esbuildPlugins: [
    solidPlugin({
      solid: {
        generate: 'ssr',
      },
    }),
  ],
});
