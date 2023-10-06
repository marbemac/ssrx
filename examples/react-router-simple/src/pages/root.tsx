import './root.css';

import { useCallback } from 'react';
import { NavLink, Outlet, ScrollRestoration } from 'react-router-dom';

export function Component() {
  const linkClass = useCallback(({ isActive }: any) => `root-nav__item ${isActive ? 'active' : undefined}`, []);

  return (
    <>
      <nav className="root-nav">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>

        <NavLink to="/lazy-component" className={linkClass}>
          Lazy Component
        </NavLink>

        <NavLink to="/admin" className={linkClass}>
          Admin
        </NavLink>
      </nav>

      <div className="root-content">
        <Outlet />
      </div>

      <ScrollRestoration />
    </>
  );
}
