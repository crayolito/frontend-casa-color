import { describe, expect, it } from 'vitest';
import { whatsappHref } from './whatsapp';

describe('whatsappHref', () => {
  it('returns empty for null or undefined', () => {
    expect(whatsappHref(undefined)).toBe('');
    expect(whatsappHref(null)).toBe('');
  });

  it('returns empty when disabled', () => {
    expect(whatsappHref({ enabled: false, phone: '59170000000' })).toBe('');
  });

  it('returns empty when phone is missing or blank', () => {
    expect(whatsappHref({ enabled: true })).toBe('');
    expect(whatsappHref({ enabled: true, phone: '   ' })).toBe('');
  });

  it('returns empty when phone has no digits', () => {
    expect(whatsappHref({ enabled: true, phone: '---' })).toBe('');
  });

  it('sanitizes phone to digits only', () => {
    const href = whatsappHref({
      enabled: true,
      phone: '591-2242-1800',
      message: 'Hola',
    });
    expect(href).toContain('wa.me/59122421800');
  });

  it('encodes message when present', () => {
    const href = whatsappHref({
      enabled: true,
      phone: '59170000000',
      message: 'Hola, me interesa Pinturas & Acabados',
    });
    expect(href).toBe(
      'https://wa.me/59170000000?text=' +
        encodeURIComponent('Hola, me interesa Pinturas & Acabados'),
    );
  });

  it('omits text param when message is empty', () => {
    expect(whatsappHref({ enabled: true, phone: '59170000000' })).toBe(
      'https://wa.me/59170000000',
    );
  });

  it('prefers extraText over the configured message', () => {
    const href = whatsappHref(
      { enabled: true, phone: '59170000000', message: 'Hola' },
      'Hola, me interesa Línea Deco',
    );
    expect(href).toBe(
      'https://wa.me/59170000000?text=' +
        encodeURIComponent('Hola, me interesa Línea Deco'),
    );
  });
});
