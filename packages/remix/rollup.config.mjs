import esbuild from 'rollup-plugin-esbuild';

const bundle = config => ({
  ...config,
  input: ['src/index.ts'],
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
