export const getPageCtx = () => {
  // @ts-expect-error ignore
  return window.__PAGE_CTX__ || {};
};
