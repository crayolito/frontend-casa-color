import { describe, expect, it } from 'vitest';
import {
  DEFAULT_IMAGES,
  withCatalogFallback,
  withCategoryFallback,
  withLogoFallback,
  withProductFallback,
} from './default-images';

describe('default-images', () => {
  it('falls back to logo when empty', () => {
    expect(withLogoFallback(null)).toBe(DEFAULT_IMAGES.logo);
    expect(withLogoFallback('')).toBe(DEFAULT_IMAGES.logo);
    expect(withLogoFallback('   ')).toBe(DEFAULT_IMAGES.logo);
    expect(withLogoFallback('/custom.png')).toBe('/custom.png');
  });

  it('falls back to product/category/catalog placeholders', () => {
    expect(withProductFallback(undefined)).toBe(DEFAULT_IMAGES.product);
    expect(withCategoryFallback(null)).toBe(DEFAULT_IMAGES.category);
    expect(withCatalogFallback('')).toBe(DEFAULT_IMAGES.catalog);
  });
});
