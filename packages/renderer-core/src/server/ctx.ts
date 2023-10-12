import { AsyncLocalStorage } from 'async_hooks';

export const storage = new AsyncLocalStorage();

export const getPageCtx = () => {
  return storage.getStore();
};
