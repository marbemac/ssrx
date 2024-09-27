import { serverOnly$ } from 'vite-env-only/macros';

import { storage } from './server/handler.tsx';

export const getPageCtxServer = serverOnly$(() => {
  return storage.getStore();
});
