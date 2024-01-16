import { createAsync } from '@solidjs/router';
import { Suspense } from 'solid-js';

import { getHomeData } from './loader.ts';

export default function Component() {
  const data = createAsync(() => getHomeData());

  return (
    <div>
      <h2>Home</h2>

      <p>This home route simply loads some data (with a simulated delay) and displays it.</p>

      <Suspense fallback="Loading...">
        <p>Loader Data: {data()?.data}</p>
      </Suspense>
    </div>
  );
}
