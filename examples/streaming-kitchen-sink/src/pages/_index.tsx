import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import { ctx } from '~/app.tsx';
import { rand, sleep } from '~/utils.ts';

const exampleQuery = () => ({
  queryKey: ['home query'],
  meta: { deferStream: true },
  queryFn: async () => {
    await sleep();

    return { data: `Home loader - random value ${rand()}.` };
  },
});

export async function loader() {
  void ctx.queryClient.prefetchQuery(exampleQuery());

  return null;
}

export function Component() {
  ctx.useHead({ title: 'Home' });

  return (
    <div>
      <h2>Home</h2>

      <p>This home route simply loads some data (with a simulated delay) and displays it.</p>

      <Suspense fallback={<div>Loading...</div>}>
        <Child />
      </Suspense>
    </div>
  );
}

function Child() {
  const query = useQuery(exampleQuery());

  if (!query.data) return null;

  return <p>Loader Data: {query.data.data}</p>;
}
