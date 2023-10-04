import { Plugin } from "vite";

import type { Config } from "../config.ts";
import type { Router } from "../router.ts";
import type { Manifest } from "../ssr-manifest.ts";
import { PLUGIN_NAMESPACE } from "../consts.ts";

export type ConfigPluginOpts = {
  config: Config;
  router: Router<any>;
  manifest: Manifest<any>;
};

export const configPlugin = ({
  config,
  router,
  manifest,
}: ConfigPluginOpts): Plugin => {
  let isSsr = false;

  return {
    name: `${PLUGIN_NAMESPACE}:config`,

    enforce: "pre",

    config(viteConfig, env) {
      isSsr = !!env.ssrBuild;

      return {
        build: {
          manifest: !isSsr,
          outDir: isSsr ? config.serverOutDir : config.clientOutDir,
          target: isSsr ? "esnext" : "modules",
          emptyOutDir: !isSsr,
          rollupOptions: {
            input: {
              main: isSsr ? config.serverFile : config.clientEntry,
            },
          },
        },
      };
    },

    configResolved(viteConfig) {
      config.root = viteConfig.root;
      config.mode = viteConfig.mode;
    },
  };
};
