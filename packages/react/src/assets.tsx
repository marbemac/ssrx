import type { AssetHtmlTag } from '@super-ssr/vite/runtime';

export const renderAssets = (assets: AssetHtmlTag[]) => {
  return assets.map((a, i) => renderAsset(a, i));
};

const renderAsset = ({ tag, attrs, children }: AssetHtmlTag, key: any) => {
  switch (tag) {
    case 'script':
      if (attrs?.['src']) {
        return <script {...attrs} key={attrs['src'] as string} />;
      } else {
        return (
          <script
            {...attrs}
            key={key}
            dangerouslySetInnerHTML={{
              __html: children || '',
            }}
          />
        );
      }
    case 'link':
      return <link {...attrs} key={key} />;
    case 'style':
      return <style {...attrs} key={key} dangerouslySetInnerHTML={{ __html: children || '' }} />;
    default:
      console.warn('Unknown asset tag', tag);
      return null;
  }
};
