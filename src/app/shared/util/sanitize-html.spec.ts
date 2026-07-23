import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitize-html';

describe('sanitizeHtml', () => {
  it('strips script tags', () => {
    const out = sanitizeHtml('<p>Hola</p><script>alert(1)</script>');
    expect(out).toContain('<p>Hola</p>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert');
  });

  it('strips event handlers', () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)" />');
    expect(out).not.toContain('onerror');
    expect(out).not.toContain('alert');
  });

  it('allows safe youtube iframe and blocks javascript: urls', () => {
    const ok = sanitizeHtml(
      '<iframe src="https://www.youtube.com/embed/abc" allowfullscreen></iframe>',
    );
    expect(ok).toContain('youtube.com');

    const bad = sanitizeHtml('<iframe src="javascript:alert(1)"></iframe>');
    expect(bad).not.toContain('javascript:');
    expect(bad).not.toContain('alert');
  });

  it('keeps formatting tags used by the editor', () => {
    const out = sanitizeHtml(
      '<h2>Título</h2><p><strong>bold</strong> y <a href="https://example.com">link</a></p><ul><li>uno</li></ul>',
    );
    expect(out).toContain('<h2>');
    expect(out).toContain('<strong>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('<li>');
  });
});
