import { serializeTags } from '../helpers/html.ts';
import type { AssetHtmlTag } from './assets.server.ts';

export const renderAssetsToHtml = (tags: AssetHtmlTag[]) => {
  return serializeTags(tags);
};
