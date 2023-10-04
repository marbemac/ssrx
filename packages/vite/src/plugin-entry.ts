import type { Plugin } from 'vite';

import { ReactRouterAdapter } from './adapters/react-router.ts';
import { Config } from './config.ts';
import { buildPlugin } from './plugins/build.ts';
import { configPlugin } from './plugins/config.ts';
import { devServerPlugin } from './plugins/dev-server.ts';
import { virtualPlugin } from './plugins/virtual.ts';
import { Router } from './router.ts';
import { Manifest } from './ssr-manifest.ts';

export type Opts = {
  routesFile?: string;
  clientEntry?: string;
  serverFile?: string;
  clientOutDir?: string;
  serverOutDir?: string;
};

const plugin = ({
  routesFile = './src/routes.tsx',
  clientEntry = './src/entry.client.tsx',
  serverFile = './src/server.ts',
  clientOutDir = 'dist/public',
  serverOutDir = 'dist',
}: Opts = {}): Plugin[] => {
  const config = new Config({
    routesFile,
    clientEntry,
    serverFile,
    clientOutDir,
    serverOutDir,
  });

  const reactRouterAdapter = ReactRouterAdapter();

  const router = new Router<any>({
    getMatchedRoutes: reactRouterAdapter.getMatchedRoutes,
    normalizeExternalRoutes: routes => reactRouterAdapter.normalizeExternalRoutes(routes.routes),
  });

  const manifest = new Manifest({
    config,
    router,
  });

  // @ts-expect-error ignore
  globalThis.MANIFEST = manifest;

  return [
    configPlugin({ config, router, manifest }),
    virtualPlugin({ config, router, manifest }),
    devServerPlugin({ config, router, manifest }),
    buildPlugin({ config, router, manifest }),
  ];
};

export default plugin;
