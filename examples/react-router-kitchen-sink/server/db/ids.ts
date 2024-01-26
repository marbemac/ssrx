import { init } from '@paralleldrive/cuid2';

// https://github.com/paralleldrive/cuid2#parameterized-length
// sqrt(36^(12-1)*26)
// With length of 12, 50% chance of collision after 1,849,909,268 IDs
export const createDbId = init({ length: 12 });
