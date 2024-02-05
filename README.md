# 🚀 Welcome to SSRx

SSRx provides the missing pieces required to create SSR apps with Vite and your third party libraries of choice. It is
framework agnostic on the client and the server - use React, Solid, Hono, H3, Cloudflare, Bun, you name it.

SSRx is split into two parts that can be used independently, or together.

**[`@ssrx/vite`](/packages/vite/README.md)**

A Vite plugin to improve the DX of developing SSR apps.

**[`@ssrx/renderer`](/packages/renderer/README.md)**

Establishes some patterns to hook into the lifecycle of streaming SSR apps in a framework/library agnostic way. A
handful of renderer plugins for common libraries are maintained in this repo.

Use this if you are looking for ways to integrate libraries like Tanstack Query, Unhead, tRPC, etc, into your streaming
SSR application.
