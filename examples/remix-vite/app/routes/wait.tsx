import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import { sleep } from '~/utils.ts';

export default function Wait() {
  return (
    <div className="p-20">
      <div className="mb-10">
        This example is copied from the @tanstack/query{' '}
        <a
          href="https://github.com/TanStack/query/tree/beta/examples/react/nextjs-suspense-streaming"
          target="_blank"
          rel="noreferrer"
        >
          nextjs-suspense-streaming example
        </a>
        . It demonstrates suspended query streaming that starts on the server and continues on the client.
      </div>

      <Suspense fallback={<div>waiting 100....</div>}>
        <MyComponent wait={100} />
      </Suspense>
      <Suspense fallback={<div>waiting 200....</div>}>
        <MyComponent wait={200} />
      </Suspense>
      <Suspense fallback={<div>waiting 300....</div>}>
        <MyComponent wait={300} defer />
      </Suspense>
      <Suspense fallback={<div>waiting 400....</div>}>
        <MyComponent wait={400} />
      </Suspense>
      <Suspense fallback={<div>waiting 500....</div>}>
        <MyComponent wait={500} />
      </Suspense>
      <Suspense fallback={<div>waiting 600....</div>}>
        <MyComponent wait={600} />
      </Suspense>
      <Suspense fallback={<div>waiting 700....</div>}>
        <MyComponent wait={700} />
      </Suspense>

      <fieldset>
        <legend>
          combined <code>Suspense</code>-container
        </legend>
        <Suspense
          fallback={
            <>
              <div>waiting 800....</div>
              <div>waiting 900....</div>
              <div>waiting 1000....</div>
            </>
          }
        >
          <MyComponent wait={800} />
          <MyComponent wait={900} />
          <MyComponent wait={1000} />
        </Suspense>
      </fieldset>
    </div>
  );
}

function useWaitQuery(props: { wait: number; defer?: boolean }) {
  const query = useQuery({
    queryKey: ['wait', props.wait],
    meta: { deferStream: props.defer },
    queryFn: async () => {
      console.log('useWaitQuery()', props);

      await sleep(props.wait);

      return `waited ${props.wait}ms`;
    },
  });

  return [query.data!, query] as const;
}

function MyComponent(props: { wait: number; defer?: boolean }) {
  const [data] = useWaitQuery(props);

  return <div>result: {data}</div>;
}
