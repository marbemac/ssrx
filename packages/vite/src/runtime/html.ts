import { injectAssetsIntoHtml } from '../helpers/html.ts';
import { assetsForRequest } from './assets.ts';

export const injectReqAssetsIntoHtml = async (html: string, url: string): Promise<string> => {
  const htmlTags = await assetsForRequest(url);

  return injectAssetsIntoHtml(html, htmlTags);
};
