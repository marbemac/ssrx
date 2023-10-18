import type { Plugin, ResolvedConfig, UserConfig, ViteDevServer } from 'vite';
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
  const isEdgeRuntime = config.runtime === 'edge';

  let viteConfig: UserConfig;
  let resolvedViteConfig: ResolvedConfig;

  return {
    name: `${PLUGIN_NAMESPACE}:build`,

    apply(config, env) {
      return env.command === 'build';
    },

    config(c, env) {
      viteConfig = c;

      isSsr = !!env.ssrBuild;

      const input = isSsr ? { server: config.serverFile } : { 'client-entry': config.clientFile };

      return {
        ssr: {
          target: isEdgeRuntime ? 'webworker' : 'node',
          ssr: {
            noExternal: isEdgeRuntime ? true : undefined,
            resolve: {
              conditions: config.runtimeConditions,
              externalConditions: config.runtimeConditions,
            },
          },
        },

        build: {
          manifest: !isSsr,
          outDir: isSsr ? config.serverOutDir : config.clientOutDir,
          target: isSsr ? 'esnext' : 'modules',
          copyPublicDir: !isSsr,
          emptyOutDir: !isSsr,
          rollupOptions: {
            input: input as any,
            output: {
              inlineDynamicImports: isSsr && isEdgeRuntime ? true : undefined,
            },
          },
        },
      };
    },

    configResolved(c) {
      resolvedViteConfig = c;
    },

    async buildStart() {
      if (!isSsr) return;

      server =
        server ||
        (await createServer({
          mode: config.mode,
          appType: 'custom',
          configFile: false,
          plugins: viteConfig.plugins,
          server: {
            middlewareMode: true,
          },
          ssr: {
            target: resolvedViteConfig.ssr?.target,
            resolve: resolvedViteConfig.ssr?.resolve,
          },
        }));

      manifest.setViteServer(server);

      const routesModule = await server.ssrLoadModule(config.routesFile, { fixStacktrace: true });
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
