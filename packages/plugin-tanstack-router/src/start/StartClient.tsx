import type { AnyRouter } from '@tanstack/react-router';
import { RouterProvider } from '@tanstack/react-router';

import { afterHydrate } from './serialization.tsx';

let cleaned = false;

export function StartClient(props: { router: AnyRouter }) {
  if (!props.router.state.matches.length) {
    props.router.hydrate();
    afterHydrate({ router: props.router });
  }

  if (!cleaned) {
    cleaned = true;
    window.__TSR__?.cleanScripts();
  }

  return <RouterProvider router={props.router} />;
}
