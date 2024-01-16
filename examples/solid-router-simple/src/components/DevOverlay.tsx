/**
 * Original: https://github.com/solidjs/solid-start/blob/main/packages/start/shared/dev-overlay/index.tsx
 *
 * Make it fancier as needed...
 */
import { createEffect, createSignal, ErrorBoundary, type JSX, onCleanup, Show } from 'solid-js';

import { HttpStatusCode } from './HttpStatusCode.tsx';

export interface DevOverlayProps {
  children?: JSX.Element;
}

export function DevOverlay(props: DevOverlayProps): JSX.Element {
  const [errors, setErrors] = createSignal<unknown[]>([]);

  // function resetError() {
  //   setErrors([]);
  //   resetErrorBoundaries();
  // }

  function pushError(error: unknown) {
    console.error(error);
    setErrors(current => [error, ...current]);
  }

  createEffect(() => {
    const onErrorEvent = (error: ErrorEvent) => {
      pushError(error.error);
    };

    // @ts-expect-error ignore
    window.addEventListener('error', onErrorEvent);

    onCleanup(() => {
      // @ts-expect-error ignore
      window.removeEventListener('error', onErrorEvent);
    });
  });

  return (
    <>
      <ErrorBoundary
        fallback={(error: unknown) => {
          pushError(error);
          return <HttpStatusCode code={500} />;
        }}
      >
        {props.children}
      </ErrorBoundary>

      <Show when={errors().length}>
        <HttpStatusCode code={500} />
        <div>An error occurred - check the console.</div>
        {/* <DevOverlayDialog errors={errors()} resetError={resetError} /> */}
      </Show>
    </>
  );
}
