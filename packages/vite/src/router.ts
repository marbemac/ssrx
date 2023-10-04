export type RouteId = string;

export type RouteInfo = {
  path?: string;
  children?: RouteInfo[];
  lazy?: () => Promise<any>;
};

export type IdentifiedRouteInfo = RouteInfo & {
  /**
   * Internally assigned identifier, used to match up routes with their manifest entries.
   */
  __id: RouteId;
};

export type MatchedRoute = IdentifiedRouteInfo;

export type GetMatchedRoutesFn = (url: string, routes: IdentifiedRouteInfo[]) => MatchedRoute[];

export type NormalizeExternalRoutesFn<ExternalRoutes> = (routes: ExternalRoutes, parentId?: string) => RouteInfo[];

export type RouterAdapter<ExternalRoutes> = {
  normalizeExternalRoutes: NormalizeExternalRoutesFn<ExternalRoutes>;
  getMatchedRoutes: GetMatchedRoutesFn;
};

export type RouterOpts<ExternalRoutes> = {
  normalizeExternalRoutes: NormalizeExternalRoutesFn<ExternalRoutes>;
  getMatchedRoutes: GetMatchedRoutesFn;
};

export class Router<ExternalRoutes> {
  private _normalizeExternalRoutes: NormalizeExternalRoutesFn<ExternalRoutes>;
  private _getMatchedRoutes: GetMatchedRoutesFn;
  private _routes: IdentifiedRouteInfo[] = [];

  constructor(opts: RouterOpts<ExternalRoutes>) {
    this._normalizeExternalRoutes = opts.normalizeExternalRoutes;
    this._getMatchedRoutes = opts.getMatchedRoutes;
  }

  public setRoutes = (routes: ExternalRoutes) => {
    const normalizedRoutes = this._normalizeExternalRoutes(routes);

    this._routes = assignRouteIds(normalizedRoutes);
  };

  get routes() {
    return this._routes;
  }

  public getMatchedRoutes = (url: string) => {
    return this._getMatchedRoutes(url, this.routes);
  };
}

const assignRouteIds = (routes: RouteInfo[], parentId?: string): IdentifiedRouteInfo[] => {
  return routes.map((r, index) => {
    const __id = parentId ? [parentId, index].join('-') : String(index);

    return {
      __id,
      ...r,
      children: r.children ? assignRouteIds(r.children, __id) : undefined,
    };
  });
};
