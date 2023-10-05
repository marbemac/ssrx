import './root.css';

import { Link, Outlet, ScrollRestoration } from 'react-router-dom';

export function Component() {
  return (
    <>
      <h1 className="root-layout-title">Data Router Server Rendering Example</h1>

      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/lazy">Lazy</Link>
          </li>
          <li>
            <Link to="/redirect">Redirect to Home</Link>
          </li>
          <li>
            <Link to="/nothing-here">Nothing Here</Link>
          </li>
        </ul>
      </nav>

      <hr />

      <Outlet />

      <ScrollRestoration />
    </>
  );
}
