import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/')({
  meta: () => [
    {
      title: 'Admin',
    },
  ],
  component: AdminHome,
});

function AdminHome() {
  return <p>Admin home..</p>;
}
