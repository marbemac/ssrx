import './app.css';

type AppProps = {
  children: React.ReactNode;
  head?: React.ReactNode;
};

export function App({ children, head }: AppProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {head}
      </head>

      <body>{children}</body>
    </html>
  );
}
