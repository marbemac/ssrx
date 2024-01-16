import { useParams } from '@solidjs/router';
import { createResource, Suspense } from 'solid-js';

import { getMember, sleep } from '~/utils.ts';

export async function loader(memberId: string) {
  await sleep();

  return {
    data: getMember(Number(memberId)),
  };
}

export default function Component() {
  const params = useParams<{ memberId: string }>();

  const [data] = createResource(() => params.memberId, loader);

  return (
    <Suspense fallback="Loading...">
      <div>Member: {data()?.data?.name}</div>
    </Suspense>
  );
}
