import { createResource } from 'solid-js';

import { Counter } from '~/components/Counter.tsx';
import { rand, sleep } from '~/utils.ts';

import styles from './_index.module.css';

export async function loader() {
  await sleep();

  return { data: `Home loader - random value ${rand()}.` };
}

export default function Component() {
  const [data] = createResource(loader);

  return (
    <div>
      <h2>Home</h2>

      <p>This home route simply loads some data (with a simulated delay) and displays it.</p>

      <p>
        Loader Data: <span class={styles['data']}>{data()?.data}</span>
      </p>

      <div>
        <Counter />
      </div>
    </div>
  );
}
