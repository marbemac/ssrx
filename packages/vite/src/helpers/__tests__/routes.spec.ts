import { beforeEach, it, afterEach, expect, describe } from "vitest";
import { ViteDevServer, createServer as createViteServer } from "vite";
import * as path from "path";
import * as fs from "fs/promises";

import {
  generateEntryManifest,
  generateRoutesManifest,
  getRoutesIds,
} from "../routes.ts";

type LocalTestContext = {
  vite: ViteDevServer;
};

const fixturesDir = path.join(__dirname, "..", "..", "__fixtures__");

beforeEach<LocalTestContext>(async (ctx) => {
  ctx.vite = await createViteServer({
    appType: "custom",
    configFile: false,
    server: {
      middlewareMode: true,
    },
  });
});

afterEach<LocalTestContext>(async (ctx) => {
  await ctx.vite.close();
});

describe("getRoutesIds()", () => {
  it<LocalTestContext>("identifies lazy loaded modules", async ({ vite }) => {
    const lazyLoad = await vite.ssrLoadModule(
      path.join(fixturesDir, "routes-lazy.tsx")
    );

    const routeIds = await getRoutesIds(vite, lazyLoad.routes);

    expect(routeIds).toMatchInlineSnapshot(`
      {
        "0-1": "plugin/__fixtures__/lazy/todos.tsx",
        "0-1-0": "plugin/__fixtures__/lazy/todo.tsx",
      }
    `);
  });
});

describe("generateEntryManifest()", () => {
  it<LocalTestContext>("maps route ids to assets correctly", async ({
    vite,
  }) => {
    const clientManifest = JSON.parse(
      await fs.readFile(
        path.join(fixturesDir, "build-example/client/.vite/manifest.json"),
        "utf-8"
      )
    );

    const entryManifest = generateEntryManifest(clientManifest);

    expect(entryManifest).toMatchInlineSnapshot(`
      [
        {
          "isNested": false,
          "isPreload": true,
          "type": "style",
          "url": "/assets/client-entry-lazy-HASH.css",
          "weight": 1,
        },
        {
          "isNested": false,
          "isPreload": false,
          "type": "script",
          "url": "/assets/main-HASH.js",
          "weight": 1.9,
        },
      ]
    `);
  });
});

describe("generateRoutesManifest()", () => {
  it<LocalTestContext>("maps route ids to assets correctly", async ({
    vite,
  }) => {
    const lazyLoad = await vite.ssrLoadModule(
      path.join(__dirname, "..", "..", "__fixtures__/routes-lazy.tsx")
    );

    const routeIds = await getRoutesIds(vite, lazyLoad.routes);
    const clientManifest = JSON.parse(
      await fs.readFile(
        path.join(fixturesDir, "build-example/client/.vite/manifest.json"),
        "utf-8"
      )
    );

    const routeManifest = generateRoutesManifest(clientManifest, routeIds);

    expect(routeManifest).toMatchInlineSnapshot(`
      {
        "0-1": [
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/todos-HASH.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/todos-HASH.js",
            "weight": 2,
          },
        ],
        "0-1-0": [
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/todo-HASH.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/todo-HASH.js",
            "weight": 2,
          },
        ],
      }
    `);
  });
});
