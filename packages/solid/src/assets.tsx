import type { AssetHtmlTag } from '@ssrx/vite/runtime';

export const renderAssets = (assets: AssetHtmlTag[]) => {
  return assets.map(a => renderAsset(a));
};

const renderAsset = ({ tag, attrs, children }: AssetHtmlTag) => {
  switch (tag) {
    case 'script':
      if (attrs?.['src']) {
        return <script {...attrs} $ServerOnly />;
      } else {
        return <script {...attrs} innerHTML={children || ''} $ServerOnly />;
      }
    case 'link':
      return <link {...attrs} />;
    case 'style':
      return <style {...attrs} innerHTML={children || ''} $ServerOnly />;
    default:
      console.warn('Unknown asset tag', tag);
      return null;
  }
};
