import { cache } from '@solidjs/router';

import { rand, sleep } from '~/utils.ts';

export const getHomeData = cache(async () => {
  console.log('call getHomeData()');

  await sleep(2000);

  return { data: `Home loader - random value ${rand()}.` };
}, 'home');

export const loader = async () => {
  void getHomeData();
};
