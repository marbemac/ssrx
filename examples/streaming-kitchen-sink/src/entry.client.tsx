import './app.css';

import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from './app.tsx';

async function hydrate() {
  const app = await clientHandler();

  startTransition(() => {
    hydrateRoot(
      // @ts-expect-error ignore
      document,
      <StrictMode>{app}</StrictMode>,
    );
  });
}

void hydrate();
