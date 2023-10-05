import type { Plugin, ViteDevServer } from 'vite';
import { createServer } from 'vite';

import type { Config } from '../config.ts';
import { PLUGIN_NAMESPACE } from '../consts.ts';
import type { Router } from '../router.ts';
import type { Manifest } from '../ssr-manifest.ts';

export type BuildPluginOpts = {
  config: Config;
  router: Router<any>;
  manifest: Manifest<any>;
};

export const buildPlugin = ({ config, router, manifest }: BuildPluginOpts): Plugin => {
  let server: ViteDevServer;
  let isSsr = false;

  return {
    name: `${PLUGIN_NAMESPACE}:build`,

    apply(config, env) {
      return env.command === 'build';
    },

    config(viteConfig, env) {
      isSsr = !!env.ssrBuild;

      return {
        build: {
          manifest: !isSsr,
          outDir: isSsr ? config.serverOutDir : config.clientOutDir,
          target: isSsr ? 'esnext' : 'modules',
          emptyOutDir: !isSsr,
          rollupOptions: {
            input: {
              main: isSsr ? config.serverFile : config.clientEntry,
            },
          },
        },
      };
    },

    async buildStart() {
      if (!isSsr) return;

      server =
        server ||
        (await createServer({
          mode: config.mode,
          appType: 'custom',
          server: {
            middlewareMode: true,
          },
        }));

      manifest.setViteServer(server);

      const routesModule = await server.ssrLoadModule(config.routesFile);
      await router.setRoutes(routesModule);

      const ssrManifest = await manifest.buildSSRManifest();

      this.emitFile({
        type: 'asset',
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
