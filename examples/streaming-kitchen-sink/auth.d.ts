/// <reference types="lucia" />

declare namespace Lucia {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type Auth = import('~server/auth.ts').Auth;

  type DatabaseUserAttributes = {
    username: string;
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  type DatabaseSessionAttributes = {};
}
