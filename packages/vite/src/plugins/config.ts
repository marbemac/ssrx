import type { Plugin, UserConfig } from 'vite';

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

    config() {
      return {
        appType: 'custom',

        ssr: {
          // Ensure ssrx packages are processed by the vite pipeline so
          // that the virtual plugin works, and the vite-env-only plugin works.
          noExternal: [/@ssrx/],
        },

        // To test changes to these settings, run any of the examples with the resolve.preserveSymlinks vite config
        // option set to true. (make sure to build all the ssrx packages first)
        optimizeDeps: {
          // Any commonjs deps that ssrx packages use must be explicitly included, per the note here:
          // https://vitejs.dev/config/dep-optimization-options.html#optimizedeps-exclude
          include: ['deepmerge', 'jsesc', 'react', 'react-dom'],

          exclude: [
            // Exclude all virtual modules from the vite dep optimization
            'virtual:ssrx-manifest',
            'virtual:ssrx-routes',

            // Exclude certain ssrx packages from the vite dep optimization, so that they go through the full
            // vite pipeline during development, which is critical for plugins like vite-env-only to work.
            //
            // !! Any package that uses vite-env-only should be added to this list.
            '@ssrx/plugin-react-router',
            // '@ssrx/plugin-solid-router',
            // '@ssrx/plugin-tanstack-query',
            '@ssrx/plugin-tanstack-router',
            // '@ssrx/plugin-trpc-react',
            // '@ssrx/plugin-unhead',
            '@ssrx/react',
            '@ssrx/remix',
            '@ssrx/renderer',
            // '@ssrx/solid',
            // '@ssrx/streaming',
            // '@ssrx/trpc-react-query',
            '@ssrx/vite',
          ],
        },
      } satisfies UserConfig;
    },

    configResolved(this, viteConfig) {
      config.root = viteConfig.root;
      config.mode = viteConfig.mode;
      config.basePath = viteConfig.base;
      config.minimalContext = this;
    },
  };
};
