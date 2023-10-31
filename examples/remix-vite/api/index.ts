import { Hono } from 'hono';

import { type ReqCtx, reqCtxMiddleware } from '~api/middleware/context.ts';
import { trpcServer } from '~api/middleware/trpc.ts';
import { appRouter } from '~api/trpc/index.ts';
import { deleteCookie, setCookie } from '~api/utils/cookies.ts';
import { TRPC_ROOT } from '~app';

type HonoEnv = { Variables: ReqCtx };

const server = new Hono<HonoEnv>();

/**
 * TRPC
 */
server
  .use(
    `/${TRPC_ROOT}/*`,
    reqCtxMiddleware,
    trpcServer<HonoEnv>({
      router: appRouter,
      endpoint: `/${TRPC_ROOT}`,
      createContext: ({ c, resHeaders }) => ({
        ...c.var,
        // trpc manages it's own headers, so use those in the cookie helpers
        setCookie: (...args) => setCookie(resHeaders, ...args),
        deleteCookie: (...args) => deleteCookie(resHeaders, ...args),
      }),
    }),
  )

  /**
   * Just quick demonstration that there is a natural way to mount a more public
   * facing API as needed. In real-world you'd likely break this out into a separate group
   * of routes that you mount to the /api root.
   */
  .get('/api/auth/me', reqCtxMiddleware, c => {
    return c.json(c.var.user ?? null);
  });

// /**
//  * The frontend app
//  */
// .get('*', reqCtxMiddleware, async c => {
//   try {
//     const appStream = await serverHandler({
//       req: c.req.raw,
//       meta: {
//         // used by @ssrx/plugin-trpc-react
//         trpcCaller: appRouter.createCaller(c.var),
//       },
//     });

//     return new Response(appStream);
//   } catch (err: any) {
//     /**
//      * Handle react-router redirects
//      */
//     if (err instanceof Response && err.status >= 300 && err.status <= 399) {
//       return c.redirect(err.headers.get('Location') || '/', err.status);
//     }

//     /**
//      * In development, pass the error back to the vite dev server to display in the
//      * error overlay
//      */
//     if (import.meta.env.DEV) return err;

//     throw err;
//   }
// });

export { server };
