import { expect, it } from 'vitest';

import { tanstackRouterAdapter } from '../adapter.ts';
import { routeTree as lazyTreeSimple } from './fixtures/lazy-tree.tsx';

it('sets lazy fns correctly', async () => {
  const adapter = tanstackRouterAdapter();
  const routes = adapter.normalizeExternalRoutes(lazyTreeSimple);

  expect(routes).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "children": undefined,
            "lazy": [Function],
            "path": "",
          },
          {
            "children": undefined,
            "lazy": [Function],
            "path": "expensive",
          },
          {
            "children": undefined,
            "lazy": undefined,
            "path": "users/:userId",
          },
          {
            "children": [
              {
                "children": undefined,
                "lazy": undefined,
                "path": "",
              },
            ],
            "lazy": [Function],
            "path": "blog",
          },
          {
            "children": undefined,
            "lazy": undefined,
            "path": "catch-all-1/**",
          },
          {
            "children": undefined,
            "lazy": undefined,
            "path": "catch-all-2/**",
          },
        ],
        "lazy": undefined,
        "path": undefined,
      },
    ]
  `);
});
