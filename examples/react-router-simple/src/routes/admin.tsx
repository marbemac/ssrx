import './admin.css';

import { useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export function Component() {
  const linkClass = useCallback(({ isActive }: any) => `admin-nav__item ${isActive ? 'active' : undefined}`, []);

  return (
    <>
      <h2>Admin Area</h2>

      <nav className="admin-nav">
        <NavLink to="" className={linkClass} end>
          Home
        </NavLink>

        <NavLink to="members" className={linkClass}>
          Members
        </NavLink>
      </nav>

      <div className="admin-content">
        <Outlet />
      </div>
    </>
  );
}
