import * as fs from 'fs/promises';
import * as path from 'path';
import type { ViteDevServer } from 'vite';
import { createServer as createViteServer } from 'vite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { generateEntryManifest, generateRoutesManifest, getRoutesIds } from '../routes.ts';

type LocalTestContext = {
  vite: ViteDevServer;
};

const fixturesDir = path.join(__dirname, '..', '..', '__fixtures__');

beforeEach<LocalTestContext>(async ctx => {
  ctx.vite = await createViteServer({
    appType: 'custom',
    configFile: false,
    server: {
      middlewareMode: true,
    },
  });
});

afterEach<LocalTestContext>(async ctx => {
  await ctx.vite.close();
});

describe('getRoutesIds()', () => {
  it<LocalTestContext>('handles lazy nested layouts', async ({ vite }) => {
    const lazyLoad = await vite.ssrLoadModule(path.join(fixturesDir, 'lazy-route-tree', 'routes.tsx'));

    const routeIds = await getRoutesIds(vite, lazyLoad['routes']);

    expect(routeIds).toMatchInlineSnapshot(`
      {
        "/": [
          "src/__fixtures__/lazy-route-tree/pages/_index.tsx",
        ],
        "/admin": [
          "src/__fixtures__/lazy-route-tree/pages/admin.tsx",
          "src/__fixtures__/lazy-route-tree/pages/admin._index.tsx",
        ],
        "/admin/members": [
          "src/__fixtures__/lazy-route-tree/pages/admin.tsx",
          "src/__fixtures__/lazy-route-tree/pages/admin.members.tsx",
          "src/__fixtures__/lazy-route-tree/pages/admin.members._index.tsx",
        ],
        "/admin/members/:memberId": [
          "src/__fixtures__/lazy-route-tree/pages/admin.tsx",
          "src/__fixtures__/lazy-route-tree/pages/admin.members.tsx",
          "src/__fixtures__/lazy-route-tree/pages/admin.members.$memberId.tsx",
        ],
        "/lazy-component": [
          "src/__fixtures__/lazy-route-tree/pages/lazy-component.tsx",
        ],
      }
    `);
  });
});

describe('generateEntryManifest()', () => {
  it<LocalTestContext>('maps route ids to assets correctly', async () => {
    const clientManifest = JSON.parse(
      await fs.readFile(path.join(fixturesDir, 'lazy-route-tree/example-client-manifest.json'), 'utf-8'),
    );

    const entryManifest = generateEntryManifest(clientManifest as any);

    expect(entryManifest).toMatchInlineSnapshot(`
      [
        {
          "isNested": undefined,
          "isPreload": true,
          "type": "style",
          "url": "/assets/entry.client.css",
          "weight": 1,
        },
        {
          "isNested": undefined,
          "isPreload": undefined,
          "type": "script",
          "url": "/assets/main-.js",
          "weight": 1.9,
        },
      ]
    `);
  });
});

describe('generateRoutesManifest()', () => {
  it<LocalTestContext>('maps route ids to assets correctly', async ({ vite }) => {
    const lazyLoad = await vite.ssrLoadModule(path.join(fixturesDir, 'lazy-route-tree', 'routes.tsx'));

    const routeIds = await getRoutesIds(vite, lazyLoad['routes']);

    const clientManifest = JSON.parse(
      await fs.readFile(path.join(fixturesDir, 'lazy-route-tree/example-client-manifest.json'), 'utf-8'),
    );

    const routeManifest = generateRoutesManifest(clientManifest as any, routeIds);

    expect(routeManifest).toMatchInlineSnapshot(`
      {
        "/": [
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/_index.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/_index.js",
            "weight": 2.1,
          },
        ],
        "/admin": [
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/admin.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/admin.js",
            "weight": 2.1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/admin._index.js",
            "weight": 2.1,
          },
        ],
        "/admin/members": [
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/admin.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/admin.members.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/admin.members._index.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/admin.js",
            "weight": 2.1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/admin.members.js",
            "weight": 2.1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/admin.members._index.js",
            "weight": 2.1,
          },
        ],
        "/admin/members/:memberId": [
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/admin.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/admin.members.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/admin.members._memberId.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/admin.js",
            "weight": 2.1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/admin.members.js",
            "weight": 2.1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/admin.members._memberId.js",
            "weight": 2.1,
          },
        ],
        "/lazy-component": [
          {
            "isNested": false,
            "isPreload": true,
            "type": "style",
            "url": "/assets/_index.css",
            "weight": 1,
          },
          {
            "isNested": false,
            "isPreload": true,
            "type": "script",
            "url": "/assets/lazy-component.js",
            "weight": 2.1,
          },
          {
            "isNested": true,
            "isPreload": true,
            "type": "script",
            "url": "/assets/heavy-component.js",
            "weight": 2.2,
          },
        ],
      }
    `);
  });
});
