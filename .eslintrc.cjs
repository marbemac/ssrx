const path = require('path');

/** @type {import('eslint/lib/shared/types').ConfigData} */
const config = {
  root: true,
  ignorePatterns: [
    '.github',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.yalc',
    '.yarn',
    '.cache',
    '.storybook/*',
    'build',
    'dist',
    'node_modules',
    '*.mjs',
    '*.js',
  ],

  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],

  env: {
    es6: true,
  },

  rules: {
    'sort-imports': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/extensions': ['error', 'ignorePackages'],
    'no-return-await': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};

module.exports = config;
