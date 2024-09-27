import { clientOnly$ } from 'vite-env-only/macros';

export const getPageCtxClient = clientOnly$(() => {
  // @ts-expect-error ignore
  return window.__PAGE_CTX__ || {};
});
