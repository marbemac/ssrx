import type { ViteDevServer } from 'vite';

export const getModuleBySsrReference = async (vite: ViteDevServer, mod: unknown) => {
  for (const [id, value] of vite.moduleGraph.idToModuleMap.entries()) {
    if (!value.ssrModule) {
      await vite.ssrLoadModule(id);
    }

    if (value.ssrModule === mod) return id;
  }

  return null;
};
