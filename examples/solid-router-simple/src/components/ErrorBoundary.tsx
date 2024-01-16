import type { ParentProps } from 'solid-js';
import { ErrorBoundary as DefaultErrorBoundary } from 'solid-js';

import { DevOverlay } from './DevOverlay.tsx';
import { HttpStatusCode } from './HttpStatusCode.tsx';

export function ErrorBoundary(props: ParentProps) {
  if (import.meta.env.DEV) {
    return <DevOverlay>{props.children}</DevOverlay>;
  }

  return <DefaultErrorBoundary fallback={<HttpStatusCode code={500} />}>{props.children}</DefaultErrorBoundary>;
}
