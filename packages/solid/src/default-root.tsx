import { Hydration, HydrationScript, NoHydration } from 'solid-js/web';

type RootProps = {
  children: any;
};

export const RootLayout = ({ children }: RootProps) => {
  return (
    <NoHydration>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <HydrationScript />
        </head>

        <body>
          <Hydration>{children}</Hydration>
        </body>
      </html>
    </NoHydration>
  );
};
