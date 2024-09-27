import './namespace.ts';

import { createAppClient } from './handler-client.ts';
import { createAppServer } from './handler-server.ts';
export { renderAssets } from './assets.tsx';

export const createApp = (import.meta.env.SSR ? createAppServer : createAppClient)!;
