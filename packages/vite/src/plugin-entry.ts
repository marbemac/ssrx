import type { PluginOption } from 'vite';
import { envOnlyMacros } from 'vite-env-only';

import { Config } from './config.ts';
import { defaultRouterAdapter } from './default-router-adapter.ts';
import { buildPlugin } from './plugins/build.ts';
import { cloudflarePlugin } from './plugins/cloudflare.ts';
import { configPlugin } from './plugins/config.ts';
import { devServerPlugin } from './plugins/dev-server.ts';
import { emptyModulesPlugin } from './plugins/modules.ts';
import { virtualPlugin } from './plugins/virtual.ts';
import type { RouterAdapter } from './router.ts';
import { Router } from './router.ts';
import { Manifest } from './ssr-manifest.ts';
import type { ServerRuntime } from './types.ts';

export type Opts = {
  routerAdapter?: RouterAdapter<any>;
  routesFile?: string;
  clientEntry?: string;
  serverFile?: string;
  clientOutDir?: string;
  serverOutDir?: string;
  runtime?: ServerRuntime;
};

export { defaultRouterAdapter } from './default-router-adapter.ts';

export const ssrx = ({
  routerAdapter = defaultRouterAdapter(),
  routesFile = 'src/routes.tsx',
  clientEntry = 'src/entry.client.tsx',
  serverFile = 'src/server.ts',
  runtime = 'node',
  clientOutDir,
  serverOutDir,
}: Opts = {}): PluginOption[] => {
  const config = new Config({
    routesFile,
    clientEntry,
    serverFile,
    clientOutDir,
    serverOutDir,
    runtime,
  });

  const router = new Router<any>({ adapter: routerAdapter });

  const manifest = new Manifest({
    config,
    router,
  });

  // @ts-expect-error ignore
  globalThis.MANIFEST = manifest;

  return [
    envOnlyMacros(),
    configPlugin({ config, router, manifest }),
    emptyModulesPlugin(),
    virtualPlugin({ config, router, manifest }),
    devServerPlugin({ config, router, manifest }),
    buildPlugin({ config, router, manifest }),
    runtime === 'cf-pages' ? cloudflarePlugin({ config, router, manifest }) : undefined,
  ].filter(Boolean);
};
