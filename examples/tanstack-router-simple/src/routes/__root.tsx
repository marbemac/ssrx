import './__root.css';

import type { ErrorComponentProps } from '@tanstack/react-router';
import { createRootRouteWithContext, ErrorComponent, Link, Outlet, ScrollRestoration } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Meta } from '@tanstack/start/client';

import type { RootRouterContext } from '~/router.ts';

export const Route = createRootRouteWithContext<RootRouterContext>()({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <Meta />
      </head>

      <body>
        <div className="root-nav">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>

          <Link to="/lazy-component" className="[&.active]:font-bold">
            Lazy Component
          </Link>

          <Link to="/redirect" className="[&.active]:font-bold">
            Redirect
          </Link>

          <Link to="/admin" className="[&.active]:font-bold">
            Admin
          </Link>
        </div>

        <hr />

        <div className="root-content">
          <Outlet />
        </div>

        <ScrollRestoration />

        <TanStackRouterDevtools position="bottom-right" />
      </body>
    </html>
  );
}

function RootErrorComponent({ error }: ErrorComponentProps) {
  if (error instanceof Error) {
    return <div>{error.message}</div>;
  }

  return <ErrorComponent error={error} />;
}
