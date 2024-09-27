import './namespace.ts';

import { createAppClient } from './handler-client.tsx';
import { createAppServer } from './handler-server.tsx';

export const createApp = (import.meta.env.SSR ? createAppServer : createAppClient)!;
