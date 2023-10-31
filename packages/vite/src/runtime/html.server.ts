import { injectAssetsIntoHtml, serializeTags } from '../helpers/html.ts';
import type { AssetHtmlTag } from './assets.server.ts';
import { assetsForRequest } from './assets.server.ts';

export const injectReqAssetsIntoHtml = async (html: string, url: string): Promise<string> => {
  const htmlTags = await assetsForRequest(url);

  return injectAssetsIntoHtml(html, htmlTags);
};

export const renderAssetsToHtml = (tags: AssetHtmlTag[]) => {
  return serializeTags(tags);
};
