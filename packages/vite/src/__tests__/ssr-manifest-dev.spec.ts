import { beforeEach, it, afterEach, expect, describe } from "vitest";
import { ViteDevServer, createServer as createViteServer } from "vite";
import * as path from "path";

import {
  findStylesInModuleGraph,
  getModuleAssets,
} from "../ssr-manifest-dev.ts";

type LocalTestContext = {
  vite: ViteDevServer;
};

beforeEach<LocalTestContext>(async (ctx) => {
  ctx.vite = await createViteServer({
    root: __dirname,
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
  const clientEntry = path.join(
    __dirname,
    "./fixtures/client-entry-simple.tsx"
  );

  // await vite.moduleGraph.ensureEntryFromUrl(clientEntry);
  // await vite.transformRequest(clientEntry);
  // const node = await vite.moduleGraph.getModuleById(clientEntry);
  // await vite.ssrLoadModule(clientEntry);

  // const assets = getModuleAssets(node);
  const assets = await findStylesInModuleGraph(vite, [clientEntry], true);

  // expect(assets.length).toBe(2);

  expect(assets).toMatchInlineSnapshot(`
    {
      "/Users/marc/dev/dayjot-ts/apps/vite-debug/plugin/__tests__/fixtures/layout.css": {
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
      },
      "/Users/marc/dev/dayjot-ts/apps/vite-debug/plugin/__tests__/fixtures/style-1.css": {
        "content": ".style1 {
      color: red;
    }
    ",
        "isNested": false,
        "isPreload": false,
        "type": "style",
        "url": "/Users/marc/dev/dayjot-ts/apps/vite-debug/plugin/__tests__/fixtures/style-1.css",
        "weight": 1,
      },
    }
  `);
});

// describe("lazy routes", () => {
//   it.only<LocalTestContext>("works 2", async ({ vite }) => {
//     const routesFile = "./fixtures/routes-lazy.tsx";
//     const clientEntry = "./fixtures/client.entry.tsx";

//     const config = new Config({
//       root: vite.config.root,
//       routesFile,
//       clientEntry,
//     });

//     const reactRouterAdapter = ReactRouterAdapter();

//     const router = new Router<typeof RoutesSimple>({
//       getMatchedRoutes: reactRouterAdapter.getMatchedRoutes,
//       normalizeExternalRoutes: (routes) =>
//         reactRouterAdapter.normalizeExternalRoutes(routes.routes),
//     });

//     await router.setRoutes(
//       // @ts-expect-error ignore
//       await vite.ssrLoadModule(routesFile)
//     );

//     const manifest = new SsrManifest({
//       router,
//       config,
//       devServer: vite,
//     });

//     const assets = await manifest.getAssets("/hello");

//     expect(assets).toMatchInlineSnapshot('[]');

//     expect(assets.length).toBe(2);

//     expect(assets[0]).toMatchInlineSnapshot(`
//       {
//         "content": ".style1 {
//         color: red;
//       }
//       ",
//         "isNested": false,
//         "isPreload": false,
//         "type": "style",
//         "url": "/Users/marc/dev/dayjot-ts/apps/vite-debug/plugin/__tests__/fixtures/style-1.css",
//         "weight": 1,
//       }
//     `);

//     expect(assets[1]).toMatchInlineSnapshot(`
//       {
//         "content": ".layout-import {
//         color: red;
//       }

//       .layout {
//         color: green;
//       }
//       ",
//         "isNested": false,
//         "isPreload": false,
//         "type": "style",
//         "url": "/Users/marc/dev/dayjot-ts/apps/vite-debug/plugin/__tests__/fixtures/layout.css",
//         "weight": 1,
//       }
//     `);
//   });
// });
