import './app.css';

import { MetaProvider, Title } from '@solidjs/meta';
import { A, Router } from '@solidjs/router';
import type { JSX } from 'solid-js';
import { HydrationScript, NoHydration, Suspense } from 'solid-js/web';

import { ErrorBoundary } from '~/components/ErrorBoundary.tsx';
import { routes } from '~/routes.tsx';

type AppProps = {
  url?: string;
  headTags?: () => JSX.Element;
  bodyTags?: () => JSX.Element;
};

export function App({ url, headTags, bodyTags }: AppProps) {
  console.log('App.render');

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <NoHydration>
          {headTags?.()}

          <HydrationScript />
        </NoHydration>
      </head>

      <body>
        <ErrorBoundary>
          <Router
            url={url}
            root={props => (
              <MetaProvider>
                <Title>Solid Router Simple Example</Title>

                <nav class="root-nav">
                  <A href="/" class="root-nav__item" activeClass="active" end>
                    Home
                  </A>

                  <A href="/lazy-component" class="root-nav__item" activeClass="active">
                    Lazy Component
                  </A>

                  <A href="/admin" class="root-nav__item" activeClass="active">
                    Admin
                  </A>
                </nav>

                <div class="root-content">
                  <Suspense>{props.children}</Suspense>
                </div>
              </MetaProvider>
            )}
          >
            {routes}
          </Router>
        </ErrorBoundary>

        <NoHydration>{bodyTags?.()}</NoHydration>
      </body>
    </html>
  );
}
