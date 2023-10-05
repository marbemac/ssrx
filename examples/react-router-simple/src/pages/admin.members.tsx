import './admin.members.css';

import { Outlet } from 'react-router-dom';

export function Component() {
  return (
    <div>
      <h2 className="admin-members-title">Admin members layout</h2>

      <Outlet />
    </div>
  );
}
