import type { AsyncRouteComponent } from '@tanstack/react-router';
import React from 'react';

export const sleep = (n = 750) => new Promise(r => setTimeout(r, n));

export const rand = () => Math.round(Math.random() * 100);

const memberData = [
  { id: 1, name: 'marc' },
  { id: 2, name: 'john' },
  { id: 3, name: 'emily' },
  { id: 4, name: 'bob' },
];

export const getMembers = () => {
  return memberData;
};

export const getMember = (id: number) => {
  return memberData.find(m => m.id === id);
};

/**
 * Adapted from https://github.com/TanStack/router/blob/806ef336e52d786ea7b5bc5988b96df9526e9218/packages/react-router/src/react.tsx#L266
 *
 * Changed to preserve identity of the importer promise
 */
export function lazyRouteComponent<T extends Record<string, any>, TKey extends keyof T = 'default'>(
  importer: () => Promise<T>,
  exportName?: TKey,
): T[TKey] extends (props: infer TProps) => any ? AsyncRouteComponent<TProps> : never {
  const load = importer;

  const lazyComp = React.lazy(async () => {
    const moduleExports = await load();
    const comp = moduleExports[exportName ?? 'default'];
    return {
      default: comp,
    };
  });

  (lazyComp as any).preload = load;

  return lazyComp as any;
}
