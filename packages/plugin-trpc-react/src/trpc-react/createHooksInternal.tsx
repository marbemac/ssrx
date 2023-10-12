/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  hashKey,
  type InfiniteData,
  type InvalidateOptions,
  type InvalidateQueryFilters,
  type SetDataOptions,
  type Updater,
  useInfiniteQuery as __useInfiniteQuery,
  type UseInfiniteQueryResult,
  useMutation as __useMutation,
  type UseMutationResult,
  useQuery as __useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { type TRPCClientErrorLike } from '@trpc/client';
import type {
  AnyRouter,
  inferHandlerInput,
  inferProcedureClientError,
  inferProcedureInput,
  inferProcedureOutput,
  ProcedureRecord,
} from '@trpc/server';
import { type inferObservableValue } from '@trpc/server/observable';
import { useEffect, useRef } from 'react';

import { getArrayQueryKey } from './getArrayQueryKey.ts';
import type {
  CreateTRPCQueryOptions,
  TRPCFetchQueryOptions,
  UseMutationOverride,
  UseTRPCInfiniteQueryOptions,
  UseTRPCMutationOptions,
  UseTRPCQueryOptions,
} from './types.ts';

export interface UseTRPCSubscriptionOptions<TOutput, TError> {
  enabled?: boolean;
  onStarted?: () => void;
  onData: (data: TOutput) => void;
  onError?: (err: TError) => void;
}

function getClientArgs<TPathAndInput extends unknown[], TOptions>(pathAndInput: TPathAndInput, opts: TOptions) {
  const [path, input] = pathAndInput;
  return [path, input, (opts as any)?.trpc] as const;
}

type inferInfiniteQueryNames<TObj extends ProcedureRecord> = {
  [TPath in keyof TObj]: inferProcedureInput<TObj[TPath]> extends {
    cursor?: any;
  }
    ? TPath
    : never;
}[keyof TObj];

type inferProcedures<TObj extends ProcedureRecord> = {
  [TPath in keyof TObj]: {
    input: inferProcedureInput<TObj[TPath]>;
    output: inferProcedureOutput<TObj[TPath]>;
  };
};

interface TRPCHookResult {
  trpc: {
    path: string;
  };
}

/**
 * @internal
 */
export type UseTRPCQueryResult<TData, TError> = UseQueryResult<TData, TError> & TRPCHookResult;

/**
 * @internal
 */
export type UseTRPCInfiniteQueryResult<TData, TError> = UseInfiniteQueryResult<TData, TError> & TRPCHookResult;

/**
 * @internal
 */
export type UseTRPCMutationResult<TData, TError, TVariables, TContext> = UseMutationResult<
  TData,
  TError,
  TVariables,
  TContext
> &
  TRPCHookResult;

/**
 * Create strongly typed react hooks
 * @internal
 */
export function createHooksInternal<TRouter extends AnyRouter>(config: CreateTRPCQueryOptions<TRouter>) {
  const mutationSuccessOverride: UseMutationOverride['onSuccess'] =
    config?.unstable_overrides?.useMutation?.onSuccess ?? (options => options.originalFn());

  const { queryClient } = config;

  type TQueries = TRouter['_def']['queries'];
  type TSubscriptions = TRouter['_def']['subscriptions'];
  type TMutations = TRouter['_def']['mutations'];

  type TError = TRPCClientErrorLike<TRouter>;
  type TInfiniteQueryNames = inferInfiniteQueryNames<TQueries>;

  type TQueryValues = inferProcedures<TQueries>;
  type TMutationValues = inferProcedures<TMutations>;

  function invalidate<TPath extends keyof TQueryValues & string>(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TQueries[TPath]>],
    filters?: InvalidateQueryFilters,
    options?: InvalidateOptions,
  ): Promise<void> {
    return queryClient.invalidateQueries({
      queryKey: getArrayQueryKey(pathAndInput, 'any'),
      ...filters,
      ...options,
    });
  }

  function prefetchQuery<TPath extends keyof TQueryValues & string, TOutput extends TQueryValues[TPath]['output']>(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TQueries[TPath]>],
    opts?: TRPCFetchQueryOptions<TQueryValues[TPath]['input'], TError, TOutput>,
  ): Promise<void> {
    return queryClient.prefetchQuery({
      queryKey: getArrayQueryKey(pathAndInput, 'query'),
      queryFn: () => (config.client as any).query(...getClientArgs(pathAndInput, opts)),
      ...(opts as any),
    });
  }

  function ensureQueryData<TPath extends keyof TQueryValues & string, TOutput extends TQueryValues[TPath]['output']>(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TQueries[TPath]>],
    opts?: TRPCFetchQueryOptions<TQueryValues[TPath]['input'], TError, TOutput>,
  ): Promise<void> {
    return queryClient.ensureQueryData({
      queryKey: getArrayQueryKey(pathAndInput, 'query'),
      queryFn: () => (config.client as any).query(...getClientArgs(pathAndInput, opts)),
      ...(opts as any),
    });
  }

  function setQueryData<TPath extends keyof TQueryValues & string, TOutput extends TQueryValues[TPath]['output']>(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TQueries[TPath]>],
    updater: Updater<TOutput | undefined, TOutput | undefined>,
    opts?: SetDataOptions,
  ): void {
    queryClient.setQueryData(getArrayQueryKey(pathAndInput, 'query'), updater, opts);
  }

  function setInfiniteQueryData<
    TPath extends keyof TQueryValues & string,
    TOutput extends TQueryValues[TPath]['output'],
  >(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TQueries[TPath]>],
    updater: Updater<InfiniteData<TOutput> | undefined, InfiniteData<TOutput> | undefined>,
    opts?: SetDataOptions,
  ): void {
    queryClient.setQueryData(getArrayQueryKey(pathAndInput, 'infinite'), updater, opts);
  }

  function useQuery<
    TPath extends keyof TQueryValues & string,
    TQueryFnData = TQueryValues[TPath]['output'],
    TData = TQueryValues[TPath]['output'],
  >(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TQueries[TPath]>],
    opts?: UseTRPCQueryOptions<TPath, TQueryValues[TPath]['input'], TQueryFnData, TData, TError>,
  ): UseTRPCQueryResult<TData, TError> {
    return __useQuery({
      queryKey: getArrayQueryKey(pathAndInput, 'query'),
      queryFn: () => {
        return (config.client as any).query(...getClientArgs(pathAndInput, opts));
      },
      ...(opts as any),
    }) as UseTRPCQueryResult<TData, TError>;
  }

  function useMutation<TPath extends keyof TMutationValues & string, TContext = unknown>(
    path: TPath | [TPath],
    opts?: UseTRPCMutationOptions<TMutationValues[TPath]['input'], TError, TMutationValues[TPath]['output'], TContext>,
  ): UseTRPCMutationResult<TMutationValues[TPath]['output'], TError, TMutationValues[TPath]['input'], TContext> {
    const actualPath = Array.isArray(path) ? path[0] : path;

    const defaultOpts = queryClient.getMutationDefaults([actualPath.split('.')]);

    return __useMutation({
      ...opts,
      mutationKey: [actualPath.split('.')],
      mutationFn: input => {
        return (config.client as any).mutation(...getClientArgs([actualPath, input], opts));
      },
      onSuccess(...args) {
        const originalFn = () => opts?.onSuccess?.(...args) ?? defaultOpts?.onSuccess?.(...args);

        return mutationSuccessOverride({
          originalFn,
          queryClient,
          meta: opts?.meta ?? defaultOpts?.meta ?? {},
        });
      },
    }) as UseTRPCMutationResult<TMutationValues[TPath]['output'], TError, TMutationValues[TPath]['input'], TContext>;
  }

  /**
   * ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
   *  **Experimental.** API might change without major version bump
   * ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠
   */
  function useSubscription<TPath extends keyof TSubscriptions & string>(
    pathAndInput: [path: TPath, ...args: inferHandlerInput<TSubscriptions[TPath]>],
    opts: UseTRPCSubscriptionOptions<
      inferObservableValue<inferProcedureOutput<TSubscriptions[TPath]>>,
      inferProcedureClientError<TSubscriptions[TPath]>
    >,
  ) {
    const enabled = opts?.enabled ?? true;
    const queryKey = hashKey(pathAndInput);

    const optsRef = useRef<typeof opts>(opts);
    optsRef.current = opts;

    useEffect(() => {
      if (!enabled) {
        return;
      }
      const [path, input] = pathAndInput;
      let isStopped = false;
      const subscription = config.client.subscription(path, (input ?? undefined) as any, {
        onStarted: () => {
          if (!isStopped) {
            optsRef.current.onStarted?.();
          }
        },
        onData: (data: unknown) => {
          if (!isStopped) {
            // FIXME this shouldn't be needed as both should be `unknown` in next major
            optsRef.current.onData(data as any);
          }
        },
        onError: (err: unknown) => {
          if (!isStopped) {
            optsRef.current.onError?.(err);
          }
        },
      });
      return () => {
        isStopped = true;
        subscription.unsubscribe();
      };
    }, [queryKey, enabled]);
  }

  function useInfiniteQuery<TPath extends TInfiniteQueryNames & string>(
    pathAndInput: [path: TPath, input: Omit<TQueryValues[TPath]['input'], 'cursor'>],
    opts?: UseTRPCInfiniteQueryOptions<
      TPath,
      Omit<TQueryValues[TPath]['input'], 'cursor'>,
      TQueryValues[TPath]['output'],
      TError
    >,
  ): UseTRPCInfiniteQueryResult<TQueryValues[TPath]['output'], TError> {
    return __useInfiniteQuery({
      queryKey: getArrayQueryKey(pathAndInput, 'infinite'),
      queryFn: queryFunctionContext => {
        const actualInput = {
          ...((pathAndInput[1] as any) ?? {}),
          cursor: queryFunctionContext.pageParam,
        };

        return (config.client as any).query(...getClientArgs([pathAndInput[0], actualInput], opts));
      },
      ...(opts as any),
    }) as UseTRPCInfiniteQueryResult<TQueryValues[TPath]['output'], TError>;
  }

  return {
    invalidate,
    prefetchQuery,
    ensureQueryData,
    setData: setQueryData,
    setInfiniteData: setInfiniteQueryData,
    useQuery,
    useMutation,
    useSubscription,
    useInfiniteQuery,
  };
}

export type CreateQueryHooks<TRouter extends AnyRouter> = ReturnType<typeof createHooksInternal<TRouter>>;
