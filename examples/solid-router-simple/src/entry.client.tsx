import { hydrate } from 'solid-js/web';

import { App } from '~/app.tsx';

hydrate(
  () => <App />,
  // @ts-expect-error ignore
  document,
);
