import { Plugin } from "vite";

import type { Config } from "../config.ts";
import type { Router } from "../router.ts";
import type { Manifest } from "../ssr-manifest.ts";
import { PLUGIN_NAMESPACE } from "../consts.ts";

export type VirtualPluginOpts = {
  config: Config;
  router: Router<any>;
  manifest: Manifest<any>;
};

export const virtualPlugin = ({
  config,
  router,
  manifest,
}: VirtualPluginOpts): Plugin => {
  const prefix = /^virtual:dete-/;

  const loadVirtualModule = (virtual: string) => {
    if (virtual === "routes") {
      return `export default ${JSON.stringify(router.routes)}`;
    }

    if (virtual === "ssr-manifest") {
      return `export default ${JSON.stringify(manifest.ssrManifest)}`;
    }

    throw new Error(`Unknown virtual module: ${virtual}`);
  };

  return {
    name: `${PLUGIN_NAMESPACE}:virtual`,

    apply(config, env) {
      return !!env.ssrBuild;
    },

    async resolveId(id) {
      const [, virtual] = id.split(prefix);
      if (virtual) {
        return id;
      }
    },

    load(id) {
      const [, virtual] = id.split(prefix);

      if (virtual) {
        return loadVirtualModule(virtual);
      }
    },
  };
};
