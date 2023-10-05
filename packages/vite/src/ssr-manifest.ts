import * as fs from 'fs';
import * as path from 'path';
import type { ViteDevServer } from 'vite';

import type { Config } from './config.ts';
import type { Asset, SSRManifest, ViteClientManifest } from './helpers/routes.ts';
import { assetsToHtml, assetsToTags, emptySSRManifest, generateSSRManifest, getRoutesIds } from './helpers/routes.ts';
import type { MatchedRoute, Router } from './router.ts';
import { findStylesInModuleGraph } from './ssr-manifest-dev.ts';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async #getAssetsDev(routeMatches: MatchedRoute[]): Promise<Asset[]> {
    const devServer = this.viteServer;
    if (!devServer) {
      throw new Error('Cannot call getAssetsDev() without a dev server');
    }

    const clientEntryId = this.config.clientEntry;

    const assets = await findStylesInModuleGraph(devServer, [clientEntryId], false);

    return Object.values(assets);
  }
}
