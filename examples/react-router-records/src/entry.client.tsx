import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from './app.tsx';

async function hydrate() {
  const renderApp = await clientHandler();

  hydrateRoot(document, <StrictMode>{renderApp()}</StrictMode>);
}

void hydrate();
