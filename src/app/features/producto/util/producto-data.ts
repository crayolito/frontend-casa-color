/** Datos del clon producto Acrílico color (clon_colom_producto/index.html:273-538). */

import { ProductItem } from '../../../shared/ui/product-card/product-item';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface GalleryImage {
  /** Imagen mostrada en el slider. */
  src: string;
  /** Imagen grande para easyzoom + lightbox (href del <a> del clon). */
  largeSrc: string;
  thumb: string;
  width: number;
  height: number;
  largeWidth: number;
  largeHeight: number;
  alt: string;
}

export interface IconBlock {
  icon: string;
  title: string;
  titleColor: string;
  /** HTML interno del clon (párrafos / listas) — fidelidad de contenido. */
  bodyHtml: string;
}

export interface ProductCategory {
  label: string;
  href: string;
}

/** index.html:273 breadcrumb */
export const BREADCRUMB: BreadcrumbItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Línea Deco', href: '/linea-deco' },
  { label: 'Pintura mate y decorativa', href: '#' },
  { label: 'Acrílico color' },
];

/** index.html:277-289 galería — <a href=large> + img src=display */
export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: '/img/productos/envase-colom-acrilico-color.jpg',
    largeSrc: '/img/productos/envase-colom-acrilico-color.jpg',
    thumb: '/img/productos/envase-colom-acrilico-color-140x140.jpg',
    width: 1600,
    height: 1700,
    largeWidth: 1600,
    largeHeight: 1700,
    alt: 'envase-colom-acrilico-color',
  },
  {
    src: '/img/productos/envase-colom-cubeta-600x638.jpg',
    largeSrc: '/img/productos/envase-colom-cubeta.jpg',
    thumb: '/img/productos/envase-colom-cubeta-140x140.jpg',
    width: 600,
    height: 638,
    largeWidth: 1600,
    largeHeight: 1700,
    alt: '',
  },
];
// 345565225524-10c01v4s4rtre2p0e4rprgph6jdvm8c8.apps.googleusercontent.com
export const PRODUCT_TITLE = 'Acrílico color';

/** index.html:302-311 Descripción (short) */
export const SUMMARY_DESCRIPTION: IconBlock = {
  icon: '/img/productos/icono-descripcion-100px.png',
  title: 'Descripción',
  titleColor: '#ff4b3c',
  bodyHtml:
    '<p>Pintura plástica de acabado mate, con alta cubrición y lavabilidad, a base de resinas estireno acrílicas, pigmentos, cargas y aditivos de primera calidad.</p>',
};

/** index.html:321-341 Presentación */
export const SUMMARY_PRESENTACION: IconBlock = {
  icon: '/img/productos/icono-presentacion-100px.png',
  title: 'Presentación',
  titleColor: '#8a7cd7',
  bodyHtml: `<p>Envases de plástico:</p>
<ul>
<li>750 ml</li>
<li>5 kg</li>
<li>8 l</li>
<li>15 l</li>
</ul>
<p>Cubetas rectangulares:</p>
<ul>
<li>4 litros</li>
</ul>`,
};

/** index.html:349-350 Acabados */
export const SUMMARY_ACABADOS: IconBlock = {
  icon: '/img/productos/icono-acabados-100px.png',
  title: 'Acabados',
  titleColor: '#ea5383',
  bodyHtml: '<p>Liso mate. </p>',
};

/** index.html:351-354 Color — shortcode roto del clon se deja literal */
export const SUMMARY_COLOR: IconBlock = {
  icon: '/img/productos/icono-color-100px.png',
  title: 'Color',
  titleColor: '#ffa100',
  bodyHtml: `<p>19 colores<br/>
[button open_new_tab=»true» color=»extra-color-1″ hover_text_color_override=»#fff» size=»medium» url=»» text=»Carta de colores» color_override=»»] </p>`,
};

/** index.html:360-361 */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { label: 'Línea Deco', href: '/linea-deco' },
  { label: 'Pintura mate y decorativa', href: '#' },
];

/** index.html:380-474 tab Descripción */
export const TAB_BLOCKS: IconBlock[] = [
  {
    icon: '/img/productos/icono-usos-100px.png',
    title: 'Usos',
    titleColor: '#009aa3',
    bodyHtml:
      '<p>Pintura diseñada para decoración y protección de todo tipo de paredes y techos en interior.</p>',
  },
  {
    icon: '/img/productos/icono-preparacion-100px.png',
    title: 'Preparación del soporte',
    titleColor: '#999dac',
    bodyHtml: `<p><strong>SOPORTES NUEVOS<br/>
</strong><strong>Cemento y hormigón<br/>
</strong>Esperar hasta el fraguado total del soporte (28 días).<br/>
Eliminar mediante lijado o chorro abrasivo las posibles eflorescencias.<br/>
Neutralizar las superficies alcalinas.<br/>
En caso de superficies pulidas lijar para abrir el poro y facilitar el agarre de la pintura. Masillar y lijar las irregularidades con Colomplast interior o Colomplast al uso.<br/>
Aplicar una mano de fijador o reparador acrílico para mejorar el agarre y rendimiento.</p>
<p><strong>Yeso<br/>
</strong>Esperar hasta el secado total del soporte.<br/>
Eliminar mediante lijado o chorro abrasivo las posibles eflorescencias.<br/>
En caso de superficies pulidas lijar para abrir el poro y facilitar el agarre de la pintura. Masillar y lijar las irregularidades con Colomplast interior o Colomplast al uso.<br/>
Aplicar una mano de fijador o reparador acrílico para mejorar el agarre y rendimiento.</p>
<p><strong>RESTAURACIÓN Y MANTENIMIENTO</strong><br/>
Eliminar totalmente las viejas pinturas en mal estado o mal adheridas. En las zonas que queden con pintura antigua comprobar su anclaje para garantizar que no se desprendan una vez repintadas. Eliminar toda la suciedad y polvo existente.<br/>
Eliminar mediante lijado o chorro abrasivo las posibles eflorescencias.<br/>
En caso de superficies pulidas lijar para abrir el poro y facilitar el agarre de la pintura. Masillar y lijar las irregularidades con Colomplast interior o Colomplast al uso.<br/>
Aplicar una mano de fijador o reparador acrílico para mejorar el agarre y rendimiento. </p>`,
  },
  {
    icon: '/img/productos/icono-conservacion-100px.png',
    title: 'Conservación',
    titleColor: '#61b7ff',
    bodyHtml: `<p>Mantener la pintura en su envase original bien cerrado y en lugares por encima de 5ºC y por debajo de 40ºC.<br/>
No añadir agua directamente en el envase. </p>`,
  },
  {
    icon: '/img/productos/icono-aplicacion-100px.png',
    title: 'Aplicación',
    titleColor: '#81d742',
    bodyHtml: `<p>Aplicar a brocha, rodillo y con diferentes tipos de pistola (baja presión, aerográfica, airless…)<br/>
Agitar el producto hasta homogeneizar totalmente.<br/>
Diluir el producto en función del modo de aplicación, desde un 10-15% para brocha y rodillo hasta un 10-30% según el tipo de pistola usada. Es conveniente diluir un poco más la primera capa para mejorar la penetración en el soporte. Aplicar la siguiente o siguientes capas con menor dilución. La dilución se hará en un envase distinto al original para mantener la pintura en su envase original sin agua añadida.<br/>
No aplicar a temperaturas inferiores a 5ºC.<br/>
La dilución y limpieza de los materiales se realizará con agua.</p>`,
  },
  {
    icon: '/img/productos/icono-caracteristicas-100px.png',
    title: 'Características técnicas',
    titleColor: '#3386db',
    bodyHtml: `<p><strong>Viscosidad</strong>: 337± 10 p (brookfield, 20 rpm)<br/>
<strong>Rendimiento</strong>: 5-7 m²/kg. por capa. 8-11 m²/litro por capa*.<br/>
<strong>Peso específico</strong>: 1,60 ± 0,10 gr./cc.<br/>
<strong>Sólidos en volumen</strong>: 41,00 ± 1,00 %<br/>
<strong>Sólidos en peso</strong>: 63,00 ± 1,00 %<br/>
<strong>VOC</strong>: 10,00± 2,00 gr/l. Valor límite Cat A/a (BA): 30 gr/l.<br/>
<strong>Secado</strong>: De 20 a 30 minutos. Esperar 3 horas para repintar.<br/>
<strong>Acabado</strong>: Liso mate en 19 colores.<br/>
<strong>Blancura</strong>: 90,67 ± 1,00 %<br/>
<strong>Cubrición</strong>: 98,00 ± 2,00 %, según colores. Clase 2 (EN 13300).<br/>
<strong>Lavabilidad</strong>: 12.000 ± 500 P.S.D.(DIN 53778). Clase 2 (EN 13300).</p>
<p>(*) Valor aproximado, dependiendo del tipo y estado del soporte. </p>`,
  },
  {
    icon: '/img/productos/icono-seguridad-100px.png',
    title: 'Seguridad e Higiene',
    titleColor: '#c7423c',
    bodyHtml:
      '<p>Mantener fuera del alcance de los niños. Depositar el envase vacío y los residuos en un centro autorizado. Para más información consultar la ficha de seguridad.</p>',
  },
];

/** index.html:483 */
export const FICHA_TECNICA_HREF =
  'http://www.pinturascolom.com/fichas-tecnicas/180412_Acrilico_Color.pdf';

const CAT_LINEA_DECO = { label: 'Línea Deco', href: '/linea-deco' };
const CAT_MATE = { label: 'Pintura mate y decorativa', href: '#' };
const CAT_SATINADA = { label: 'Pintura satinada', href: '#' };
const CAT_ESMALTES = {
  label: 'Esmaltes, Imprimaciones y Barnices',
  href: '#',
};

/** index.html:491-537 — 4 relacionados */
export const RELATED_PRODUCTS: ProductItem[] = [
  {
    title: 'Satinada premium',
    href: '#',
    image: '/img/productos/envase-colom-satinada-premium-375x400.jpg',
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_LINEA_DECO, CAT_SATINADA],
  },
  {
    title: 'Acrílico',
    href: '#',
    image: '/img/productos/envase-colom-acrilico-375x400.jpg',
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_LINEA_DECO, CAT_MATE],
  },
  {
    title: 'Seda sport',
    href: '#',
    image: '/img/productos/envase-colom-seda-sport-375x400.jpg',
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_LINEA_DECO, CAT_SATINADA],
  },
  {
    title: 'Esmalte Sintético',
    href: '#',
    image: '/img/productos/envase-colom-esmalte-sintetico-4l-375x400.jpg',
    imageWidth: 375,
    imageHeight: 400,
    hoverImage:
      '/img/productos/envase-colom-esmalte-sintetico-750ml-375x400.jpg',
    categories: [CAT_ESMALTES, CAT_LINEA_DECO],
  },
];
