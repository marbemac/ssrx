import { createMiddleware } from 'hono/factory';
import type { CookieOptions } from 'hono/utils/cookie';
import type { Session } from 'lucia';

import { auth } from '~api/auth.ts';
import { db } from '~api/db/client.ts';
import { deleteCookie, getCookie, setCookie } from '~api/utils/cookies.ts';

/**
 * The properties available on `c.var` in hono, or `ctx` in trpc.
 */
export type ReqCtx = {
  db: typeof db;

  getCookie: (key: string) => string | undefined;
  setCookie: (name: string, value: string, opt?: CookieOptions) => void;
  deleteCookie: (name: string, opt?: CookieOptions) => void;

  isAuthed: boolean;
  sessionId?: Session['sessionId'];
  user?: Omit<Session['user'], 'userId'> & { id: Session['userId'] };
};

export const createReqCtx = async (req: Request, responseHeaders: Headers): Promise<ReqCtx> => {
  /**
   * Auth/session info
   */
  const authRequest = auth.handleRequest(req);
  const session = await authRequest.validate();

  const isAuthed = !!session;
  const sessionId = session?.sessionId;
  let user;
  if (session?.user) {
    const { userId, ...rest } = session.user;
    user = { id: userId, ...rest };
  }

  return {
    /**
     * We're accessing db from req ctx rather than importing it directly because
     * this pattern is compatible with edge runtimes (db per request) if that's where
     * we end up wanting to deploy.
     */
    db,

    /**
     * Cookie helpers - these are particularly useful in the TRPC context
     */
    getCookie: key => getCookie(req, key),
    setCookie: (name, value, opt) => setCookie(responseHeaders, name, value, opt),
    deleteCookie: (name, opt) => deleteCookie(responseHeaders, name, opt),

    isAuthed,
    sessionId,
    user,
  };
};

export const reqCtxMiddleware = createMiddleware<{ Variables: ReqCtx }>(async (c, next) => {
  const ctx = await createReqCtx(c.req.raw, c.res.headers);

  c.set('db', ctx.db);
  c.set('getCookie', ctx.getCookie);
  c.set('setCookie', ctx.setCookie);
  c.set('deleteCookie', ctx.deleteCookie);

  c.set('isAuthed', ctx.isAuthed);
  c.set('sessionId', ctx.sessionId);
  if (ctx.user) {
    c.set('user', ctx.user);
  }

  await next();
});
