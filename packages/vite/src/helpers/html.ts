import type { AssetHtmlTag } from './routes.ts';

const unaryTags = new Set(['link', 'meta', 'base']);

function serializeTag({ tag, attrs, children }: AssetHtmlTag, indent: string = ''): string {
  if (unaryTags.has(tag)) {
    return `<${tag}${serializeAttrs(attrs)}>`;
  } else {
    return `<${tag}${serializeAttrs(attrs)}>${serializeTags(children, incrementIndent(indent))}</${tag}>`;
  }
}

export function serializeTags(tags?: AssetHtmlTag[] | string, indent: string = ''): string {
  if (typeof tags === 'string') {
    return tags;
  } else if (tags && tags.length) {
    return tags.map(tag => `${indent}${serializeTag(tag, indent)}\n`).join('');
  }

  return '';
}

function serializeAttrs(attrs: AssetHtmlTag['attrs']): string {
  let res = '';
  for (const key in attrs) {
    if (typeof attrs[key] === 'boolean') {
      res += attrs[key] ? ` ${key}` : ``;
    } else {
      res += ` ${key}=${JSON.stringify(attrs[key])}`;
    }
  }
  return res;
}

function incrementIndent(indent: string = '') {
  return `${indent}${indent[0] === '\t' ? '\t' : '  '}`;
}

export function mergeScriptTags(scriptTags: AssetHtmlTag[]): AssetHtmlTag | null {
  let async = false;
  let injectTo: AssetHtmlTag['injectTo'] | undefined = undefined;
  const children: string[] = [];

  for (const tag of scriptTags) {
    if (tag.attrs?.['async']) {
      async = true;
    }

    if (tag.injectTo && !injectTo) {
      injectTo = tag.injectTo;
    }

    if (tag.children) {
      children.push(tag.children);
    } else if (tag.attrs?.['src']) {
      children.push(`import("${tag.attrs?.['src']}");`);
    }
  }

  if (!children.length) return null;

  return {
    tag: 'script',
    injectTo,
    children: children.join('\n'),
    attrs: {
      type: 'module',
      ...(async ? { async: true } : {}),
    },
  };
}
