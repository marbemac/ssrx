import type { Plugin } from 'vite';

import type { Config } from '../config.ts';
import { PLUGIN_NAMESPACE } from '../consts.ts';
import type { Router } from '../router.ts';
import type { Manifest } from '../ssr-manifest.ts';

export type ConfigPluginOpts = {
  config: Config;
  router: Router<any>;
  manifest: Manifest<any>;
};

export const configPlugin = ({ config }: ConfigPluginOpts): Plugin => {
  return {
    name: `${PLUGIN_NAMESPACE}:config`,

    enforce: 'pre',

    configResolved(viteConfig) {
      config.root = viteConfig.root;
      config.mode = viteConfig.mode;
      config.basePath = viteConfig.base;
    },
  };
};
