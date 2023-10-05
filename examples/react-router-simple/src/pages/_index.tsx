import './_index.css';

import { useLoaderData } from 'react-router-dom';

import { rand, sleep } from '~/utils.ts';

export async function loader() {
  await sleep();
  return { data: `Home loader - random value ${rand()}` };
}

export function Component() {
  const data = useLoaderData() as any;

  return (
    <div>
      <h2 className="home-title">Home</h2>
      <p>Loader Data: {data.data}</p>
    </div>
  );
}
