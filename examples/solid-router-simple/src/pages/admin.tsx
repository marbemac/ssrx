import './admin.css';

import { A, Outlet } from '@solidjs/router';

export default function Component() {
  return (
    <>
      <h2>Admin Area</h2>

      <nav class="admin-nav">
        <A href="" class="admin-nav__item" activeClass="active" end>
          Home
        </A>

        <A href="members" class="admin-nav__item" activeClass="active">
          Members
        </A>
      </nav>

      <div class="admin-content">
        <Outlet />
      </div>
    </>
  );
}
