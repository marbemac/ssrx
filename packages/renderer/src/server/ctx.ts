import { AsyncLocalStorage } from 'node:async_hooks';

export const storage = new AsyncLocalStorage<{ appCtx: Record<string, any> }>();

export const getPageCtx = () => {
  return storage.getStore();
};
