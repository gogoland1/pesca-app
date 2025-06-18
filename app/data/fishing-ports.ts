export interface FishingPort {
  id: string
  name: string
  region: string
  coordinates: {
    lat: number
    lon: number
  }
  description: string
  mainSpecies: string[]
  portType: 'caleta' | 'puerto' | 'bahia'
  approximatePopulation?: number
}

export const CHILEAN_FISHING_PORTS: FishingPort[] = [
  // REGIÓN DE ARICA Y PARINACOTA
  {
    id: 'arica',
    name: 'Arica',
    region: 'Arica y Parinacota',
    coordinates: { lat: -18.4783, lon: -70.3126 },
    description: 'Puerto principal del extremo norte, importante para pesca pelágica',
    mainSpecies: ['Jurel', 'Caballa', 'Anchoveta', 'Bonito'],
    portType: 'puerto',
    approximatePopulation: 850
  },
  {
    id: 'camarones',
    name: 'Caleta Camarones',
    region: 'Arica y Parinacota', 
    coordinates: { lat: -19.0089, lon: -70.2267 },
    description: 'Caleta tradicional de pescadores artesanales',
    mainSpecies: ['Lenguado', 'Corvina', 'Pejerrey'],
    portType: 'caleta'
  },

  // REGIÓN DE TARAPACÁ
  {
    id: 'iquique',
    name: 'Iquique',
    region: 'Tarapacá',
    coordinates: { lat: -20.2307, lon: -70.1355 },
    description: 'Centro pesquero industrial y artesanal importante',
    mainSpecies: ['Anchoveta', 'Sardina', 'Jurel', 'Caballa'],
    portType: 'puerto',
    approximatePopulation: 1200
  },
  {
    id: 'pisagua',
    name: 'Caleta Pisagua',
    region: 'Tarapacá',
    coordinates: { lat: -19.5992, lon: -70.2183 },
    description: 'Histórica caleta pesquera en la costa tarapaqueña',
    mainSpecies: ['Congrio', 'Lenguado', 'Pejerrey'],
    portType: 'caleta'
  },

  // REGIÓN DE ANTOFAGASTA
  {
    id: 'antofagasta',
    name: 'Antofagasta',
    region: 'Antofagasta',
    coordinates: { lat: -23.6345, lon: -70.3954 },
    description: 'Principal puerto del norte grande, pesca industrial',
    mainSpecies: ['Anchoveta', 'Sardina', 'Jurel', 'Merluza'],
    portType: 'puerto',
    approximatePopulation: 2100
  },
  {
    id: 'mejillones',
    name: 'Caleta Mejillones',
    region: 'Antofagasta',
    coordinates: { lat: -23.1039, lon: -70.4453 },
    description: 'Puerto natural protegido, ideal para pesca artesanal',
    mainSpecies: ['Loco', 'Erizo', 'Cholga', 'Choro'],
    portType: 'caleta',
    approximatePopulation: 180
  },
  {
    id: 'taltal',
    name: 'Caleta Taltal',
    region: 'Antofagasta',
    coordinates: { lat: -25.4050, lon: -70.4850 },
    description: 'Caleta histórica con tradición pesquera centenaria',
    mainSpecies: ['Congrio', 'Corvina', 'Lenguado', 'Cabrilla'],
    portType: 'caleta',
    approximatePopulation: 95
  },

  // REGIÓN DE ATACAMA
  {
    id: 'caldera',
    name: 'Caldera',
    region: 'Atacama',
    coordinates: { lat: -27.0665, lon: -70.8252 },
    description: 'Puerto pesquero con importante flota artesanal',
    mainSpecies: ['Merluza', 'Congrio', 'Lenguado', 'Reineta'],
    portType: 'puerto',
    approximatePopulation: 650
  },
  {
    id: 'bahia-inglesa',
    name: 'Bahía Inglesa',
    region: 'Atacama',
    coordinates: { lat: -27.1042, lon: -70.8589 },
    description: 'Hermosa bahía con pesca artesanal y turismo',
    mainSpecies: ['Loco', 'Erizo', 'Congrio', 'Corvina'],
    portType: 'bahia'
  },
  {
    id: 'chanaral',
    name: 'Caleta Chañaral',
    region: 'Atacama',
    coordinates: { lat: -26.3481, lon: -70.6267 },
    description: 'Caleta minero-pesquera en transición',
    mainSpecies: ['Jurel', 'Caballa', 'Sardina'],
    portType: 'caleta'
  },

  // REGIÓN DE COQUIMBO
  {
    id: 'coquimbo',
    name: 'Coquimbo',
    region: 'Coquimbo',
    coordinates: { lat: -29.9533, lon: -71.3436 },
    description: 'Gran puerto pesquero con terminal pesquero moderno',
    mainSpecies: ['Merluza', 'Jurel', 'Caballa', 'Sardina'],
    portType: 'puerto',
    approximatePopulation: 1800
  },
  {
    id: 'tongoy',
    name: 'Caleta Tongoy',
    region: 'Coquimbo',
    coordinates: { lat: -30.2539, lon: -71.5039 },
    description: 'Caleta tradicional en bahía protegida',
    mainSpecies: ['Loco', 'Ostión', 'Erizo', 'Congrio'],
    portType: 'caleta',
    approximatePopulation: 220
  },
  {
    id: 'los-vilos',
    name: 'Los Vilos',
    region: 'Coquimbo',
    coordinates: { lat: -31.9089, lon: -71.5083 },
    description: 'Puerto pesquero y balneario importante',
    mainSpecies: ['Merluza', 'Congrio', 'Corvina', 'Reineta'],
    portType: 'puerto',
    approximatePopulation: 480
  },

  // REGIÓN DE VALPARAÍSO  
  {
    id: 'valparaiso',
    name: 'Valparaíso',
    region: 'Valparaíso',
    coordinates: { lat: -33.0472, lon: -71.6127 },
    description: 'Puerto principal, patrimonio mundial, pesca artesanal histórica',
    mainSpecies: ['Congrio', 'Merluza', 'Jurel', 'Caballa'],
    portType: 'puerto',
    approximatePopulation: 2800
  },
  {
    id: 'san-antonio',
    name: 'San Antonio',
    region: 'Valparaíso',
    coordinates: { lat: -33.5928, lon: -71.6175 },
    description: 'Segundo puerto más importante de Chile',
    mainSpecies: ['Merluza', 'Congrio', 'Jurel', 'Reineta'],
    portType: 'puerto',
    approximatePopulation: 1950
  },
  {
    id: 'quintero',
    name: 'Caleta Quintero',
    region: 'Valparaíso',
    coordinates: { lat: -32.7833, lon: -71.5333 },
    description: 'Caleta industrial y pesquera en bahía',
    mainSpecies: ['Jurel', 'Caballa', 'Anchoveta', 'Sardina'],
    portType: 'caleta',
    approximatePopulation: 380
  },
  {
    id: 'horcon',
    name: 'Caleta Horcón',
    region: 'Valparaíso',
    coordinates: { lat: -32.7117, lon: -71.4889 },
    description: 'Pintoresca caleta de pescadores artesanales',
    mainSpecies: ['Congrio', 'Corvina', 'Lenguado', 'Pejerrey'],
    portType: 'caleta',
    approximatePopulation: 85
  },

  // REGIÓN DEL LIBERTADOR BERNARDO O'HIGGINS
  {
    id: 'pichilemu',
    name: 'Pichilemu', 
    region: "O'Higgins",
    coordinates: { lat: -34.3928, lon: -72.0089 },
    description: 'Capital del surf y caleta pesquera tradicional',
    mainSpecies: ['Congrio', 'Corvina', 'Lenguado', 'Merluza'],
    portType: 'caleta',
    approximatePopulation: 125
  },
  {
    id: 'bucalemu',
    name: 'Caleta Bucalemu',
    region: "O'Higgins",
    coordinates: { lat: -34.3972, lon: -71.9811 },
    description: 'Caleta rural dedicada a la pesca artesanal',
    mainSpecies: ['Congrio', 'Corvina', 'Cabrilla'],
    portType: 'caleta'
  },

  // REGIÓN DEL MAULE
  {
    id: 'constitucion',
    name: 'Constitución',
    region: 'Maule',
    coordinates: { lat: -35.3333, lon: -72.4167 },
    description: 'Puerto pesquero en desembocadura del río Maule',
    mainSpecies: ['Merluza', 'Congrio', 'Corvina', 'Reineta'],
    portType: 'puerto',
    approximatePopulation: 420
  },
  {
    id: 'curanipe',
    name: 'Curanipe',
    region: 'Maule',
    coordinates: { lat: -35.8167, lon: -72.7000 },
    description: 'Caleta pesquera y balneario familiar',
    mainSpecies: ['Congrio', 'Corvina', 'Lenguado', 'Pejerrey'],
    portType: 'caleta',
    approximatePopulation: 90
  },
  {
    id: 'pelluhue',
    name: 'Caleta Pelluhue',
    region: 'Maule',
    coordinates: { lat: -35.8167, lon: -72.6833 },
    description: 'Tranquila caleta de pescadores en costa maulina',
    mainSpecies: ['Congrio', 'Corvina', 'Cabrilla'],
    portType: 'caleta'
  },

  // REGIÓN DEL BIOBÍO
  {
    id: 'concepcion',
    name: 'Concepción (Talcahuano)',
    region: 'Biobío',
    coordinates: { lat: -36.8, lon: -73.08 },
    description: 'Principal puerto pesquero del sur, gran flota industrial',
    mainSpecies: ['Merluza', 'Sardina', 'Anchoveta', 'Jurel'],
    portType: 'puerto',
    approximatePopulation: 3500
  },
  {
    id: 'tome',
    name: 'Tomé',
    region: 'Biobío',
    coordinates: { lat: -36.6167, lon: -72.9667 },
    description: 'Histórico puerto textil y pesquero',
    mainSpecies: ['Merluza', 'Congrio', 'Sardina', 'Jurel'],
    portType: 'puerto',
    approximatePopulation: 580
  },
  {
    id: 'lebu',
    name: 'Lebu',
    region: 'Biobío',
    coordinates: { lat: -37.6167, lon: -73.6500 },
    description: 'Puerto carbonífero y pesquero en transición',
    mainSpecies: ['Merluza', 'Congrio', 'Corvina', 'Sierra'],
    portType: 'puerto',
    approximatePopulation: 650
  },
  {
    id: 'coliumo',
    name: 'Caleta Coliumo',
    region: 'Biobío',
    coordinates: { lat: -36.5439, lon: -72.9639 },
    description: 'Caleta universitaria con tradición pesquera',
    mainSpecies: ['Loco', 'Erizo', 'Choro', 'Congrio'],
    portType: 'caleta',
    approximatePopulation: 45
  },

  // REGIÓN DE LA ARAUCANÍA
  {
    id: 'puerto-saavedra',
    name: 'Puerto Saavedra',
    region: 'Araucanía',
    coordinates: { lat: -38.7833, lon: -73.4000 },
    description: 'Puerto fluvial y costero en territorio mapuche',
    mainSpecies: ['Merluza', 'Congrio', 'Corvina', 'Sierra'],
    portType: 'puerto',
    approximatePopulation: 180
  },
  {
    id: 'queule',
    name: 'Caleta Queule',
    region: 'Araucanía',
    coordinates: { lat: -39.3833, lon: -73.2167 },
    description: 'Pequeña caleta en desembocadura del río Queule',
    mainSpecies: ['Congrio', 'Corvina', 'Robalo', 'Sierra'],
    portType: 'caleta'
  },

  // REGIÓN DE LOS RÍOS
  {
    id: 'corral',
    name: 'Corral',
    region: 'Los Ríos',
    coordinates: { lat: -39.8833, lon: -73.4333 },
    description: 'Histórico puerto fortificado en bahía de Valdivia',
    mainSpecies: ['Merluza', 'Congrio', 'Corvina', 'Robalo'],
    portType: 'puerto',
    approximatePopulation: 280
  },
  {
    id: 'mehuin',
    name: 'Caleta Mehuín',
    region: 'Los Ríos',
    coordinates: { lat: -39.4333, lon: -73.2000 },
    description: 'Caleta mapuche-huilliche con rica tradición',
    mainSpecies: ['Congrio', 'Corvina', 'Robalo', 'Sierra'],
    portType: 'caleta',
    approximatePopulation: 65
  },

  // REGIÓN DE LOS LAGOS  
  {
    id: 'ancud',
    name: 'Ancud',
    region: 'Los Lagos',
    coordinates: { lat: -41.8697, lon: -73.8203 },
    description: 'Puerto principal del norte de Chiloé',
    mainSpecies: ['Merluza', 'Congrio', 'Corvina', 'Salmón'],
    portType: 'puerto',
    approximatePopulation: 890
  },
  {
    id: 'castro',
    name: 'Castro',
    region: 'Los Lagos',
    coordinates: { lat: -42.4833, lon: -73.7667 },
    description: 'Capital de Chiloé, famoso por sus palafitos',
    mainSpecies: ['Congrio', 'Corvina', 'Robalo', 'Cholga'],
    portType: 'puerto',
    approximatePopulation: 750
  },
  {
    id: 'quellon',
    name: 'Quellón',
    region: 'Los Lagos',
    coordinates: { lat: -43.1167, lon: -73.6167 },
    description: 'Puerto pesquero del sur de Chiloé',
    mainSpecies: ['Merluza', 'Congrio', 'Salmón', 'Centolla'],
    portType: 'puerto',
    approximatePopulation: 1100
  },
  {
    id: 'puerto-montt',
    name: 'Puerto Montt',
    region: 'Los Lagos',
    coordinates: { lat: -41.4693, lon: -72.9424 },
    description: 'Gran puerto salmonero y pesquero del sur',
    mainSpecies: ['Salmón', 'Merluza', 'Congrio', 'Centolla'],
    portType: 'puerto',
    approximatePopulation: 2200
  },

  // REGIÓN DE AYSÉN
  {
    id: 'puerto-aysen',
    name: 'Puerto Aysén',
    region: 'Aysén',
    coordinates: { lat: -45.4000, lon: -72.6833 },
    description: 'Puerto fluvial en los canales patagónicos',
    mainSpecies: ['Salmón', 'Merluza austral', 'Centolla', 'Erizo'],
    portType: 'puerto',
    approximatePopulation: 420
  },
  {
    id: 'coyhaique',
    name: 'Coyhaique (Puerto Chacabuco)',
    region: 'Aysén',
    coordinates: { lat: -45.4667, lon: -72.8167 },
    description: 'Puerto de la capital regional, conexión austral',
    mainSpecies: ['Salmón', 'Merluza austral', 'Centolla', 'Centollón'],
    portType: 'puerto',
    approximatePopulation: 320
  },
  {
    id: 'puerto-cisnes',
    name: 'Puerto Cisnes',
    region: 'Aysén',
    coordinates: { lat: -44.7500, lon: -72.7000 },
    description: 'Pequeño puerto en los fiordos ayseninos',
    mainSpecies: ['Salmón', 'Merluza austral', 'Centolla'],
    portType: 'puerto',
    approximatePopulation: 95
  },

  // REGIÓN DE MAGALLANES
  {
    id: 'punta-arenas',
    name: 'Punta Arenas',
    region: 'Magallanes',
    coordinates: { lat: -53.1638, lon: -70.9171 },
    description: 'Puerto principal del estrecho de Magallanes',
    mainSpecies: ['Centolla', 'Centollón', 'Merluza austral', 'Krill'],
    portType: 'puerto',
    approximatePopulation: 1800
  },
  {
    id: 'puerto-natales',
    name: 'Puerto Natales',
    region: 'Magallanes',
    coordinates: { lat: -51.7167, lon: -72.5000 },
    description: 'Puerto en seno Última Esperanza, turismo y pesca',
    mainSpecies: ['Centolla', 'Salmón', 'Merluza austral'],
    portType: 'puerto',
    approximatePopulation: 380
  },
  {
    id: 'puerto-williams',
    name: 'Puerto Williams',
    region: 'Magallanes',
    coordinates: { lat: -54.9333, lon: -67.6167 },
    description: 'Ciudad más austral del mundo, en canal Beagle',
    mainSpecies: ['Centolla', 'Centollón', 'Merluza austral', 'Robalo'],
    portType: 'puerto',
    approximatePopulation: 120
  },
  {
    id: 'porvenir',
    name: 'Porvenir',
    region: 'Magallanes',
    coordinates: { lat: -53.2969, lon: -70.3689 },
    description: 'Puerto en Tierra del Fuego',
    mainSpecies: ['Centolla', 'Merluza austral', 'Robalo'],
    portType: 'puerto',
    approximatePopulation: 180
  }
]

// Funciones de utilidad
export function getPortsByRegion(region: string): FishingPort[] {
  return CHILEAN_FISHING_PORTS.filter(port => port.region === region)
}

export function getPortById(id: string): FishingPort | undefined {
  return CHILEAN_FISHING_PORTS.find(port => port.id === id)
}

export function getAllRegions(): string[] {
  const uniqueRegions = new Set(CHILEAN_FISHING_PORTS.map(port => port.region))
  const regions = Array.from(uniqueRegions)
  return regions.sort()
}

export function searchPorts(query: string): FishingPort[] {
  const searchTerm = query.toLowerCase()
  return CHILEAN_FISHING_PORTS.filter(port => 
    port.name.toLowerCase().includes(searchTerm) ||
    port.region.toLowerCase().includes(searchTerm) ||
    port.description.toLowerCase().includes(searchTerm) ||
    port.mainSpecies.some(species => species.toLowerCase().includes(searchTerm))
  )
}