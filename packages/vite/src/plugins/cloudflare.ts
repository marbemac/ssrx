import * as fs from 'fs/promises';
import { join } from 'path';
import type { Plugin, ResolvedConfig, UserConfig } from 'vite';

import type { Config } from '../config.ts';
import { PLUGIN_NAMESPACE } from '../consts.ts';
import type { Router } from '../router.ts';
import type { Manifest } from '../ssr-manifest.ts';

export type BuildPluginOpts = {
  config: Config;
  router: Router<any>;
  manifest: Manifest<any>;
};

export const cloudflarePlugin = ({ config }: BuildPluginOpts): Plugin => {
  let isSsr = false;
  let resolvedViteConfig: ResolvedConfig;

  return {
    name: `${PLUGIN_NAMESPACE}:cloudflare`,

    apply(config, env) {
      return env.command === 'build';
    },

    config(c, env) {
      isSsr = !!env.ssrBuild;

      return {
        build: {
          rollupOptions: {
            /**
             * This is a cloudflare thing (if using workers rather than pages)
             */
            external: ['__STATIC_CONTENT_MANIFEST'],
          },
        },
      } satisfies UserConfig;
    },

    configResolved(c) {
      resolvedViteConfig = c;
    },

    async generateBundle() {
      if (isSsr && config.runtime === 'cf-pages') {
        const { routes, headers } = await generateCFPagesMetaFiles({
          assetsDir: resolvedViteConfig.build.assetsDir,
          publicDir: resolvedViteConfig.publicDir,
        });

        // Allow user to provide their own _routes.json file if they want
        let existingRoutes = false;
        try {
          existingRoutes = !!(await fs.stat(join(resolvedViteConfig.publicDir, '_routes.json')));
        } catch (e) {
          // noop
        }

        if (!existingRoutes) {
          this.emitFile({
            type: 'asset',
            fileName: '_routes.json',
            source: JSON.stringify(routes, null, 2),
          });
        }

        let existingHeaders = '';
        try {
          existingHeaders = await fs.readFile(join(resolvedViteConfig.publicDir, '_headers'), 'utf-8');
        } catch (e) {
          // noop
        }

        const finalHeaders = [existingHeaders, headers].filter(Boolean).join('\n\n');
        this.emitFile({
          type: 'asset',
          fileName: '_headers',
          source: finalHeaders,
        });
      }
    },
  };
};

const generateCFPagesMetaFiles = async ({ assetsDir, publicDir }: { assetsDir: string; publicDir: string }) => {
  const routes = {
    version: 1,
    include: ['/*'],
    exclude: [`/${assetsDir}/*`],
  };

  let headers = ``;

  const publicAssets = await fs.readdir(publicDir);
  for (const asset of publicAssets) {
    const stats = await fs.stat(join(publicDir, asset));
    if (stats.isFile()) {
      routes.exclude.push(`/${asset}`);

      const newHeader = `/${asset}
  Cache-Control: public, max-age=3600, s-maxage=3600`;
      headers = [headers, newHeader].filter(Boolean).join('\n\n');
    } else if (stats.isDirectory()) {
      routes.exclude.push(`/${asset}/*`);

      const newHeader = `/${asset}/*
  Cache-Control: public, max-age=31536000, immutable`;
      headers = [headers, newHeader].filter(Boolean).join('\n\n');
    }
  }

  return { routes, headers };
};
