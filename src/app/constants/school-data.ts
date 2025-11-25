// Estructura para el dropdown en cascada (Nombres completos)
export const SCHOOLS_DATA = {
  "Escuela de Informática y Telecomunicaciones": [
    "Ingeniería en Informática",
    "Analista Programador",
    "Ingeniería en Redes y Telecomunicaciones"
  ],
  "Escuela de Turismo y Hospitalidad": [
    "Administración en Turismo y Hospitalidad Mención Gestión de Destinos Turísticos",
    "Administración en Turismo y Hospitalidad Mención Gestión para el Ecoturismo",
    "Administración en Turismo y Hospitalidad Mención Administración Hotelera"
  ],
  "Escuela de Administración y Negocios": [
    "Ingeniería en Marketing Digital",
    "Contabilidad General Mención Legislación Tributaria",
    "Auditoría",
    "Comercio Exterior",
    "Ingeniería en Gestión Logística",
    "Ingeniería en Comercio Exterior",
    "Ingeniería en Administración Mención Gestión de Personas",
    "Ingeniería en Administración Mención Innovación y Emprendimiento",
    "Ingeniería en Administración Mención Finanzas",
    "Técnico en Gestión Logística"
  ],
  "Escuela de Ingeniería y Recursos Naturales": [
    "Técnico en Electricidad y Automatización Industrial",
    "Ingeniería en Maquinaria y Vehículos Pesados",
    "Ingeniería en Electricidad y Automatización Industrial",
    "Ingeniería Agrícola",
    "Ingeniería en Medio Ambiente",
    "Ingeniería en Mecánica Automotriz y Autotrónica",
    "Técnico Agrícola",
    "Técnico Veterinario y Pecuario",
    "Técnico en Mecánica Automotriz y Autotrónica",
    "Técnico en Maquinaria y Vehículos Pesados"
  ],
  "Escuela de Salud y Bienestar": [
    "Preparador Físico",
    "Técnico de Laboratorio Clínico y Banco de Sangre",
    "Técnico de Enfermería",
    "Técnico en Química y Farmacia",
    "Técnico en Odontología"
  ],
  "Escuela de Construcción": [
    "Ingeniería en Construcción",
    "Ingeniería en Prevención de Riesgos",
    "Técnico en Construcción"
  ]
};

// --- MAPAS DE ESCUELAS ---
const SCHOOL_NAME_TO_CODE: { [key: string]: string } = {
  'Escuela de Informática y Telecomunicaciones': 'IT',
  'Escuela de Turismo y Hospitalidad': 'TH',
  'Escuela de Administración y Negocios': 'AN',
  'Escuela de Ingeniería y Recursos Naturales': 'IRN',
  'Escuela de Salud y Bienestar': 'SB',
  'Escuela de Construcción': 'CON'
};

const SCHOOL_CODE_TO_NAME: { [key: string]: string } = {
  'IT': 'Escuela de Informática y Telecomunicaciones',
  'TH': 'Escuela de Turismo y Hospitalidad',
  'AN': 'Escuela de Administración y Negocios',
  'IRN': 'Escuela de Ingeniería y Recursos Naturales',
  'SB': 'Escuela de Salud y Bienestar',
  'CON': 'Escuela de Construcción'
};

// --- MAPAS DE CARRERAS ---
const CAREER_NAME_TO_CODE: { [key: string]: string } = {
  // Informática
  'Ingeniería en Informática': 'INGINFO',
  'Analista Programador': 'AP',
  'Ingeniería en Redes y Telecomunicaciones': 'INGRT',
  // Turismo
  'Administración en Turismo y Hospitalidad Mención Gestión de Destinos Turísticos': 'TDES',
  'Administración en Turismo y Hospitalidad Mención Gestión para el Ecoturismo': 'TECOT',
  'Administración en Turismo y Hospitalidad Mención Administración Hotelera': 'THOT',
  // Negocios
  'Ingeniería en Marketing Digital': 'IMD',
  'Contabilidad General Mención Legislación Tributaria': 'CONTTRI',
  'Auditoría': 'AUD',
  'Comercio Exterior': 'COMEX',
  'Ingeniería en Gestión Logística': 'INGLOG',
  'Ingeniería en Comercio Exterior': 'INGCOMEX',
  'Ingeniería en Administración Mención Gestión de Personas': 'INGGP',
  'Ingeniería en Administración Mención Innovación y Emprendimiento': 'INGEMP',
  'Ingeniería en Administración Mención Finanzas': 'INGFIN',
  'Técnico en Gestión Logística': 'TLOG',
  // Ingeniería y RRNN
  'Técnico en Electricidad y Automatización Industrial': 'TELEC',
  'Ingeniería en Maquinaria y Vehículos Pesados': 'IMP',
  'Ingeniería en Electricidad y Automatización Industrial': 'INGELEC',
  'Ingeniería Agrícola': 'INGAGRI',
  'Ingeniería en Medio Ambiente': 'INGMA',
  'Ingeniería en Mecánica Automotriz y Autotrónica': 'INGAUTO',
  'Técnico Agrícola': 'TAGRI',
  'Técnico Veterinario y Pecuario': 'TVET',
  'Técnico en Mecánica Automotriz y Autotrónica': 'TAUTO',
  'Técnico en Maquinaria y Vehículos Pesados': 'TMP',
  // Salud
  'Preparador Físico': 'PF',
  'Técnico de Laboratorio Clínico y Banco de Sangre': 'TLC',
  'Técnico de Enfermería': 'TENF',
  'Técnico en Química y Farmacia': 'TQF',
  'Técnico en Odontología': 'TODON',
  // Construcción
  'Ingeniería en Construcción': 'INGCON',
  'Ingeniería en Prevención de Riesgos': 'INGPR',
  'Técnico en Construcción': 'TCON'
};

// Invertimos el mapa anterior para obtener Código -> Nombre
const CAREER_CODE_TO_NAME: { [key: string]: string } = Object.entries(CAREER_NAME_TO_CODE).reduce((acc, [name, code]) => {
  acc[code] = name;
  return acc;
}, {} as { [key: string]: string });


// --- FUNCIONES HELPER ---
export function getSchoolCode(name: string): string {
  return SCHOOL_NAME_TO_CODE[name] || name;
}

export function getSchoolName(code: string): string {
  return SCHOOL_CODE_TO_NAME[code] || code;
}

export function getCareerCode(name: string): string {
  return CAREER_NAME_TO_CODE[name] || name;
}

export function getCareerName(code: string): string {
  return CAREER_CODE_TO_NAME[code] || code;
}