/** Datos del clon Fichas Técnicas 2 (clon_colom_fichatecnicas2/index.html:260-565). */

/** Clase Salient del clon: accent-color / extra-color-1|2|3 / default. */
export type FichasToggleVariant =
  | 'accent'
  | 'extra-1'
  | 'extra-2'
  | 'extra-3'
  | 'default';

export interface PdfLink {
  label: string;
  href: string;
}

export interface ToggleGroup {
  title: string;
  variant: FichasToggleVariant;
  links: PdfLink[];
}

export interface FichasColumn {
  id: 'deco' | 'tecno' | 'art';
  logo: string;
  logoAlt: string;
  toggles: ToggleGroup[];
}

/** index.html:267 — h1 del page-header */
export const FICHAS_TITLE = 'Fichas Técnicas';

/**
 * index.html:277-568 — 3 columnas vc_col-sm-4.
 * Logos: public/img/logos/logo-linea-{deco,tecno,art}.jpg
 * (el clon usa *-small.jpg; en el repo viven sin el sufijo).
 */
export const FICHAS_COLUMNS: FichasColumn[] = [
  {
    id: 'deco',
    logo: '/img/logos/logo-linea-deco.jpg',
    logoAlt: 'Línea Deco',
    toggles: [
      {
        // index.html:288 — class="toggle accent-color"
        title: 'PINTURA MATE Y DECORATIVA',
        variant: 'accent',
        links: [
          { label: 'EMI-25', href: '/fichas-tecnicas/180412_EMI_25.pdf' },
          {
            label: 'Exteplastic',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Exteplastic.pdf',
          },
          {
            label: 'Hidrófugo',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Hidrofugo.pdf',
          },
          {
            label: 'S-200',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_S-200.pdf',
          },
          { label: 'Acrílico', href: '/fichas-tecnicas/180412_Acrilico.pdf' },
          {
            label: 'Acrílico color',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Acrilico_Color.pdf',
          },
          {
            label: 'Acrílico SP300',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Acrilico_SP-300.pdf',
          },
          {
            label: 'Mate lavable',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Mate_lavable.pdf',
          },
          {
            label: 'Tinmate',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Tinmate.pdf',
          },
          {
            label: 'Rugoso',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Rugoso.pdf',
          },
          {
            label: 'Plástico para picar',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Plastico_Para_Picar.pdf',
          },
        ],
      },
      {
        // index.html:315 — class="toggle extra-color-1"
        title: 'TRATAMIENTO DE FACHADAS',
        variant: 'extra-1',
        links: [
          {
            label: 'Emulsión hidrófuga',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Emulsion_Hidrofuga.pdf',
          },
          {
            label: 'Mayencolor liso',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Mayencolor_liso.pdf',
          },
          {
            label: 'Mayencolor rugoso',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Mayencolor_rugoso.pdf',
          },
          {
            label: 'Revestimiento liso fachadas',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Revestimiento_Liso_Fachadas.pdf',
          },
          {
            label: 'Especial fachadas',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Especial_fachadas.pdf',
          },
          {
            label: 'Liso elástico',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Liso_Elastico.pdf',
          },
          {
            label: 'Rugoso elástico',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Rugoso_Elastico.pdf',
          },
          {
            label: 'Liso ecológico',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Liso_Ecologico.pdf',
          },
          {
            label: 'Pintura fachadas al pliolite',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Pintura_Fachadas_Pliolite.pdf',
          },
        ],
      },
      {
        // index.html:335 — class="toggle extra-color-2"
        title: 'PINTURA SATINADA',
        variant: 'extra-2',
        links: [
          {
            label: 'Seda sport',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Seda_Sport.pdf',
          },
          {
            label: 'Satinada premium',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Satinada_Premium.pdf',
          },
          {
            label: 'Satinada alto brillo',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Satinada_Alto_Brillo.pdf',
          },
          {
            label: 'Tinsatín',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Tinsatin.pdf',
          },
        ],
      },
      {
        // index.html:350 — class="toggle extra-color-3"
        title: 'VIVIENDAS E INSTALACIONES DEPORTIVAS',
        variant: 'extra-3',
        links: [
          {
            label: 'Impermeabilizante 130',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Impermeabilizante_130.pdf',
          },
          {
            label: 'Impermeabilizante elastic premium',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Impermeabilizante_Elastic_Premium.pdf',
          },
          {
            label: 'Impermeabilizante membrana de poliuretano',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Impermeabilizante_Membrana_Poliuretano.pdf',
          },
          {
            label: 'Fibraelastik',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Fibraelastik.pdf',
          },
          {
            label: 'Antigoteras',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Antigoteras.pdf',
          },
          {
            label: 'Instalaciones deportivas',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Instalaciones_Deportivas.pdf',
          },
          {
            label: 'Piscinas 230 al agua',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Piscinas_230_Agua.pdf',
          },
          {
            label: 'Clorocaucho piscinas',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Clorocaucho_Piscinas.pdf',
          },
          {
            label: 'Master antimanchas y antihumedad',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Antimanchas_Antihumededades.pdf',
          },
        ],
      },
      {
        // index.html:375 — class="toggle accent-color"
        title: 'ESMALTES, IMPRIMACIONES Y BARNICES',
        variant: 'accent',
        links: [
          {
            label: 'Imprimación alcídica',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Imprimacion_Alcidica.pdf',
          },
          {
            label: 'Imprimación sintética plus',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Imprimacion_sintetica_plus.pdf',
          },
          {
            label: 'Imprimación vinílica todoterreno',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Imprimacion_vinilica_todoterreno.pdf',
          },
          {
            label: 'Imprimación multiadherente al agua',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Imprimacion_multiadherente_agua.pdf',
          },
          {
            label: 'Esmalte sintético',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Esmalte_sintetico.pdf',
          },
          {
            label: 'Esmalte acrílico al agua',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Esmalte_acrilico_agua.pdf',
          },
          {
            label: 'Esmalte forja',
            href: 'https://pinturascolom.com/fichas-tecnicas/80412_Esmalte_Forja.pdf',
          },
          {
            label: 'Esmalte martelé',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Esmalte_Martele.pdf',
          },
          {
            label: 'Barniz marino',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Barniz_Marino.pdf',
          },
          {
            label: 'Barniz metales',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Barniz_Metales.pdf',
          },
          {
            label: 'Barniz interior',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Barniz_Interior.pdf',
          },
          {
            label: 'Barniz exterior',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Barniz_Exterior.pdf',
          },
          {
            label: 'Tapaporos nitro 160',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Tapaporos_nitro.pdf',
          },
          {
            label: 'Acabado nitro',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Acabado_nitro.pdf',
          },
          {
            label: 'Aceite de teka',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Aceite_Teka.pdf',
          },
          {
            label: 'Aceite de linaza',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Aceite_linaza.pdf',
          },
          {
            label: 'Selladora tixotrópica',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Selladora_tixotropica.pdf',
          },
          {
            label: 'Selladora tridente',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_Selladora_Tridente.pdf',
          },
        ],
      },
      {
        // index.html:404 — class="toggle accent-color"
        title: 'PRODUCTOS AUXILIARES',
        variant: 'accent',
        links: [
          {
            label: 'Látex concentrado',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_latex_concentrado.pdf',
          },
          {
            label: 'Látex 2000',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_latex_2000.pdf',
          },
          {
            label: 'Barniz fijador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_barniz_fijador.pdf',
          },
          {
            label: 'Reparador acrílico',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_reparador_acrilico.pdf',
          },
          {
            label: 'Hidrofugante',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_hidrofugante.pdf',
          },
          {
            label: 'Fondo penetrante',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_fondo_penetrante.pdf',
          },
          {
            label: 'Protector de film',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_protector_film.pdf',
          },
          {
            label: 'Pasta decapante n',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_pasta_decapante_n.pdf',
          },
          {
            label: 'Decapante líquido',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_decapante_liquido.pdf',
          },
          {
            label: 'Convertox',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_convertox.pdf',
          },
          {
            label: 'Matizante universal',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_matizante_universal.pdf',
          },
          {
            label: 'Disolución antioxidante',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_disolucion_antioxidante.pdf',
          },
          {
            label: 'Disolución directo al óxido',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_disolucion_directo_al_oxido.pdf',
          },
          {
            label: 'Aditivo antisilicona',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_aditivo_antisilicona.pdf',
          },
          {
            label: 'Tintes universales',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_tintes_universales.pdf',
          },
          {
            label: 'Tintes Lys al agua',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_tintes_lys.pdf',
          },
          {
            label: 'Colomplast interior',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_colomplast_interior.pdf',
          },
          {
            label: 'Colomplast exterior',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_colomplast_exterior.pdf',
          },
          {
            label: 'Colomplast renovación',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_colomplast_renovacion.pdf',
          },
          {
            label: 'Colomplast al uso',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_colomplast_al_uso.pdf',
          },
          {
            label: 'Colomplast fibra al uso',
            href: 'https://pinturascolom.com/fichas-tecnicas/180412_colomplast_fibra_al_uso.pdf',
          },
        ],
      },
    ],
  },
  {
    id: 'tecno',
    logo: '/img/logos/logo-linea-tecno.jpg',
    logoAlt: 'Línea Tecno',
    toggles: [
      {
        // index.html:451 — class="toggle extra-color-2"
        title: 'IMPRIMACIONES',
        variant: 'extra-2',
        links: [
          {
            label: 'Imprimación alcídica serie 200',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-alcidica-serie-200-TECNO.pdf',
          },
          {
            label: 'Imprimación alcídica',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-alcidica-TECNO.pdf',
          },
          {
            label: 'Imprimación alcídica satinada',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-alcidica-satinada-TECNO.pdf',
          },
          {
            label: 'Imprimación alcídica antioxidante',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-alcidica-antioxidante-TECNO.pdf',
          },
          {
            label: 'Imprimación Ignífuga M1',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-ignifuga-M1-TECNO.pdf',
          },
          {
            label: 'Imprimación fosfatante misil satinado',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-fosfatante-misil-satinado-TECNO.pdf',
          },
          {
            label: 'Shop primer',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-shop-primer-TECNO.pdf',
          },
          {
            label: 'Wash-primer + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-wash-primer-catalizador-TECNO.pdf',
          },
          {
            label: 'Imprimación Bituminosa',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-bituminosa-TECNO.pdf',
          },
          {
            label: 'Imprimación epoxi + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-epoxi-catalizador-TECNO.pdf',
          },
          {
            label: 'Imprimación epoxi zinc + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-epoxi-zinc-catalizador-TECNO.pdf',
          },
          {
            label: 'Imprimación epoxi capa gruesa + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-epoxi-capa-gruesa-catalizador-TECNO.pdf',
          },
          {
            label: 'Imprimación vinílica todoterreno',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-vinilica-todoterreno-TECNO.pdf',
          },
          {
            label: 'Imprimación multiadherente al agua',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-imprimacion-Multiadherente-agua-TECNO.pdf',
          },
        ],
      },
      {
        // index.html:470 — class="toggle default"
        title: 'ACABADOS PARA METALES',
        variant: 'default',
        links: [
          {
            label: 'Esmalte secado rápido',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-secado-rapido-TECNO.pdf',
          },
          {
            label: 'Esmalte secado rápido antioxidante',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-secado-rapido-antioxidante-TECNO.pdf',
          },
          {
            label: 'Esmalte tornado',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-tornado-TECNO.pdf',
          },
          {
            label: 'Esmalte tornado antioxidante',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-tornado-antioxidante-TECNO.pdf',
          },
          {
            label: 'Esmalte sintético',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-sintetico-TECNO.pdf',
          },
          {
            label: 'Esmalte sintético antioxidante',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-sintetico-TECNO.pdf',
          },
          {
            label: 'Esmalte estructuras bravo',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-estructuras-bravo-TECNO.pdf',
          },
          {
            label: 'Esmalte clorocaucho',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-clorocaucho-TECNO.pdf',
          },
          {
            label: 'Esmalte multiadherente',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-multiadherente-TECNO.pdf',
          },
          {
            label: 'Esmalte ignífugo',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-ignifugo-TECNO.pdf',
          },
          {
            label: 'Esmalte uretanado',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-uretanado-TECNO.pdf',
          },
          {
            label: 'Esmalte martelé',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-martele-TECNO.pdf',
          },
          {
            label: 'Esmalte forja',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-forja-TECNO.pdf',
          },
          {
            label: 'Esmalte poliuretano spol 1',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-poliuretano-spol-1-TECNO.pdf',
          },
          {
            label: 'Esmalte poliuretano spol 2 + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-poliuretano-spol-2-catalizador-TECNO.pdf',
          },
          {
            label: 'Esmalte poliuretano galvanizado + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-poliuretano-galvanizado-catalizador-TECNO.pdf',
          },
          {
            label: 'Esmalte acabado epoxi + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-esmalte-acabado-epoxi-catalizador-TECNO.pdf',
          },
          {
            label: 'Aluminio PR 250-300°C',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-aluminio-PR-TECNO.pdf',
          },
          {
            label: 'Anticalórico 500°C aluminio',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-anticalorico-500-aluminio-TECNO.pdf',
          },
          {
            label: 'Anticalórico 500°C negro',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-anticalorico-500-negro-TECNO.pdf',
          },
        ],
      },
      {
        // index.html:495 — class="toggle default"
        title: 'PAVIMENTOS',
        variant: 'default',
        links: [
          {
            label: 'Clorocaucho suelos',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-clorocaucho-suelos-TECNO.pdf',
          },
          {
            label: 'Señalización acrílica',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-senalizacion-acrilica-TECNO.pdf',
          },
          {
            label: 'Barniz acrílico',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-barniz-acrilico-TECNO.pdf',
          },
          {
            label: 'Barniz antipolvo epoxi + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-barniz-antipolvo-epoxi-catalizador-TECNO.pdf',
          },
          {
            label: 'Fijador epoxi suelos + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-fijador-epoxi-suelos-catalizador-TECNO.pdf',
          },
          {
            label: 'Epoxi suelos + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-epoxi-suelos-catalizador-TECNO.pdf',
          },
          {
            label: 'Epoxi suelos LK + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-epoxi-suelos-LK-catalizador-TECNO.pdf',
          },
          {
            label: 'Epoxi suelos 100% + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-epoxi-suelos-100-catalizador-TECNO.pdf',
          },
          {
            label: 'Epoxi suelos al agua + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-epoxi-suelos-agua-catalizador-TECNO.pdf',
          },
          {
            label: 'Epoxi autonivelante + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-epoxi-autonivelante-catalizador-TECNO.pdf',
          },
          {
            label: 'Metacrílico',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-metacrilico-TECNO.pdf',
          },
          {
            label: 'Poliuretano suelos + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-poliuretano-suelos-catalizador-TECNO.pdf',
          },
          {
            label: 'Barniz poliuretano suelos + catalizador',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-barniz-poliuretano-suelos-catalizador-TECNO.pdf',
          },
        ],
      },
      {
        // index.html:513 — class="toggle default"
        title: 'DISOLVENTES',
        variant: 'default',
        links: [
          {
            label: 'Disolvente universal',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-disolvente-universal-TECNO.pdf',
          },
          {
            label: 'Disolvente limpieza',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-disolvente-limpieza-TECNO.pdf',
          },
          {
            label: 'Disolvente epoxi',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-disolvente-epoxi-TECNO.pdf',
          },
          {
            label: 'Disolvente NP',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-disolvente-PN-TECNO.pdf',
          },
          {
            label: 'Disolvente SAC',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-disolvente-SAC-TECNO.pdf',
          },
          {
            label: 'Disolvente esmaltes sintéticos',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-disolvente-esmaltes-sinteticos-TECNO.pdf',
          },
          {
            label: 'Disolvente desodorizado',
            href: 'https://pinturascolom.com/fichas-tecnicas/180418-disolvente-desodorizado-TECNO.pdf',
          },
        ],
      },
    ],
  },
  {
    id: 'art',
    logo: '/img/logos/logo-linea-art.jpg',
    logoAlt: 'Línea Art',
    // index.html:540-564 — toggles vacíos en el original (sin links)
    toggles: [
      { title: 'PINTURAS', variant: 'extra-1', links: [] },
      { title: 'AUXILIARES AL AGUA', variant: 'extra-3', links: [] },
      { title: 'AUXILIARES SINTÉTICOS', variant: 'extra-2', links: [] },
      { title: 'PINCELES', variant: 'default', links: [] },
      { title: 'EXPOSITORES', variant: 'default', links: [] },
    ],
  },
];
