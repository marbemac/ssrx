import { useLoaderData } from 'react-router-dom';

import { getMember, sleep } from '~/utils.ts';

export async function loader({ params: { memberId } }: any) {
  await sleep();

  return {
    data: getMember(Number(memberId)),
  };
}

export function Component() {
  const { data } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  if (!data) {
    return <div>member not found</div>;
  }

  return <div>Member: {data.name}</div>;
}
