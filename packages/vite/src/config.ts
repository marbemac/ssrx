import * as path from 'path';
import { normalizePath } from 'vite';
import vitePkg from 'vite/package.json' assert { type: 'json' };

import type { ServerRuntime } from './types';

export type ConfigOpts = {
  root?: string;
  mode?: string;
  basePath?: string;
  clientOutDir?: string;
  serverOutDir?: string;
  routesFile?: string;
  clientEntry?: string;
  serverFile?: string;
  shouldModulePreload?: boolean;
  runtime?: ServerRuntime;
};

const RUNTIME_CONDITIONS: Record<ServerRuntime, string[]> = {
  bun: ['bun', 'node', 'import'],
  deno: ['deno', 'node', 'import'],
  edge: ['workerd', 'worker', 'edge'],
  node: ['node', 'import'],
};

export class Config {
  public root: string;
  public mode: string;

  public readonly clientOutDir: string;
  public readonly serverOutDir: string;
  public readonly routesFile: string;

  // relative path to client entry, as it is passed in by end user
  public readonly clientEntry: string;

  // absolute path to the client entry file
  public readonly clientFile: string;

  public readonly serverFile: string;
  public readonly shouldModulePreload: boolean;
  public readonly runtime: ServerRuntime;

  #basePath: string = '';

  constructor(opts: ConfigOpts) {
    this.root = normalizePath(opts.root || '');
    this.mode = opts.mode || 'development';
    this.basePath = opts.basePath || '/';

    this.clientOutDir = opts.clientOutDir || 'dist/client';
    this.serverOutDir = opts.serverOutDir || 'dist/server';
    this.runtime = opts.runtime || 'node';

    this.routesFile = normalizePath(path.resolve(path.join(this.root, opts.routesFile || 'src/routes.ts')));

    this.clientEntry = opts.clientEntry || 'src/entry.client.tsx';
    this.clientFile = normalizePath(path.resolve(path.join(this.clientEntry)));

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

  get runtimeConditions() {
    return RUNTIME_CONDITIONS[this.runtime];
  }

  get basePath() {
    return this.#basePath;
  }

  /**
   * Normalize basePath when we set it. Vite sometimes adds slash at the end turning /foo into /foo/, or //foo etc.
   * We want to make sure basePath is always normalized to /foo.
   */
  set basePath(val: string) {
    // strip leading and trailing slashes
    let bp = val ? `/${val.replace(/^\/+|\/+$/g, '')}` : '';

    // if basePath is root /, set it to empty string
    bp = bp === '/' ? '' : bp;

    this.#basePath = bp;
  }
}
