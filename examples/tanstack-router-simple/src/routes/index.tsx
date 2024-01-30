import { createFileRoute } from '@tanstack/react-router';

import { rand, sleep } from '~/utils.ts';

export const Route = createFileRoute('/')({
  loader: async () => {
    await sleep();

    return { data: `Home loader - random value ${rand()}.` };
  },
  component: IndexComponent,
  meta: () => [
    {
      title: 'Home',
    },
  ],
});

function IndexComponent() {
  const data = Route.useLoaderData();

  return (
    <div>
      <h2>Home</h2>

      <p>This home route simply loads some data (with a simulated delay) and displays it.</p>

      <p>Loader Data: {data.data}</p>
    </div>
  );
}
