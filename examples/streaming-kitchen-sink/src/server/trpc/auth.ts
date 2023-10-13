import { wrap } from '@decs/typeschema';
import type { CookieOptions } from 'hono/utils/cookie';
import { LuciaError } from 'lucia';
import { maxLength, minLength, object, string } from 'valibot';

import { auth } from '~/server/auth.ts';
import { createDbId } from '~/server/db/ids.ts';
import { protectedProcedure, publicProcedure, router } from '~/server/trpc/trpc.ts';

const SignupSchema = object({
  username: string([minLength(4), maxLength(31)]),
  password: string([minLength(6), maxLength(100)]),
});

const LoginSchema = SignupSchema;

export const authRouter = router({
  signup: publicProcedure.input(wrap(SignupSchema)).mutation(async ({ input, ctx }) => {
    const { username, password } = input;

    const user = await auth.createUser({
      userId: `u_${createDbId()}`,
      key: {
        providerId: 'username', // auth method
        providerUserId: username.toLowerCase(), // unique id when using "username" auth method
        password, // hashed by Lucia
      },
      attributes: {
        username,
      },
    });

    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });

    const sessionCookie = auth.createSessionCookie(session);
    const { sameSite, ...cookieAttrs } = sessionCookie.attributes;
    ctx.setCookie(sessionCookie.name, sessionCookie.value, { ...cookieAttrs, sameSite: sameSiteLuciaToHono(sameSite) });
  }),

  login: publicProcedure.input(wrap(LoginSchema)).mutation(async ({ input, ctx }) => {
    const { username, password } = input;

    try {
      // find user by key
      // and validate password
      const key = await auth.useKey('username', username.toLowerCase(), password);

      const session = await auth.createSession({
        userId: key.userId,
        attributes: {},
      });

      const sessionCookie = auth.createSessionCookie(session);
      const { sameSite, ...cookieAttrs } = sessionCookie.attributes;
      ctx.setCookie(sessionCookie.name, sessionCookie.value, {
        ...cookieAttrs,
        sameSite: sameSiteLuciaToHono(sameSite),
      });
    } catch (e) {
      if (e instanceof LuciaError && (e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')) {
        // user does not exist
        // or invalid password
        return new Response('Incorrect username or password', {
          status: 400,
        });
      }

      return new Response('An unknown error occurred', {
        status: 500,
      });
    }
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // make sure to invalidate the current session!
    await auth.invalidateSession(ctx.sessionId);

    // create blank session cookie
    const sessionCookie = auth.createSessionCookie(null);

    const { sameSite, ...cookieAttrs } = sessionCookie.attributes;
    ctx.deleteCookie(sessionCookie.name, { ...cookieAttrs, sameSite: sameSiteLuciaToHono(sameSite) });
  }),
});

/**
 * Similar to https://github.com/lucia-auth/lucia/blob/f714949c0d0841b7419170ad7193ba1fcc4404a4/packages/lucia/src/utils/cookie.ts#L107
 * Unfortunately that function is not available, so we're replicating it here
 */
type LuciaSameSite = true | false | 'lax' | 'strict' | 'none' | undefined;
const sameSiteLuciaToHono = (sameSite: LuciaSameSite): CookieOptions['sameSite'] | undefined => {
  if (!sameSite) return undefined;

  const ss = typeof sameSite === 'string' ? sameSite.toLowerCase() : sameSite;

  if (ss === true || ss === 'strict') return 'Strict';
  if (ss === 'lax') return 'Lax';
  if (ss === 'none') return 'None';

  throw new Error(`option sameSite of ${sameSite} is invalid`);
};
