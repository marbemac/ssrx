export const transformPath = (path: string) => {
  if (!path) return path;

  return (
    path
      // strip leading and trailing slashes
      .replace(/^\/+|\/+$/g, '')
      // replace $variables with :variables
      .replace(/\$([\w]+)/g, ':$1')
      // replace trailing splat of $ or * with **
      .replace(/\$$|\*$/g, '**')
  );
};
