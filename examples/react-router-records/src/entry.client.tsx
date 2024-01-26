import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from './app.tsx';
import { routes } from './routes.tsx';

async function hydrate() {
  const renderApp = await clientHandler({ renderProps: { routes, basename: '/react-router-records' } });

  hydrateRoot(document, <StrictMode>{renderApp()}</StrictMode>);
}

void hydrate();
