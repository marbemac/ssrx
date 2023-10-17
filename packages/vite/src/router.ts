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
  exportName: string;
  normalizeExternalRoutes: NormalizeExternalRoutesFn<ExternalRoutes>;
};

export type RouterOpts<ExternalRoutes> = {
  adapter: RouterAdapter<ExternalRoutes>;
};

export class Router<ExternalRoutes> {
  #routes: RouteInfo[] = [];
  // #router: RadixRouter<Asset[]>;
  #adapter: RouterAdapter<ExternalRoutes>;

  constructor(opts: RouterOpts<ExternalRoutes>) {
    this.#adapter = opts.adapter;
    // this.#router = createRouter();
  }

  public setRoutes = (routesModule?: unknown) => {
    if (!routesModule || typeof routesModule !== 'object') {
      throw new Error('Invalid routes file');
    }

    // @ts-expect-error ignore
    const externalRoutes = routesModule[this.#adapter.exportName];
    if (!externalRoutes || typeof externalRoutes !== 'object') {
      throw new Error(`The '${this.#adapter.exportName}' export in the routes file must be an object`);
    }

    const normalizedRoutes = this.#adapter.normalizeExternalRoutes(externalRoutes);

    this.#routes = normalizedRoutes;
    // this._router = createRouter({ routes: assignRouteIds(normalizedRoutes) });
  };

  get routes() {
    return this.#routes;
  }

  // public getMatchedRoutes = (url: string) => {
  //   return this._router.lookup(url) || [];
  // };
}
