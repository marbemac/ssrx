import * as path from 'path';
import { normalizePath } from 'vite';
import vitePkg from 'vite/package.json' assert { type: 'json' };

export type ConfigOpts = {
  root?: string;
  mode?: string;
  clientOutDir?: string;
  serverOutDir?: string;
  routesFile?: string;
  clientEntry?: string;
  serverFile?: string;
  shouldModulePreload?: boolean;
};

export class Config {
  public root: string;
  public mode: string;
  public readonly clientOutDir: string;
  public readonly serverOutDir: string;
  public readonly routesFile: string;
  public readonly clientEntry: string;
  public readonly serverFile: string;
  public readonly shouldModulePreload: boolean;

  constructor(opts: ConfigOpts) {
    this.root = normalizePath(opts.root || '');
    this.clientOutDir = opts.clientOutDir || 'dist/client';
    this.serverOutDir = opts.serverOutDir || 'dist/server';
    this.mode = opts.mode || 'development';

    this.routesFile = normalizePath(path.resolve(path.join(this.root, opts.routesFile || 'src/routes.ts')));

    this.clientEntry = normalizePath(path.resolve(path.join(opts.clientEntry || 'src/entry.client.tsx')));

    this.serverFile = normalizePath(path.resolve(path.join(opts.serverFile || 'src/server.ts')));

    this.shouldModulePreload = opts.shouldModulePreload || true;
  }

  get isDev() {
    return this.mode === 'development';
  }

  get isProd() {
    return this.mode === 'production';
  }

  get viteVersion() {
    return vitePkg.version;
  }

  get viteMajor() {
    return parseInt(this.viteVersion.split('.')[0]!);
  }
}
