import { RouterProvider } from '@tanstack/react-router';
// import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { createRouter } from '~/router.tsx';

void render();

async function render() {
  // Create a new router instance
  const router = createRouter();

  if (!router.state.lastUpdated) {
    void router.hydrate();
  }

  hydrateRoot(document, <RouterProvider router={router} />);
}
