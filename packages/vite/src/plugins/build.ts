import { Plugin, ViteDevServer, createServer } from "vite";

import type { Config } from "../config.ts";
import type { Router } from "../router.ts";
import type { Manifest } from "../ssr-manifest.ts";
import { PLUGIN_NAMESPACE } from "../consts.ts";

export type BuildPluginOpts = {
  config: Config;
  router: Router<any>;
  manifest: Manifest<any>;
};

export const buildPlugin = ({
  config,
  router,
  manifest,
}: BuildPluginOpts): Plugin => {
  let server: ViteDevServer;

  return {
    name: `${PLUGIN_NAMESPACE}:build`,

    apply(config, env) {
      return !!env.ssrBuild && env.command === "build";
    },

    async buildStart() {
      server =
        server ||
        (await createServer({
          mode: config.mode,
          appType: "custom",
          server: {
            middlewareMode: true,
          },
        }));

      manifest.setViteServer(server);

      const routesModule = await server.ssrLoadModule(config.routesFile);
      await router.setRoutes(routesModule);

      const ssrManifest = await manifest.buildSSRManifest();

      this.emitFile({
        type: "asset",
        fileName: manifest.ssrManifestName,
        source: JSON.stringify(ssrManifest, null, 2),
      });
    },

    async buildEnd() {
      if (server) {
        await server.close();
      }
    },
  };
};
