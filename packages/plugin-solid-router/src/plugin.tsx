import { type RouteDefinition, Router, useRoutes } from '@solidjs/router';
import { defineRenderPlugin } from '@super-ssr/renderer-core';

export const PLUGIN_ID = 'solidRouter' as const;

export type SolidRouterPluginOpts = {
  routes: RouteDefinition;
};

export const solidRouterPlugin = ({ routes }: SolidRouterPluginOpts) => {
  return defineRenderPlugin({
    id: PLUGIN_ID,

    hooks: {
      'app:wrap':
        ({ req }) =>
        ({ children }) =>
          <Router url={req.url}>{children()}</Router>,

      'app:render': () => () => {
        const Routes = useRoutes(routes);

        return <Routes />;
      },
    },
  });
};
