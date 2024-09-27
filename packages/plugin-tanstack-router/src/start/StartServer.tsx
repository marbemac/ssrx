import { Context } from '@tanstack/react-cross-context';
import type { AnyRouter } from '@tanstack/react-router';
import { RouterProvider } from '@tanstack/react-router';
import jsesc from 'jsesc';
import * as React from 'react';

import { AfterEachMatch } from './serialization.tsx';

export function StartServer<TRouter extends AnyRouter>(props: { router: TRouter }) {
  props.router.AfterEachMatch = AfterEachMatch;
  props.router.serializer = value =>
    jsesc(value, {
      isScriptContext: true,
      wrap: true,
      json: true,
    });

  const hydrationContext = Context.get('TanStackRouterHydrationContext', {});

  const hydrationCtxValue = React.useMemo(
    () => ({
      router: props.router.dehydrate(),
      payload: props.router.options.dehydrate?.(),
    }),
    [props.router],
  );

  return (
    <hydrationContext.Provider value={hydrationCtxValue}>
      <RouterProvider router={props.router} />
    </hydrationContext.Provider>
  );
}
