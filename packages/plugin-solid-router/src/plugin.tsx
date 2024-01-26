import type { RouterProps } from '@solidjs/router';
import { Router } from '@solidjs/router';
import { defineRenderPlugin } from '@ssrx/renderer';

export const PLUGIN_ID = 'solidRouter' as const;

declare global {
  namespace SSRx {
    interface RenderProps extends RouterProps {}
  }
}

export const solidRouterPlugin = () => {
  return defineRenderPlugin({
    id: PLUGIN_ID,

    hooks: {
      'app:render': ({ req, renderProps }) => {
        return () => <Router url={req.url} {...renderProps} />;
      },
    },
  });
};
