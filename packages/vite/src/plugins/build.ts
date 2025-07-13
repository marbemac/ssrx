import * as fs from 'fs/promises';
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

  let viteConfig: UserConfig;
  let resolvedViteConfig: ResolvedConfig;

  return {
    name: `${PLUGIN_NAMESPACE}:build`,

    apply(c, env) {
      return env.command === 'build';
    },

    config(c, env) {
      viteConfig = c;

      isSsr = !!env.isSsrBuild;

      const input = isSsr ? { server: config.serverFile } : { 'client-entry': config.clientFile };

      const output: NonNullable<NonNullable<UserConfig['build']>['rollupOptions']>['output'] = {
        inlineDynamicImports: isSsr && config.isEdgeRuntime ? true : undefined,
      };
      if (isSsr && config.ssrOutputName) {
        output.entryFileNames = config.ssrOutputName;
      }

      const ssrConditions = [...(c.resolve?.conditions || []), ...config.runtimeConditions];

      return {
        ssr: {
          target: config.ssrTarget,
          noExternal: config.ssrNoExternal,
          resolve: {
            conditions: ssrConditions,
            externalConditions: ssrConditions,
          },
        },

        build: {
          manifest: !isSsr,
          outDir: isSsr ? config.serverOutDir : config.clientOutDir,
          target: isSsr ? 'esnext' : undefined,
          copyPublicDir: !isSsr,
          emptyOutDir: !isSsr,
          rollupOptions: {
            input: input as any,
            output: Object.keys(output).length === 0 ? undefined : output,
          },
        },
      } satisfies UserConfig;
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
      router.setRoutes(routesModule);

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

    async writeBundle() {
      if (!isSsr) return;

      // cleanup the vite client manifest
      await fs.rm(manifest.clientManifestDir, { recursive: true });
    },
  };
};
