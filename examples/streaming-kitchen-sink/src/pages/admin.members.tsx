import './admin.members.css';

import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { ctx } from '~/app.tsx';

// export async function loader() {
//   await sleep();

//   return {
//     data: getMembers(),
//   };
// }

export function Component() {
  return (
    <div className="members-layout">
      <div className="members-list">
        <div className="members-list__title">Members:</div>

        <Suspense fallback={<div>Loading...</div>}>
          <MembersList />
        </Suspense>
      </div>

      <div className="members-content">
        <Outlet />
      </div>
    </div>
  );
}

function MembersList() {
  const { data } = ctx.trpc.membersList.useQuery();

  if (!data) return <div>No members...</div>;

  return (
    <>
      {data.map(member => (
        <NavLink
          key={member.id}
          className={({ isActive }) => `members-list__item ${isActive ? 'active' : ''}`}
          to={String(member.id)}
        >
          {member.name}
        </NavLink>
      ))}
    </>
  );
}
