import type { ReactNode } from 'react';

declare global {
  namespace SSRx {
    interface Config {
      jsxElement: ReactNode;
    }
  }
}
