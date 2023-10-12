/*!
 * Adapted from code by Yuxi (Evan) You and Vite contributors
 * MIT Licensed, Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors
 *
 * https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/html.ts
 */

import type { AssetHtmlTag } from './routes.ts';

export const injectAssetsIntoHtml = (html: string, tags: AssetHtmlTag[]): string => {
  const headTags: AssetHtmlTag[] = [];
  const headPrependTags: AssetHtmlTag[] = [];
  const bodyTags: AssetHtmlTag[] = [];
  const bodyPrependTags: AssetHtmlTag[] = [];

  for (const tag of tags) {
    if (tag.injectTo === 'body') {
      bodyTags.push(tag);
    } else if (tag.injectTo === 'body-prepend') {
      bodyPrependTags.push(tag);
    } else if (tag.injectTo === 'head') {
      headTags.push(tag);
    } else {
      headPrependTags.push(tag);
    }
  }

  html = injectToHead(html, headPrependTags, true);
  html = injectToHead(html, headTags);
  html = injectToBody(html, bodyPrependTags, true);
  html = injectToBody(html, bodyTags);

  return html;
};

const headInjectRE = /([ \t]*)<\/head>/i;
const headPrependInjectRE = /([ \t]*)<head[^>]*>/i;

const htmlInjectRE = /<\/html>/i;
const htmlPrependInjectRE = /([ \t]*)<html[^>]*>/i;

const bodyInjectRE = /([ \t]*)<\/body>/i;
const bodyPrependInjectRE = /([ \t]*)<body[^>]*>/i;

const doctypePrependInjectRE = /<!doctype html>/i;

function injectToHead(html: string, tags: AssetHtmlTag[], prepend = false) {
  if (tags.length === 0) return html;

  if (prepend) {
    // inject as the first element of head
    if (headPrependInjectRE.test(html)) {
      return html.replace(headPrependInjectRE, (match, p1) => `${match}\n${serializeTags(tags, incrementIndent(p1))}`);
    }
  } else {
    // inject before head close
    if (headInjectRE.test(html)) {
      // respect indentation of head tag
      return html.replace(headInjectRE, (match, p1) => `${serializeTags(tags, incrementIndent(p1))}${match}`);
    }
    // try to inject before the body tag
    if (bodyPrependInjectRE.test(html)) {
      return html.replace(bodyPrependInjectRE, (match, p1) => `${serializeTags(tags, p1)}\n${match}`);
    }
  }
  // if no head tag is present, we prepend the tag for both prepend and append
  return prependInjectFallback(html, tags);
}

function injectToBody(html: string, tags: AssetHtmlTag[], prepend = false) {
  if (tags.length === 0) return html;

  if (prepend) {
    // inject after body open
    if (bodyPrependInjectRE.test(html)) {
      return html.replace(bodyPrependInjectRE, (match, p1) => `${match}\n${serializeTags(tags, incrementIndent(p1))}`);
    }
    // if no there is no body tag, inject after head or fallback to prepend in html
    if (headInjectRE.test(html)) {
      return html.replace(headInjectRE, (match, p1) => `${match}\n${serializeTags(tags, p1)}`);
    }
    return prependInjectFallback(html, tags);
  } else {
    // inject before body close
    if (bodyInjectRE.test(html)) {
      return html.replace(bodyInjectRE, (match, p1) => `${serializeTags(tags, incrementIndent(p1))}${match}`);
    }
    // if no body tag is present, append to the html tag, or at the end of the file
    if (htmlInjectRE.test(html)) {
      return html.replace(htmlInjectRE, `${serializeTags(tags)}\n$&`);
    }
    return html + `\n` + serializeTags(tags);
  }
}

function prependInjectFallback(html: string, tags: AssetHtmlTag[]) {
  // prepend to the html tag, append after doctype, or the document start
  if (htmlPrependInjectRE.test(html)) {
    return html.replace(htmlPrependInjectRE, `$&\n${serializeTags(tags)}`);
  }
  if (doctypePrependInjectRE.test(html)) {
    return html.replace(doctypePrependInjectRE, `$&\n${serializeTags(tags)}`);
  }
  return serializeTags(tags) + html;
}

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
