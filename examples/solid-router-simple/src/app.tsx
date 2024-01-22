import './app.css';

import { Router } from '@solidjs/router';
import { useRoutes } from '@solidjs/router';
import type { JSX } from 'solid-js';
import { HydrationScript, Suspense } from 'solid-js/web';

import { routes } from '~/routes.tsx';

type AppProps = {
  url?: string;
  head?: JSX.Element;
};

export function App({ url, head }: AppProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {head}

        <HydrationScript />
      </head>

      <body>
        <Router url={url}>
          <AppContent />
        </Router>
      </body>
    </html>
  );
}

export function AppContent() {
  const Routes = useRoutes(routes);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes />
    </Suspense>
  );
}
