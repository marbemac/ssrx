# streaming-kitchen-sink

**Features**

- [x] Typesafe routing
- [x] HMR on the server and the client
- [x] Typesafe, isomorphic data fetching on the server and the client
- [x] Data pre-fetching to minimize request waterfalls
- [x] Code-split routes with asset pre-loading on first load
- [x] Request streaming with optional defer for critical queries

**Stack**

- client framework: `react`
- client routing: `react-router` + `react-router-typesafe-routes`
- component library: `shadui`
- metatag management: `unhead`
- rendering strategy: `streaming` (via `@super-ssr/react`)
- server framework: `hono`
- server runtime: `node`
- data fetching: `@tanstack/query` + `trpc`
- db orm + migrations: `drizzle-orm` + `sqlite`
- auth: `lucia`

**Usage**

All of these commands are expecting you to be in the root of this repo:

- dev: `yarn nx run streaming-kitchen-sink:dev`
- build: `yarn nx run streaming-kitchen-sink:build`
- start: `yarn nx run streaming-kitchen-sink:start`
