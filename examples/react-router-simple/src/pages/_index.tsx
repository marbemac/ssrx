import { useLoaderData } from 'react-router-dom';

import { rand, sleep } from '~/utils.ts';

export async function loader() {
  await sleep();

  return { data: `Home loader - random value ${rand()}.` };
}

export function Component() {
  const data = useLoaderData() as any;

  return (
    <div>
      <h2>Home</h2>

      <p>This home route simply loads some data (with a simulated delay) and displays it.</p>

      <p>Loader Data: {data.data}</p>
    </div>
  );
}
