/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  InfiniteData,
  InvalidateOptions,
  InvalidateQueryFilters,
  SetDataOptions,
  Updater,
} from '@tanstack/react-query';
import type { TRPCClientErrorLike } from '@trpc/client';
import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRouter,
  AnySubscriptionProcedure,
  Filter,
  inferProcedureInput,
  inferProcedureOutput,
  ProcedureRouterRecord,
} from '@trpc/server';
import { type inferObservableValue } from '@trpc/server/observable';
import { createFlatProxy } from '@trpc/server/shared';

import {
  createHooksInternal,
  type CreateQueryHooks,
  type UseTRPCInfiniteQueryResult,
  type UseTRPCMutationResult,
  type UseTRPCQueryResult,
  type UseTRPCSubscriptionOptions,
} from './createHooksInternal.tsx';
import { createSolidProxyDecoration } from './decorationProxy.ts';
import type {
  CreateTRPCQueryOptions,
  TRPCFetchQueryOptions,
  UseTRPCInfiniteQueryOptions,
  UseTRPCMutationOptions,
  UseTRPCQueryOptions,
} from './types.ts';

/**
 * @internal
 */
export type DecorateProcedure<
  TProcedure extends AnyProcedure,
  TPath extends string,
> = TProcedure extends AnyQueryProcedure
  ? // QUERIES
    {
      useQuery: <TOutput = inferProcedureOutput<TProcedure>, TData = inferProcedureOutput<TProcedure>>(
        input: inferProcedureInput<TProcedure>,
        opts?: UseTRPCQueryOptions<
          TPath,
          inferProcedureInput<TProcedure>,
          TOutput,
          TData,
          TRPCClientErrorLike<TProcedure>
        >,
      ) => UseTRPCQueryResult<TData, TRPCClientErrorLike<TProcedure>>;

      /**
       * @link https://react-query.tanstack.com/guides/prefetching
       */
      prefetchQuery<TOutput = inferProcedureOutput<TProcedure>>(
        input: inferProcedureInput<TProcedure>,
        opts?: TRPCFetchQueryOptions<inferProcedureInput<TProcedure>, TRPCClientErrorLike<TProcedure>, TOutput>,
      ): Promise<void>;

      ensureQueryData<TOutput = inferProcedureOutput<TProcedure>>(
        input: inferProcedureInput<TProcedure>,
        opts?: TRPCFetchQueryOptions<inferProcedureInput<TProcedure>, TRPCClientErrorLike<TProcedure>, TOutput>,
      ): Promise<void>;

      /**
       * @link https://react-query.tanstack.com/reference/QueryClient#queryclientsetquerydata
       */
      setData<TOutput = inferProcedureOutput<TProcedure>>(
        updater: Updater<TOutput | undefined, TOutput | undefined>,
        input?: inferProcedureInput<TProcedure>,
        options?: SetDataOptions,
      ): void;

      /**
       * @link https://react-query.tanstack.com/guides/query-invalidation
       */
      invalidate(
        input?: Partial<inferProcedureInput<TProcedure>>,
        filters?: InvalidateQueryFilters,
        options?: InvalidateOptions,
      ): Promise<void>;
    } & (inferProcedureInput<TProcedure> extends { cursor?: any }
      ? // QUERIES that support infinite
        {
          useInfiniteQuery: <
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _TQueryFnData = inferProcedureOutput<TProcedure>,
            TData = inferProcedureOutput<TProcedure>,
          >(
            input: Omit<inferProcedureInput<TProcedure>, 'cursor'>,
            opts?: UseTRPCInfiniteQueryOptions<
              TPath,
              inferProcedureInput<TProcedure>,
              TData,
              TRPCClientErrorLike<TProcedure>
            >,
          ) => UseTRPCInfiniteQueryResult<TData, TRPCClientErrorLike<TProcedure>>;

          /**
           * @link https://react-query.tanstack.com/reference/QueryClient#queryclientsetquerydata
           */
          setInfiniteData<TOutput = inferProcedureOutput<TProcedure>>(
            updater: Updater<InfiniteData<TOutput> | undefined, InfiniteData<TOutput> | undefined>,
            input?: inferProcedureInput<TProcedure>,
            options?: SetDataOptions,
          ): void;
        }
      : // eslint-disable-next-line @typescript-eslint/ban-types
        {})
  : TProcedure extends AnyMutationProcedure
  ? {
      // MUTATIONS
      useMutation: <TContext = unknown>(
        opts?: UseTRPCMutationOptions<
          inferProcedureInput<TProcedure>,
          TRPCClientErrorLike<TProcedure>,
          inferProcedureOutput<TProcedure>,
          TContext
        >,
      ) => UseTRPCMutationResult<
        inferProcedureOutput<TProcedure>,
        TRPCClientErrorLike<TProcedure>,
        inferProcedureInput<TProcedure>,
        TContext
      >;
    }
  : TProcedure extends AnySubscriptionProcedure
  ? {
      // SUBSCRIPTIONS
      useSubscription: (
        input: inferProcedureInput<TProcedure>,
        opts?: UseTRPCSubscriptionOptions<
          inferObservableValue<inferProcedureOutput<TProcedure>>,
          TRPCClientErrorLike<TProcedure>
        >,
      ) => void;
    }
  : never;

/**
 * @internal
 */
export type DecoratedProcedureRecord<TProcedures extends ProcedureRouterRecord, TPath extends string = ''> = {
  [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
    ? DecoratedProcedureRecord<TProcedures[TKey]['_def']['record'], `${TPath}${TKey & string}.`> &
        DecorateRouterProcedure<TProcedures[TKey]>
    : TProcedures[TKey] extends AnyProcedure
    ? DecorateProcedure<TProcedures[TKey], `${TPath}${TKey & string}`>
    : never;
};

/**
 * A type that will traverse all procedures and sub routers of a given router to create a union of
 * their possible input types
 */
type InferAllRouterQueryInputTypes<TRouter extends AnyRouter> = {
  [TKey in keyof Filter<
    TRouter['_def']['record'],
    AnyRouter | AnyQueryProcedure
  >]: TRouter['_def']['record'][TKey] extends AnyQueryProcedure
    ? inferProcedureInput<TRouter['_def']['record'][TKey]>
    : InferAllRouterQueryInputTypes<TRouter['_def']['record'][TKey]>; // Recurse as we have a sub router!
}[keyof Filter<TRouter['_def']['record'], AnyRouter | AnyQueryProcedure>]; // This flattens results into a big union

/**
 * this is the type that is used to add in procedures that can be used on
 * an entire router
 */
type DecorateRouterProcedure<TRouter extends AnyRouter> = {
  /**
   * @link https://react-query.tanstack.com/guides/query-invalidation
   */
  $invalidate(
    input?: Partial<InferAllRouterQueryInputTypes<TRouter>>,
    filters?: InvalidateQueryFilters,
    options?: InvalidateOptions,
  ): Promise<void>;
};

export type CreateTRPCReact<TRouter extends AnyRouter> = DecorateRouterProcedure<TRouter> &
  DecoratedProcedureRecord<TRouter['_def']['record']>;

/**
 * @internal
 */
export function createHooksInternalProxy<TRouter extends AnyRouter>(trpc: CreateQueryHooks<TRouter>) {
  type CreateHooksInternalProxy = CreateTRPCReact<TRouter>;

  return createFlatProxy<CreateHooksInternalProxy>(key => {
    if ((key as string) in trpc) {
      return (trpc as any)[key];
    }

    return createSolidProxyDecoration(key as string, trpc);
  });
}

export function createTRPCReact<TRouter extends AnyRouter>(opts: CreateTRPCQueryOptions<TRouter>) {
  const hooks = createHooksInternal<TRouter>(opts);
  const proxy = createHooksInternalProxy<TRouter>(hooks);

  return proxy;
}
