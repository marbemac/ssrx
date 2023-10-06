import type { AssetHtmlTag } from '@dete/vite/runtime';

export const renderAssets = (assets: AssetHtmlTag[]) => {
  return assets.map(a => renderAsset(a));
};

// export const renderAssets = (assets: AssetHtmlTag[]) => {
//   return <For each={assets}>{a => renderAsset(a)}</For>;
// };

const renderAsset = ({ tag, attrs, children }: AssetHtmlTag) => {
  switch (tag) {
    case 'script':
      if (attrs?.['src']) {
        return <script {...attrs} />;
      } else {
        return <script {...attrs} innerHTML={children || ''} />;
      }
    case 'link':
      return <link {...attrs} />;
    case 'style':
      return <style {...attrs} innerHTML={children || ''} />;
    default:
      console.warn('Unknown asset tag', tag);
      return null;
  }
};
