import './admin.members.css';

import { NavLink, Outlet, useLoaderData } from 'react-router-dom';

import { getMembers, sleep } from '~/utils.ts';

export async function loader() {
  await sleep();

  return {
    data: getMembers(),
  };
}

export function Component() {
  const { data } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <div className="members-layout">
      <div className="members-list">
        <div className="members-list__title">Members:</div>

        {data.map(member => (
          <NavLink
            key={member.id}
            className={({ isActive }) => `members-list__item ${isActive ? 'active' : ''}`}
            to={String(member.id)}
          >
            {member.name}
          </NavLink>
        ))}
      </div>

      <div className="members-content">
        <Outlet />
      </div>
    </div>
  );
}
