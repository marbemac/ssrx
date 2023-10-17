import { AsyncLocalStorage } from 'async_hooks';

export const storage = new AsyncLocalStorage<{ pluginCtx: Record<string, any>; appCtx: Record<string, any> }>();

export const getPageCtx = () => {
  return storage.getStore();
};
