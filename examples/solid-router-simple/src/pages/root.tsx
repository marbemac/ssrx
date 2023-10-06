import './root.css';

import { A, Outlet } from '@solidjs/router';

export function Component() {
  return (
    <>
      <nav class="root-nav">
        <A href="/" class="root-nav__item" activeClass="active" end>
          Home
        </A>

        <A href="/lazy-component" class="root-nav__item" activeClass="active">
          Lazy Component
        </A>

        <A href="/admin" class="root-nav__item" activeClass="active">
          Admin
        </A>
      </nav>

      <div class="root-content">
        <Outlet />
      </div>
    </>
  );
}
