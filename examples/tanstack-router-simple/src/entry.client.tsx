import { StartClient } from '@tanstack/start';
import { hydrateRoot } from 'react-dom/client';

import { createRouter } from '~/router.tsx';

void render();

async function render() {
  const router = createRouter();

  hydrateRoot(document, <StartClient router={router} />);
}
