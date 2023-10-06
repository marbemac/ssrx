import './admin.members.css';

import { A, Outlet } from '@solidjs/router';
import { createResource, For, Show } from 'solid-js';

import { getMembers, sleep } from '~/utils.ts';

export async function loader() {
  await sleep();

  return {
    data: getMembers(),
  };
}

export default function Component() {
  const [data] = createResource(loader);

  return (
    <div class="members-layout">
      <div class="members-list">
        <div class="members-list__title">Members:</div>

        <Show when={data()?.data} fallback={<div>Loading...</div>}>
          <For each={data()?.data} fallback={<div>No members...</div>}>
            {member => (
              <A class="members-list__item" activeClass="active" href={String(member.id)}>
                {member.name}
              </A>
            )}
          </For>
        </Show>
      </div>

      <div class="members-content">
        <Outlet />
      </div>
    </div>
  );
}
