import './admin.css';

import { A } from '@solidjs/router';
import type { ParentProps } from 'solid-js';

export default function Component(props: ParentProps) {
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

      <div class="admin-content">{props.children}</div>
    </>
  );
}
