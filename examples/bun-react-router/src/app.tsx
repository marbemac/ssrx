import './app.css';

type AppProps = {
  children: React.ReactNode;
  headTags?: React.ReactNode;
  bodyTags?: React.ReactNode;
};

export function App({ children, headTags, bodyTags }: AppProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {headTags}
      </head>

      <body>
        {children}
        {bodyTags}
      </body>
    </html>
  );
}
