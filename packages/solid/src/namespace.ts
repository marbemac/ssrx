import type { JSXElement } from 'solid-js';

declare global {
  namespace SSRx {
    interface Config {
      jsxElement: JSXElement;
    }
  }
}
