import type { LoaderFunctionArgs } from '@remix-run/server-runtime';

import { server } from '~api/index.ts';

export async function loader({ request }: LoaderFunctionArgs) {
  return server.fetch(request);
}

export async function action({ request }: LoaderFunctionArgs) {
  return server.fetch(request);
}
