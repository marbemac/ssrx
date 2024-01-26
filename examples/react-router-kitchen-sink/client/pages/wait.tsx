import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import { Counter } from '~client/components/counter.tsx';
import { sleep } from '~client/utils.ts';

export function Component() {
  return (
    <div className="p-20 gap-8 flex flex-col">
      <div>
        This example is copied from the @tanstack/query{' '}
        <a href="https://github.com/TanStack/query/tree/main/examples/react/nextjs-suspense-streaming" target="_blank">
          nextjs-suspense-streaming example
        </a>
        . It demonstrates suspended query streaming that starts on the server and continues on the client.
      </div>

      <div>
        <Counter />
      </div>

      <div>
        <Suspense fallback={<div>waiting 100....</div>}>
          <MyComponent wait={100} />
        </Suspense>
        <Suspense fallback={<div>waiting 200....</div>}>
          <MyComponent wait={200} />
        </Suspense>
        <Suspense fallback={<div>waiting 300....</div>}>
          <MyComponent wait={300} />
        </Suspense>
        <Suspense fallback={<div>waiting 400....</div>}>
          <MyComponent wait={400} />
        </Suspense>
        <Suspense fallback={<div>waiting 500....</div>}>
          <MyComponent wait={500} deferStream />
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
                <div>waiting 3000....</div>
              </>
            }
          >
            <MyComponent wait={800} />
            <MyComponent wait={900} />
            <MyComponent wait={3000} />
          </Suspense>
        </fieldset>
      </div>
    </div>
  );
}

function useWaitQuery(props: { wait: number; deferStream?: boolean; simulateErrorOnServer?: boolean }) {
  const query = useQuery({
    queryKey: ['wait', props.wait, props.simulateErrorOnServer],
    meta: { deferStream: props.deferStream },
    queryFn: async () => {
      console.log('useWaitQuery()', props);

      if (typeof window === 'undefined' && props.simulateErrorOnServer) {
        throw new Error('simulated error on server');
      }

      await sleep(props.wait);

      return `waited ${props.wait}ms`;
    },
  });

  return [query.data as string, query] as const;
}

function MyComponent(props: { wait: number; deferStream?: boolean; simulateErrorOnServer?: boolean }) {
  const [data] = useWaitQuery(props);

  return (
    <div>
      result: {data} {props.simulateErrorOnServer ? '(simulated error on server)' : ''}
    </div>
  );
}
