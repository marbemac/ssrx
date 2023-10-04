import "./root.css";

type RootProps = {
  children: React.ReactNode;
  headHtml?: string;
};

export function Root({ children, headHtml }: RootProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body>{children}</body>
    </html>
  );
}
