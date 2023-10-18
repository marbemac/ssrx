import { expect, it } from 'vitest';

import { transformPath } from '../transform-path.ts';
it.each`
  input                               | output
  ${undefined}                        | ${undefined}
  ${'/'}                              | ${''}
  ${'$helloWorld'}                    | ${':helloWorld'}
  ${'/users/$helloWorld'}             | ${'users/:helloWorld'}
  ${'/users/$userId/admin/$adminId/'} | ${'users/:userId/admin/:adminId'}
  ${'/users/$'}                       | ${'users/**'}
  ${'$'}                              | ${'**'}
  ${'*'}                              | ${'**'}
  ${'users/*/'}                       | ${'users/**'}
`('transformPath($input) -> $output', ({ input, output }) => {
  expect(transformPath(input)).toBe(output);
});
