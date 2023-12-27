import type { ServerRuntimeMetaFunction } from '@remix-run/server-runtime';

export const meta: ServerRuntimeMetaFunction = () => {
  return [{ title: 'Remix Vite' }];
};

export default function Index() {
  return (
    <div className="p-20 flex flex-col gap-5">
      <h1 className="text-3xl font-medium mb-5">Remix Vite Example</h1>

      <p>
        This example leverages Remix's new Vite plugin. It makes it simple to use `@tanstack/query` + `trpc` in an
        isomorphic way, alongside all of the great functionality Remix already offers. Note, there is some simulated
        latency throughout the example to help see loading screens etc.
      </p>

      <p>
        Click the login button in the top right to login with preset credentials. Then, click the articles link in the
        top left.
      </p>
    </div>
  );
}
