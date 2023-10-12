/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
  MutationOptions,
  QueryClient,
  QueryKey,
  QueryOptions,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import type { TRPCRequestOptions, TRPCUntypedClient } from '@trpc/client';
import type { AnyRouter, MaybePromise } from '@trpc/server';

/**
 * @internal
 */
export interface UseMutationOverride {
  onSuccess: (opts: {
    /**
     * Calls the original function that was defined in the query's `onSuccess` option
     */
    originalFn: () => MaybePromise<unknown>;
    queryClient: QueryClient;
    /**
     * Meta data passed in from the `useMutation()` hook
     */
    meta: Record<string, unknown>;
  }) => MaybePromise<unknown>;
}

/**
 * @internal
 */
export interface CreateTRPCQueryOptions<_TRouter extends AnyRouter> {
  client: TRPCUntypedClient<_TRouter>;
  queryClient: QueryClient;

  /**
   * Override behaviors of the built-in hooks
   */
  unstable_overrides?: {
    useMutation?: Partial<UseMutationOverride>;
  };
}

export interface TRPCUseQueryBaseOptions {
  /**
   * tRPC-related options
   */
  trpc?: TRPCRequestOptions;
}

type OmitUseless<T> = Omit<T, 'mutationKey' | 'queryKey' | 'queryFn'> & TRPCUseQueryBaseOptions;

export type CreateQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = OmitUseless<QueryOptions<TQueryFnData, TError, TData, TQueryKey>>;

export type CreateInfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = OmitUseless<UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryFnData, TQueryKey>>;

export type CreateMutationOptions<TInput, TError, TOutput, TContext = unknown> = OmitUseless<
  MutationOptions<TInput, TError, TOutput, TContext>
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseTRPCInfiniteQueryOptions<TPath, TInput, TOutput, TError>
  extends CreateInfiniteQueryOptions<TOutput, TError, TOutput, [TPath, TInput]> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UseTRPCQueryOptions<TPath, TInput, TOutput, TData, TError>
  extends CreateQueryOptions<TOutput, TError, TData, [TPath, TInput]> {}

export interface UseTRPCMutationOptions<TInput, TError, TOutput, TContext = unknown>
  extends CreateMutationOptions<TInput, TError, TOutput, TContext> {}

export type FixProcedureInput<T> = T extends void | undefined ? void | undefined : () => T;

export type TRPCFetchQueryOptions<TInput, TError, TOutput> = FetchQueryOptions<TInput, TError, TOutput> &
  TRPCRequestOptions;

export type TRPCFetchInfiniteQueryOptions<TInput, TError, TOutput> = FetchInfiniteQueryOptions<
  TInput,
  TError,
  TOutput
> &
  TRPCRequestOptions;
