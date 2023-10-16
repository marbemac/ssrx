import { ctx } from '~/app.tsx';

export function Component() {
  ctx.useHead({ title: 'Home' });

  return (
    <div className="p-20 flex flex-col gap-5">
      <h1 className="text-3xl font-medium mb-5">Streaming Kitchen Sink Example</h1>

      <p>
        This example shows one way to combine vite, react-query, and streaming patterns. Note, there is some simulated
        latency throughout the example to help see loading screens etc.
      </p>

      <p>
        Click the login button in the top right to login with preset credentials. Then, click the articles link in the
        top left.
      </p>
    </div>
  );
}
