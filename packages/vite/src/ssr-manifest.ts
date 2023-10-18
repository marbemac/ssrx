import * as fs from 'fs';
import * as path from 'path';
import type { IndexHtmlTransformHook, ViteDevServer } from 'vite';

import type { Config } from './config.ts';
import type { Asset, SSRManifest, ViteClientManifest } from './helpers/routes.ts';
import {
  assetsToHtml,
  assetsToTags,
  AssetType,
  buildAssetUrl,
  emptySSRManifest,
  generateSSRManifest,
  getAssetWeight,
  getRoutesIds,
} from './helpers/routes.ts';
import { findStylesInModuleGraph } from './helpers/vite.ts';
import type { MatchedRoute, Router } from './router.ts';

type ManifestOpts<ExternalRoutes> = {
  router: Router<ExternalRoutes>;
  config: Config;
  viteServer?: ViteDevServer;
};

export class Manifest<ExternalRoutes> {
  private router: Router<ExternalRoutes>;
  private config: Config;
  private viteServer?: ViteDevServer;

  #clientManifest?: ViteClientManifest;
  readonly clientManifestName = 'manifest.json';

  #ssrManifest?: SSRManifest;
  readonly ssrManifestName = 'ssr-manifest.json';

  constructor(opts: ManifestOpts<ExternalRoutes>) {
    this.router = opts.router;
    this.config = opts.config;
    this.viteServer = opts.viteServer;
  }

  public setViteServer(viteDevServer: ViteDevServer) {
    this.viteServer = viteDevServer;
  }

  public async getAssetsHtml(url: string) {
    const assets = await this.getAssets(url);

    return assetsToHtml(assets, {
      isDev: this.config.isDev,
      shouldModulePreload: this.config.shouldModulePreload,
    });
  }

  public async getAssetsHtmlTags(url: string) {
    const assets = await this.getAssets(url);

    return assetsToTags(assets, {
      isDev: this.config.isDev,
      shouldModulePreload: this.config.shouldModulePreload,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getAssets(url: string) {
    // const routeMatches = this.router.getMatchedRoutes(url);

    /**
     * @TODO scope assets down to the matched route during dev
     */
    if (this.config.isDev) {
      return this.#getAssetsDev([]);
    }

    throw new Error('not implemented');
  }

  get ssrManifest(): SSRManifest {
    return this.#ssrManifest || { ...emptySSRManifest };
  }

  public async buildSSRManifest({ writeToDisk }: { writeToDisk?: boolean } = {}): Promise<SSRManifest> {
    const viteServer = this.viteServer;
    if (!viteServer) {
      throw new Error('Cannot call buildRoutesManifest() without a vite server');
    }

    const clientManifest = this.#loadClientManifest();
    const routes = this.router.routes;
    const routeIds = await getRoutesIds(viteServer, routes);
    const ssrManifest = generateSSRManifest(clientManifest, routeIds);

    if (writeToDisk) {
      fs.writeFileSync(this.#ssrManifestPath, JSON.stringify(ssrManifest, null, 2), 'utf-8');
    }

    this.#ssrManifest = ssrManifest;

    return ssrManifest;
  }

  public async getVitePluginAssets(requestUrl: string = '/') {
    const server = this.viteServer;
    if (!server) return [];

    const plugins = server.config.plugins.filter(plugin => 'transformIndexHtml' in plugin);

    const pluginAssets = [];
    for (const plugin of plugins) {
      const hook = plugin!.transformIndexHtml;

      const handler: IndexHtmlTransformHook =
        typeof hook === 'function'
          ? hook
          : // @ts-expect-error ignore
            hook.handler ?? hook.transform;

      const transformedHtml = await handler(``, { path: requestUrl, server, filename: 'index.html' });

      if (!transformedHtml) continue;

      if (Array.isArray(transformedHtml)) {
        pluginAssets.push(...transformedHtml);
      } else if (typeof transformedHtml === 'string') {
        console.warn(`getVitePluginAssets() transformHtml string response not supported from plugin ${plugin.name}`);
        continue;
      } else if (transformedHtml.tags) {
        pluginAssets.push(...(transformedHtml.tags ?? []));
      }
    }

    return pluginAssets.map((asset, index) => {
      return {
        ...asset,
        attrs: {
          ...asset.attrs,
          key: `plugin-${index}`,
        },
      };
    });
  }

  #loadClientManifest(): ViteClientManifest {
    if (this.#clientManifest) return this.#clientManifest;

    if (!fs.existsSync(this.#clientManifestPath)) {
      throw new Error(
        `Could not load client manifest at '${this.#clientManifestPath}', did you forget to build the client first?`,
      );
    }

    this.#clientManifest = JSON.parse(fs.readFileSync(this.#clientManifestPath, 'utf-8')) as ViteClientManifest;

    return this.#clientManifest!;
  }

  get #clientManifestPath(): string {
    return path.resolve(
      this.config.root,
      this.config.viteMajor < 5
        ? `${this.config.clientOutDir}/${this.clientManifestName}`
        : `${this.config.clientOutDir}/.vite/${this.clientManifestName}`,
    );
  }

  get #ssrManifestPath(): string {
    return path.resolve(this.config.root, `${this.config.serverOutDir}/${this.ssrManifestName}`);
  }

  /**
   * @TODO actually use these routeMatches to scope down the assets in dev
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async #getAssetsDev(routeMatches: MatchedRoute[]): Promise<Asset[]> {
    const devServer = this.viteServer;
    if (!devServer) {
      throw new Error('Cannot call getAssetsDev() without a vite server');
    }

    const assets: Asset[] = [];

    // push the vite dev entry
    assets.push({
      type: AssetType.script,
      url: buildAssetUrl('/@vite/client', this.config.basePath),
      weight: getAssetWeight('script.js'),
    });

    // push the main entry
    assets.push({
      type: AssetType.script,
      url: buildAssetUrl(this.config.clientEntry, this.config.basePath),
      weight: getAssetWeight(this.config.clientEntry),
    });

    // styles
    const styleAssets = await findStylesInModuleGraph(devServer, [this.config.clientFile], false);
    assets.push(...Object.values(styleAssets));

    return assets;
  }
}
