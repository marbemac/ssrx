import { renderAssets } from '@dete/solid';
import { assetsForRequest } from '@dete/vite/runtime';

import { App } from '~/app.tsx';

export async function render(req: Request) {
  const assets = await assetsForRequest(req.url);

  const app = () => <App url={req.url} head={renderAssets(assets)} />;

  return { app };
}
