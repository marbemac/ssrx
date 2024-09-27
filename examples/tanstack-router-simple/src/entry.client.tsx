import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from '~/app.tsx';
import { createRouter } from '~/router.tsx';

void hydrate();

async function hydrate() {
  const renderApp = await clientHandler({
    renderProps: { router: createRouter() },
  });

  hydrateRoot(document, renderApp());
}
