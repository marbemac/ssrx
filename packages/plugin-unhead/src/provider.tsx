import type { ActiveHeadEntry, Head, HeadEntryOptions, Unhead } from '@unhead/schema';
import { createContext, useContext } from 'react';

export const HeadContext = createContext<Unhead | null>(null);

export const HeadProvider = HeadContext.Provider;

type SupportedHead = Pick<
  Head,
  'title' | 'titleTemplate' | 'templateParams' | 'link' | 'meta' | 'style' | 'script' | 'noscript'
>;

export const useHead = <T extends SupportedHead>(
  input: T,
  options: HeadEntryOptions = {},
): ActiveHeadEntry<T> | void => {
  const head = useContext(HeadContext);
  if (!head) {
    throw new Error('`useHead` must be used within a `HeadProvider`');
  }

  const isBrowser = !import.meta.env.SSR;
  if ((options.mode === 'server' && isBrowser) || (options.mode === 'client' && !isBrowser)) return;

  return head.push(input, options);
};
