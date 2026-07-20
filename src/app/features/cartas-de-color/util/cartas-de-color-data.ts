/** Datos del clon Cartas de Color (index.html:279-352). */

export interface ColorCard {
  image: string;
  imageWidth: number;
  imageHeight: number;
  /** Texto antes del <strong>, ej. "COLOM" */
  titlePrefix: string;
  /** Texto dentro del <strong>, con espacio líder como en el clon (" 3000") */
  titleStrong: string;
  description: string[];
  /** Altura del spacer vacío antes del botón (index.html divider style height) */
  dividerHeight: number;
  buttonLabel: string;
  pdfHref: string;
}

/** index.html:279 — nectar-split-heading h5 */
export const CARTAS_HEADING = {
  prefix: 'DOCUMENTACIÓN | ',
  strong: 'Cartas de Color',
};

/** index.html:284-352 — dos cartas descargables */
export const CARTAS: ColorCard[] = [
  {
    image: '/img/cartas/colom-3000-web.png',
    imageWidth: 400,
    imageHeight: 375,
    titlePrefix: 'COLOM',
    titleStrong: ' 3000',
    description: [
      'Esta carta de colores ha sido confeccionada para facilitar la labor del profesional a la hora de ofrecer una amplia gama de colores para la decoración de exteriores.',
      'En la preparación de los colores se ha tenido en cuenta la resistencia a la luz solar y al exterior de los pigmentos utilizados. Por ello solamente se han utilizado pigmentos de alta resistencia a la intemperie y de alta durabilidad frente a losrayos ultravioleta.',
      'Aunque los colores están enfocados al uso en exteriores, no hay ningún inconveniente en usarlos para decoración de interiores.',
    ],
    dividerHeight: 30,
    buttonLabel: 'Descargar Carta Colom 3000',
    pdfHref: '/documentacion/colom-carta-3000.pdf',
  },
  {
    image: '/img/cartas/colom-revestimientos-web.png',
    imageWidth: 400,
    imageHeight: 375,
    titlePrefix: 'COLOM',
    titleStrong: ' Revestimientos',
    description: [],
    dividerHeight: 70,
    buttonLabel: 'Descargar Carta Colom Revestimientos',
    pdfHref: '/documentacion/carta-colom-revestimientos.pdf',
  },
];
