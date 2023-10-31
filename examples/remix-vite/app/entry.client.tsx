import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from './app.ts';

async function hydrate() {
  const renderApp = await clientHandler();

  startTransition(() => {
    hydrateRoot(document, <StrictMode>{renderApp()}</StrictMode>);
  });
}

void hydrate();
