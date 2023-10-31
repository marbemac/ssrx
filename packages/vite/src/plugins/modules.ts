import type { Plugin } from 'vite';

import { PLUGIN_NAMESPACE } from '../consts.ts';

export const emptyModulesPlugin = (): Plugin[] => {
  return [
    {
      name: `${PLUGIN_NAMESPACE}:empty-server-modules`,

      enforce: 'pre',

      transform(_code, id, options) {
        if (!options?.ssr && /\.server(\.[cm]?[jt]sx?)?$/.test(id))
          return {
            code: 'export default {}',
            map: null,
          };
      },
    },

    {
      name: `${PLUGIN_NAMESPACE}:empty-client-modules`,

      enforce: 'pre',

      transform(_code, id, options) {
        if (options?.ssr && /\.client(\.[cm]?[jt]sx?)?$/.test(id))
          return {
            code: 'export default {}',
            map: null,
          };
      },
    },
  ];
};
