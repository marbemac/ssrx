import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { clientHandler } from '~app';

async function hydrate() {
  const renderApp = await clientHandler();

  startTransition(() => {
    hydrateRoot(
      // @ts-expect-error ignore
      document,
      <StrictMode>{renderApp()}</StrictMode>,
    );
  });
}

void hydrate();
