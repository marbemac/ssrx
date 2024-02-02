import esbuild from 'rollup-plugin-esbuild';

const bundle = config => ({
  ...config,
  input: ['src/client/index.ts', 'src/server/index.ts', 'src/client/assets.ts', 'src/server/assets.ts'],
  external: id => !/^[./]/.test(id),
});

export default [
  bundle({
    plugins: [esbuild()],
    output: [
      {
        dir: 'dist',
        format: 'es',
        exports: 'named',
        preserveModules: true, // Keep directory structure and files
      },
    ],
  }),
];
