import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'a',
  'b',
  'strong',
  'i',
  'em',
  'u',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
  'iframe',
  'div',
  'span',
  'figure',
  'figcaption',
  'hr',
];

const ALLOWED_ATTR = [
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'title',
  'width',
  'height',
  'class',
  'colspan',
  'rowspan',
  'frameborder',
  'allow',
  'allowfullscreen',
  'loading',
];

const IFRAME_HOST_ALLOWLIST = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'www.google.com',
];

function isSafeIframeSrc(src: string): boolean {
  try {
    const url = new URL(src, 'https://example.invalid');
    if (url.protocol !== 'https:') return false;
    return IFRAME_HOST_ALLOWLIST.includes(url.hostname);
  } catch {
    return false;
  }
}

/** Sanitiza HTML de producto/admin antes de renderizar en el cliente. */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['allowfullscreen'],
    FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
    SAFE_FOR_TEMPLATES: true,
    RETURN_DOM: false,
  }).replace(/<iframe\b[^>]*>/gi, (tag) => {
    const srcMatch = /\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
    const src = srcMatch?.[2] ?? srcMatch?.[3] ?? srcMatch?.[4] ?? '';
    if (!src || !isSafeIframeSrc(src)) {
      return '';
    }
    return tag;
  });
}
