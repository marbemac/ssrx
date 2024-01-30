import { createLazyRoute } from '@tanstack/react-router';

export const Route = createLazyRoute('/')({
  component: Component,
});

function Component() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}
