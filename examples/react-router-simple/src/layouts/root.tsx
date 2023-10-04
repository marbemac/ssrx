import { Link, Outlet, ScrollRestoration } from 'react-router-dom';
import './root.css';

export const RootLayout = () => {
  return (
    <>
      <h1 className="layout-title">Data Router Server Rendering Example</h1>

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
};
