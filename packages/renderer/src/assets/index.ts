import { assetsPluginClient } from './plugin-client.ts';
import { assetsPluginServer } from './plugin-server.ts';

export const assetsPlugin = (import.meta.env.SSR ? assetsPluginServer : assetsPluginClient)!;
