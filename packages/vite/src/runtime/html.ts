import { injectAssetsIntoHtml, serializeTags } from '../helpers/html.ts';
import type { AssetHtmlTag } from './assets.ts';
import { assetsForRequest } from './assets.ts';

export const injectReqAssetsIntoHtml = async (html: string, url: string): Promise<string> => {
  const htmlTags = await assetsForRequest(url);

  return injectAssetsIntoHtml(html, htmlTags);
};

export const renderAssetsToHtml = (tags: AssetHtmlTag[]) => {
  return serializeTags(tags);
};
