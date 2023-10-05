import type { Plugin } from 'vite';

import { Config } from './config.ts';
import { buildPlugin } from './plugins/build.ts';
import { configPlugin } from './plugins/config.ts';
import { devServerPlugin } from './plugins/dev-server.ts';
import { virtualPlugin } from './plugins/virtual.ts';
import type { RouterAdapter } from './router.ts';
import { Router } from './router.ts';
import { Manifest } from './ssr-manifest.ts';

export type Opts = {
  routerAdapter: RouterAdapter<any>;
  routesFile?: string;
  clientEntry?: string;
  serverFile?: string;
  clientOutDir?: string;
  serverOutDir?: string;
};

const plugin = ({
  routerAdapter,
  routesFile = './src/routes.tsx',
  clientEntry = './src/entry.client.tsx',
  serverFile = './src/server.ts',
  clientOutDir = 'dist/public',
  serverOutDir = 'dist',
}: Opts): Plugin[] => {
  const config = new Config({
    routesFile,
    clientEntry,
    serverFile,
    clientOutDir,
    serverOutDir,
  });

  const router = new Router<any>({
    normalizeExternalRoutes: routes => routerAdapter.normalizeExternalRoutes(routes.routes),
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
