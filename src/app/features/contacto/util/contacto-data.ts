/** Sucursales y datos de contacto — inventados (Santa Cruz, Bolivia), fáciles de reemplazar. */

export interface Branch {
  id: string;
  name: string;
  addressLines: string[];
  phone: string;
  email: string;
  /** Líneas de horario (variadas por sucursal). */
  hours: string[];
  lat: number;
  lng: number;
}

export interface BranchWithDistance extends Branch {
  distanceKm: number | null;
}

export interface ContactInfoBlock {
  icon: 'map-marker' | 'comment' | 'at';
  lines: string[];
  /** Si true, la línea va envuelta en <strong> (teléfono del clon). */
  strongLineIndex?: number;
}

export const CONTACT_INFO_BLOCKS: ContactInfoBlock[] = [
  {
    icon: 'map-marker',
    lines: [
      'Av. Cristo Redentor 2850',
      'Equipetrol Norte',
      'Santa Cruz de la Sierra',
      'BOLIVIA',
    ],
  },
  {
    icon: 'comment',
    lines: ['Atención al Cliente', '+591 3 344-1200'],
    strongLineIndex: 1,
  },
  {
    icon: 'at',
    lines: ['Solicitud de Información', 'info@pinturas-colom.bo'],
  },
];

/** Centro aproximado de Santa Cruz de la Sierra para el mapa inicial. */
export const MAP_DEFAULT_CENTER = { lat: -17.7833, lng: -63.1821 };
export const MAP_DEFAULT_ZOOM = 12;
export const MAP_FOCUS_ZOOM = 15;

export const BRANCH_MARKER_ICON = '/img/logos/logo-colom-small.png';

export const BRANCHES: Branch[] = [
  {
    id: 'centro',
    name: 'Sucursal Centro',
    addressLines: [
      'Calle Ayacucho 168',
      'Casco Viejo',
      'Santa Cruz de la Sierra',
    ],
    phone: '+591 3 333-4101',
    email: 'centro@pinturas-colom.bo',
    hours: ['Lun–Vie 08:00–18:00', 'Sáb 08:00–13:00'],
    lat: -17.7833,
    lng: -63.1829,
  },
  {
    id: 'equipetrol',
    name: 'Sucursal Equipetrol',
    addressLines: [
      'Av. San Martín 450',
      'Equipetrol',
      'Santa Cruz de la Sierra',
    ],
    phone: '+591 3 344-2202',
    email: 'equipetrol@pinturas-colom.bo',
    hours: ['Lun–Sáb 09:00–19:00'],
    lat: -17.7407,
    lng: -63.1659,
  },
  {
    id: 'plan-3000',
    name: 'Sucursal Plan Tres Mil',
    addressLines: [
      'Av. Virgen de Cotoca km 5',
      'Plan Tres Mil',
      'Santa Cruz de la Sierra',
    ],
    phone: '+591 3 355-3303',
    email: 'plan3000@pinturas-colom.bo',
    hours: ['Lun–Vie 08:30–17:30'],
    lat: -17.7932,
    lng: -63.1577,
  },
  {
    id: 'los-pozos',
    name: 'Sucursal Los Pozos',
    addressLines: [
      'Av. Grigotá 2120',
      'Los Pozos',
      'Santa Cruz de la Sierra',
    ],
    phone: '+591 3 352-4404',
    email: 'lospozos@pinturas-colom.bo',
    hours: ['Lun–Mar 08:00–16:00', 'Mié–Vie 08:00–18:00'],
    lat: -17.8133,
    lng: -63.1659,
  },
  {
    id: 'villa-1-mayo',
    name: 'Sucursal Villa 1ero de Mayo',
    addressLines: [
      'Av. Mutualista 890',
      'Villa 1ero de Mayo',
      'Santa Cruz de la Sierra',
    ],
    phone: '+591 3 346-5505',
    email: 'villa1mayo@pinturas-colom.bo',
    hours: ['Lun–Vie 08:00–17:00', 'Sáb 09:00–12:00'],
    lat: -17.77,
    lng: -63.1433,
  },
  {
    id: 'doble-via',
    name: 'Sucursal Doble Vía La Guardia',
    addressLines: [
      'Doble Vía La Guardia km 7.5',
      'Zona Oeste',
      'Santa Cruz de la Sierra',
    ],
    phone: '+591 3 358-6606',
    email: 'doblevia@pinturas-colom.bo',
    hours: ['Lun–Vie 07:30–18:30'],
    lat: -17.805,
    lng: -63.195,
  },
  {
    id: 'el-cristo',
    name: 'Sucursal El Cristo',
    addressLines: [
      'Av. Cristo Redentor 1200',
      'El Cristo',
      'Santa Cruz de la Sierra',
    ],
    phone: '+591 3 343-7707',
    email: 'elcristo@pinturas-colom.bo',
    hours: ['Lun–Dom 09:00–20:00'],
    lat: -17.7433,
    lng: -63.19,
  },
];

export const CONTACT_HERO_IMAGE = '/img/slides/empresa-destacada-2.jpg';
