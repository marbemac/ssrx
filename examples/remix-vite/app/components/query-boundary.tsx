import type { UseQueryResult } from '@tanstack/react-query';
import { type ReactNode, Suspense, useCallback } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

export type QueryBoundaryProps<T = unknown> = {
  query: () => UseQueryResult<T, unknown>;

  /**
   * Triggered when the data is initially loading.
   */
  loadingFallback?: ReactNode;

  /**
   * Triggered when fetching is complete, but the returned data was falsey.
   */
  notFoundFallback?: ReactNode;

  /**
   * Triggered when fetching is complete, and the returned data is not falsey.
   */
  children: (data: NonNullable<T>) => ReactNode;
};

/**
 * Convenience wrapper that handles suspense and errors for queries. Makes the results of query.data available to
 * children (as a render prop) in a type-safe way.
 */
export function QueryBoundary<T>({ notFoundFallback, loadingFallback, query, children }: QueryBoundaryProps<T>) {
  const fallbackRender = useCallback(
    ({ error }: FallbackProps) => {
      // @TODO.. brittle. First condition is in SSR, second is on client
      const notFound = error.data?.code === 'NOT_FOUND' || error.message === 'Not found';
      if (notFound) {
        return notFoundFallback ? notFoundFallback : <div>Not found</div>;
      }

      const badRequest = error.data?.code === 'BAD_REQUEST';
      if (badRequest) {
        const issues: { message: string; path: string[] }[] = error.data?.issues || [];
        return (
          <div>
            <div>Bad request</div>
            <ul>
              {issues.map(({ message, path }, i) => (
                <li key={i}>
                  {path.join('.')} - {message}
                </li>
              ))}
            </ul>
          </div>
        );
      }

      if (import.meta.env.DEV) {
        console.error('QueryBoundary error', { error, query });
      }

      return <div>An error occurred while making the query (TODO, improve this).</div>;
    },
    [notFoundFallback, query],
  );

  return (
    <ErrorBoundary fallbackRender={fallbackRender} resetKeys={[query]}>
      <Suspense fallback={loadingFallback}>
        <Query
          query={query}
          notFoundFallback={notFoundFallback}
          loadingFallback={loadingFallback}
          children={children}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

type QueryProps<T = unknown> = Pick<
  QueryBoundaryProps<T>,
  'query' | 'notFoundFallback' | 'children' | 'loadingFallback'
>;

function Query<T = unknown>(props: QueryProps<T>) {
  const query = props.query();

  let elem;
  if (query.isError) {
    elem = (
      <Error
        error={query.error}
        refetch={() => {
          void query.refetch();
        }}
      />
    );
  } else if (!query.isLoading && !query.data) {
    elem = props.notFoundFallback ?? <div>not found</div>;
  }

  return elem ? elem : query.data ? props.children(query.data) : props.loadingFallback;
}

type ErrorProps = {
  error: unknown;
  refetch: () => void;
};

const Error = (props: ErrorProps) => {
  console.error('Error in QueryBoundary', props.error);

  // @ts-expect-error ignore
  const msg = props.error?.message;

  return (
    <div>
      <div className="text-red-800">{msg}</div>
      <button
        onClick={() => {
          void props.refetch();
        }}
      >
        Retry
      </button>
    </div>
  );
};
