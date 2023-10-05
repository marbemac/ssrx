import type { RadixRouter } from 'radix3';
import { createRouter } from 'radix3';

import type { Asset } from './helpers/routes';

export type RouteId = string;

export type RouteInfo = {
  path?: string;
  children?: RouteInfo[];
  lazy?: () => Promise<any>;
};

export type MatchedRoute = RouteInfo;

// export type GetMatchedRoutesFn = (url: string, routes: RouteInfo[]) => MatchedRoute[];

export type NormalizeExternalRoutesFn<ExternalRoutes> = (routes: ExternalRoutes, parentId?: string) => RouteInfo[];

export type RouterAdapter<ExternalRoutes> = {
  normalizeExternalRoutes: NormalizeExternalRoutesFn<ExternalRoutes>;
};

export type RouterOpts<ExternalRoutes> = {
  normalizeExternalRoutes: NormalizeExternalRoutesFn<ExternalRoutes>;
};

export class Router<ExternalRoutes> {
  private _normalizeExternalRoutes: NormalizeExternalRoutesFn<ExternalRoutes>;
  private _routes: RouteInfo[] = [];
  private _router: RadixRouter<Asset[]>;

  constructor(opts: RouterOpts<ExternalRoutes>) {
    this._normalizeExternalRoutes = opts.normalizeExternalRoutes;
    this._router = createRouter();
  }

  public setRoutes = (routes: ExternalRoutes) => {
    const normalizedRoutes = this._normalizeExternalRoutes(routes);

    this._routes = normalizedRoutes;
    // this._router = createRouter({ routes: assignRouteIds(normalizedRoutes) });
  };

  get routes() {
    return this._routes;
  }

  // public getMatchedRoutes = (url: string) => {
  //   return this._router.lookup(url) || [];
  // };
}
