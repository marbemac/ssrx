import type { JSXElement } from 'solid-js';
import { HydrationScript, ssr } from 'solid-js/web';

type RootProps = {
  children: JSXElement;
};

const docType = ssr('<!DOCTYPE html>');

export const RootLayout = (props: RootProps) => {
  return (
    <>
      {docType}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <script type="module" defer src="/@vite/client" $ServerOnly />
          <script type="module" async src="/client/entry.client.tsx" $ServerOnly />

          <HydrationScript />
        </head>

        <body>{props.children}</body>
      </html>
    </>
  );
};
