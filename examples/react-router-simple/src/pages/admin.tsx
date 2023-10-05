import './admin.css';

import { Outlet } from 'react-router-dom';

export function Component() {
  return (
    <>
      <h1 className="admin-layout-title">Admin Layout Title</h1>

      <Outlet />
    </>
  );
}
