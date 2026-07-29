import {
  PublicProduct,
} from '../../../core/http/products-public.api';
import {
  mapPublicProductToView,
  mapRelatedProducts,
} from './map-public-product';

function sampleProduct(overrides: Partial<PublicProduct> = {}): PublicProduct {
  return {
    id: 1,
    catalogId: 10,
    catalogs: [
      {
        id: 10,
        name: 'Pintura mate',
        slug: 'pintura-mate',
        categoryId: 2,
        categoryName: 'Línea Deco',
        categorySlug: 'linea-deco',
      },
    ],
    title: 'Acrílico color',
    slug: 'acrilico-color',
    description: '<p>Pintura mate</p>',
    mainImageUrl: null,
    technicalSheetUrl: 'https://example.com/ficha.pdf',
    isActive: true,
    displayOrder: 0,
    presentations: [
      { id: 1, value: '1 L', displayOrder: 0 },
      { id: 2, value: '4 L', displayOrder: 1 },
    ],
    finishes: [{ id: 1, name: 'Mate', imageUrl: null, displayOrder: 0 }],
    colors: [
      { id: 1, name: 'Blanco', hexCode: '#fff', imageUrl: null, displayOrder: 0 },
      { id: 2, name: 'Negro', hexCode: '#000', imageUrl: null, displayOrder: 1 },
    ],
    colorsCount: 2,
    sections: [
      {
        id: 1,
        title: 'Usos',
        icon: '/img/productos/icono-usos-100px.png',
        titleColor: '#009aa3',
        content: '<p>Interior</p>',
        displayOrder: 0,
      },
    ],
    images: [
      {
        id: 1,
        url: 'https://cdn.example/main.jpg',
        publicId: 'main',
        isMain: true,
        displayOrder: 0,
      },
    ],
    ...overrides,
  };
}

describe('mapPublicProductToView', () => {
  it('mapea título, galería, summary y sections', () => {
    const view = mapPublicProductToView(sampleProduct());
    expect(view.title).toBe('Acrílico color');
    expect(view.gallery[0].src).toContain('main.jpg');
    expect(view.description.bodyHtml).toContain('Pintura mate');
    expect(view.presentacion.bodyHtml).toContain('1 L');
    expect(view.presentacion.bodyHtml).toContain('4 L');
    expect(view.acabados.bodyHtml).toContain('Mate');
    expect(view.color.bodyHtml).toContain('Blanco');
    expect(view.color.bodyHtml).toContain('Negro');
    expect(view.color.bodyHtml).not.toContain('2 colores');
    expect(view.tabBlocks).toHaveLength(1);
    expect(view.tabBlocks[0].title).toBe('Usos');
    expect(view.fichaHref).toContain('ficha.pdf');
    expect(view.breadcrumb.map((b) => b.label)).toEqual([
      'Inicio',
      'Línea Deco',
      'Pintura mate',
      'Acrílico color',
    ]);
    expect(view.breadcrumb[0].href).toBe('/');
    expect(view.breadcrumb[1].href).toBe('/categoria/linea-deco/productos');
    expect(view.breadcrumb[2].href).toBe('/catalogo/pintura-mate/productos');
    expect(view.breadcrumb[3].href).toBeUndefined();
    expect(view.categories[0].href).toBe('/categoria/linea-deco/productos');
  });

  it('usa conteo de colores si no hay nombres', () => {
    const view = mapPublicProductToView(
      sampleProduct({
        colors: [],
        colorsCount: 3,
      }),
    );
    expect(view.color.bodyHtml).toContain('3 colores');
  });

  it('escapa texto plano en presentaciones', () => {
    const view = mapPublicProductToView(
      sampleProduct({
        presentations: [
          { id: 1, value: '<script>x</script>', displayOrder: 0 },
        ],
      }),
    );
    expect(view.presentacion.bodyHtml).not.toContain('<script>');
    expect(view.presentacion.bodyHtml).toContain('&lt;script&gt;');
  });

  it('usa mainImageUrl si no hay images', () => {
    const view = mapPublicProductToView(
      sampleProduct({
        images: [],
        mainImageUrl: 'https://cdn.example/solo.jpg',
      }),
    );
    expect(view.gallery).toHaveLength(1);
    expect(view.gallery[0].src).toContain('solo.jpg');
  });
});

describe('mapRelatedProducts', () => {
  it('excluye el slug actual y limita', () => {
    const related = mapRelatedProducts(
      [
        sampleProduct({ slug: 'acrilico-color', title: 'A' }),
        sampleProduct({ id: 2, slug: 'otro', title: 'B' }),
        sampleProduct({ id: 3, slug: 'tercero', title: 'C' }),
      ],
      'acrilico-color',
      4,
    );
    expect(related).toHaveLength(2);
    expect(related.every((p) => p.href !== '/producto/acrilico-color')).toBe(
      true,
    );
    expect(related[0].href).toBe('/producto/otro');
  });
});
