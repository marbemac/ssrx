// @ts-expect-error ignore
import { solidPlugin } from 'esbuild-plugin-solid';
import { defineConfig } from 'tsup';

export default defineConfig({
  format: 'esm',
  sourcemap: true,
  clean: true,
  entry: ['src/client/index.ts', 'src/server/index.ts'],
  esbuildPlugins: [
    solidPlugin({
      solid: {
        generate: 'ssr',
      },
    }),
  ],
});
