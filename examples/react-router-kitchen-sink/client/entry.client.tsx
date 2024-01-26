import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from '~app';

import { routes } from './routes.tsx';

async function hydrate() {
  const renderApp = await clientHandler({
    renderProps: { routes },
  });

  startTransition(() => {
    hydrateRoot(document, <StrictMode>{renderApp()}</StrictMode>);
  });
}

void hydrate();
