import type { EntryContext } from '@remix-run/react/dist/entry';
import type { ReactNode } from 'react';

declare global {
  namespace SSRx {
    interface Config {
      jsxElement: ReactNode;
    }

    interface ReqMeta {
      entryContext: EntryContext;
    }
  }
}
