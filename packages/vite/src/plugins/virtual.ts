import type { Plugin } from 'vite';

import type { Config } from '../config.ts';
import { PLUGIN_NAMESPACE } from '../consts.ts';
import type { Router } from '../router.ts';
import type { Manifest } from '../ssr-manifest.ts';

export type VirtualPluginOpts = {
  config: Config;
  router: Router<any>;
  manifest: Manifest<any>;
};

export const virtualPlugin = ({ router, manifest }: VirtualPluginOpts): Plugin => {
  const prefix = /^virtual:dete-/;

  const loadVirtualModule = (virtual: string) => {
    if (virtual === 'routes') {
      return `export default ${JSON.stringify(router.routes)}`;
    }

    if (virtual === 'ssr-manifest') {
      return `export default ${JSON.stringify(manifest.ssrManifest)}`;
    }
  };

  return {
    name: `${PLUGIN_NAMESPACE}:virtual`,

    enforce: 'pre',

    resolveId(id, importer, { ssr }) {
      const isSsr = !!ssr;
      const [, virtual] = id.split(prefix);
      if (virtual) {
        if (!isSsr) {
          throw new Error(`The ${id} virtual module cannot be imported on the client`);
        }

        return id;
      }
    },

    load(id) {
      const [, virtual] = id.split(prefix);

      if (virtual) {
        const mod = loadVirtualModule(virtual);
        if (!mod) {
          new Error(`Unknown virtual module: ${id}`);
        }

        return mod;
      }
    },
  };
};
