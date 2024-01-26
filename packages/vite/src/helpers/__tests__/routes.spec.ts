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

  it<LocalTestContext>('handles absolute route paths', async ({ vite }) => {
    const lazyLoad = await vite.ssrLoadModule(path.join(fixturesDir, 'lazy-route-tree', 'absolute-routes.tsx'));

    const routeIds = await getRoutesIds(vite, lazyLoad['routes']);

    expect(routeIds).toMatchInlineSnapshot(`
      {
        "/": [
          "src/__fixtures__/lazy-route-tree/pages/_index.tsx",
        ],
        "/admin/logs": [
          "src/__fixtures__/lazy-route-tree/pages/lazy-component.tsx",
        ],
        "/lazy-component": [
          "src/__fixtures__/lazy-route-tree/pages/lazy-component.tsx",
        ],
        "/secret-admin/members": [
          "src/__fixtures__/lazy-route-tree/pages/admin.members.tsx",
          "src/__fixtures__/lazy-route-tree/pages/admin.members._index.tsx",
        ],
        "/secret-admin/members/:memberId": [
          "src/__fixtures__/lazy-route-tree/pages/admin.members.tsx",
          "src/__fixtures__/lazy-route-tree/pages/admin.members.$memberId.tsx",
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

  it<LocalTestContext>('handles circular manifests', async () => {
    const clientManifest = JSON.parse(
      await fs.readFile(path.join(fixturesDir, 'circular-client-manifest.json'), 'utf-8'),
    );

    const entryManifest = generateEntryManifest(clientManifest as any);

    expect(entryManifest).toMatchInlineSnapshot(`
      [
        {
          "isNested": undefined,
          "isPreload": true,
          "type": "style",
          "url": "/assets/entry.client-9qVV4rFd.css",
          "weight": 1,
        },
        {
          "isNested": undefined,
          "isPreload": undefined,
          "type": "script",
          "url": "/assets/client-entry-BhGTKJvg.js",
          "weight": 1.9,
        },
        {
          "isNested": true,
          "isPreload": true,
          "type": "script",
          "url": "/assets/vendor-rendering-2BjEJ2Ip.js",
          "weight": 2.1,
        },
        {
          "isNested": true,
          "isPreload": true,
          "type": "script",
          "url": "/assets/vendor-g216hCHz.js",
          "weight": 2.1,
        },
        {
          "isNested": true,
          "isPreload": true,
          "type": "script",
          "url": "/assets/vendor-ssrx-Nzu2mXrL.js",
          "weight": 2.1,
        },
        {
          "isNested": true,
          "isPreload": true,
          "type": "script",
          "url": "/assets/vendor-router-v1g7o7ah.js",
          "weight": 2.1,
        },
        {
          "isNested": true,
          "isPreload": true,
          "type": "script",
          "url": "/assets/vendor-ui-gdHMG9_3.js",
          "weight": 2.1,
        },
        {
          "isNested": true,
          "isPreload": true,
          "type": "script",
          "url": "/assets/vendor-icons-BMU1CElp.js",
          "weight": 2.1,
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
        "/": {
          "assets": [
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
        },
        "/admin": {
          "assets": [
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
        },
        "/admin/members": {
          "assets": [
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
        },
        "/admin/members/:memberId": {
          "assets": [
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
        },
        "/lazy-component": {
          "assets": [
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
        },
      }
    `);
  });

  it<LocalTestContext>('does not include duplicates when nested route depends on the same asset as its parent', async () => {
    const routeIds = {
      '/one': ['src/routes/one.tsx'],
      '/one/two': ['src/routes/one.tsx', 'src/routes/one.two.tsx'],
    };

    const clientManifest = {
      'utils.js': { file: 'assets/utils.js' },
      'src/entry.client.tsx': {
        dynamicImports: ['src/routes/one.tsx', 'src/routes/one.two.tsx'],
        file: 'assets/client-entry.js',
        isEntry: true,
        src: 'src/entry.client.tsx',
      },
      'src/routes/one.tsx': {
        file: 'assets/one.js',
        imports: ['src/entry.client.tsx', 'utils.js'],
        isDynamicEntry: true,
        src: 'src/routes/one.tsx',
      },
      'src/routes/one.two.tsx': {
        file: 'assets/one.two.js',
        imports: ['src/entry.client.tsx', 'utils.js'],
        isDynamicEntry: true,
        src: 'src/routes/one.two.tsx',
      },
    };

    const routeManifest = generateRoutesManifest(clientManifest as any, routeIds);

    expect(routeManifest).toMatchInlineSnapshot(`
      {
        "/one": {
          "assets": [
            {
              "isNested": false,
              "isPreload": true,
              "type": "script",
              "url": "/assets/one.js",
              "weight": 2.1,
            },
            {
              "isNested": true,
              "isPreload": true,
              "type": "script",
              "url": "/assets/utils.js",
              "weight": 2.1,
            },
          ],
        },
        "/one/two": {
          "assets": [
            {
              "isNested": false,
              "isPreload": true,
              "type": "script",
              "url": "/assets/one.js",
              "weight": 2.1,
            },
            {
              "isNested": false,
              "isPreload": true,
              "type": "script",
              "url": "/assets/one.two.js",
              "weight": 2.1,
            },
            {
              "isNested": true,
              "isPreload": true,
              "type": "script",
              "url": "/assets/utils.js",
              "weight": 2.1,
            },
          ],
        },
      }
    `);
  });
});
