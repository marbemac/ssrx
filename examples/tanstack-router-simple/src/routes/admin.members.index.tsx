import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/members/')({
  component: AdminMembersHome,
});

function AdminMembersHome() {
  return <div>Click a member to the left..</div>;
}
