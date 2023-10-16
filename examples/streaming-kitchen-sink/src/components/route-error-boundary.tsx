import { useRouteError } from 'react-router-dom';

export const RouteErrorBoundary = () => {
  const error = useRouteError();

  // @ts-expect-error ignore;
  const msg = error?.message ?? 'Unknown error';

  return (
    <section>
      <h1>Error Boundary</h1>
      <small>{msg}</small>
    </section>
  );
};
