import './admin.members.css';

import { A } from '@solidjs/router';
import type { ParentProps } from 'solid-js';
import { createResource, For, Suspense } from 'solid-js';

import { getMembers, sleep } from '~/utils.ts';

export async function loader() {
  await sleep();

  return {
    data: getMembers(),
  };
}

export default function Component(props: ParentProps) {
  const [data] = createResource(loader);

  return (
    <div class="members-layout">
      <div class="members-list">
        <div class="members-list__title">Members:</div>

        <Suspense fallback="Loading...">
          <For each={data()?.data} fallback={<div>No members...</div>}>
            {member => (
              <A class="members-list__item" activeClass="active" href={String(member.id)}>
                {member.name}
              </A>
            )}
          </For>
        </Suspense>
      </div>

      <div class="members-content">{props.children}</div>
    </div>
  );
}
