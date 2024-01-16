import type { CookieOptions } from 'hono/utils/cookie';
import { parse, serialize } from 'hono/utils/cookie';

/**
 * Adapted from https://github.com/honojs/hono/blob/main/src/helper/cookie/index.ts#L15
 * to operate on generic `Request` instead of `hono.Context`
 */
export type GetCookie = (req: Request, key: string) => string | undefined;
export const getCookie: GetCookie = (req, key) => {
  const cookie = req.headers.get('Cookie');

  if (typeof key === 'string') {
    if (!cookie) return undefined;
    const obj = parse(cookie, key);
    return obj[key];
  }

  if (!cookie) return {};
  const obj = parse(cookie);

  return obj as any;
};

/**
 * Adapted from https://github.com/honojs/hono/blob/main/src/helper/cookie/index.ts#L46
 * to operate on generic `Request` instead of `hono.Context`
 */
export type SetCookie = (resHeaders: Headers, name: string, value: string, opt?: CookieOptions) => void;
export const setCookie: SetCookie = (resHeaders, name, value, opt) => {
  const cookie = serialize(name, value, opt);
  resHeaders.append('set-cookie', cookie);
};

export type DeleteCookie = (resHeaders: Headers, name: string, opt?: CookieOptions) => void;
export const deleteCookie: DeleteCookie = (resHeaders, name, opt) => {
  setCookie(resHeaders, name, '', { ...opt, maxAge: 0 });
};
