import { beforeEach, it, afterEach, expect, describe } from "vitest";
import { ViteDevServer, createServer as createViteServer } from "vite";
import * as path from "path";

import { Router } from "../router.ts";
import type * as RoutesSimple from "./fixtures/routes-simple.ts";
import { Manifest } from "../ssr-manifest.ts";
import { Config } from "../config.ts";
import { ReactRouterAdapter } from "../adapters/react-router.ts";

type LocalTestContext = {
  vite: ViteDevServer;
};

beforeEach<LocalTestContext>(async (ctx) => {
  ctx.vite = await createViteServer({
    root: path.resolve(__dirname),
    appType: "custom",
    configFile: false,
    server: {
      middlewareMode: true,
    },
    // plugins: [devServer()],
  });
});

afterEach<LocalTestContext>(async (ctx) => {
  await ctx.vite.close();
});

it<LocalTestContext>("works", async ({ vite }) => {
  const routesFile = "./fixtures/routes-simple.tsx";
  const clientEntry = "./fixtures/client.entry.tsx";

  const config = new Config({
    root: vite.config.root,
    routesFile,
    clientEntry,
  });

  const reactRouterAdapter = ReactRouterAdapter();

  const router = new Router<typeof RoutesSimple>({
    getMatchedRoutes: reactRouterAdapter.getMatchedRoutes,
    normalizeExternalRoutes: (routes) =>
      reactRouterAdapter.normalizeExternalRoutes(routes.routes),
  });

  await router.setRoutes(
    // @ts-expect-error ignore
    await vite.ssrLoadModule(routesFile)
  );

  const manifest = new Manifest({
    router,
    config,
    viteServer: vite,
  });

  const assets = await manifest.getAssets("/hello/world");

  expect(assets.length).toBe(2);

  expect(assets[0]).toMatchInlineSnapshot(`
    {
      "content": ".style1 {
      color: red;
    }
    ",
      "isNested": false,
      "isPreload": false,
      "type": "style",
      "url": "/Users/marc/dev/dayjot-ts/apps/vite-debug/plugin/__tests__/fixtures/style-1.css",
      "weight": 1,
    }
  `);

  expect(assets[1]).toMatchInlineSnapshot(`
    {
      "content": ".layout-import {
      color: red;
    }

    .layout {
      color: green;
    }
    ",
      "isNested": false,
      "isPreload": false,
      "type": "style",
      "url": "/Users/marc/dev/dayjot-ts/apps/vite-debug/plugin/__tests__/fixtures/layout.css",
      "weight": 1,
    }
  `);
});
