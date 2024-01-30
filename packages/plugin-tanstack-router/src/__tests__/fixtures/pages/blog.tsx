import { createLazyRoute } from '@tanstack/react-router';

export const Route = createLazyRoute('blog')({
  component: BlogNamed,
});

function BlogNamed() {
  return (
    <div>
      <h2>Blog Layout</h2>
    </div>
  );
}
