# bun-react-router

You must have bun installed: https://bun.sh/.

This example is the same as `react-router-simple`, except the server runtime (`src/server.ts`) is bun + elysia.

**Stack**

- client framework: `react`
- client routing: `react-router`
- rendering strategy: `sync`
- server framework: `elysia`
- server runtime: `bun`

**Usage**

All of these commands are expecting you to be in the root of this repo:

- dev: `yarn nx run bun-react-router:dev`
- build: `yarn nx run bun-react-router:build`
- start: `yarn nx run bun-react-router:start`
