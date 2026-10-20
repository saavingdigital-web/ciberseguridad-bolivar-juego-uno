// CiberDetective: Puerto Nexo · Contenido del juego (entrada única del módulo CONTENIDO)
// Contrato: ARQUITECTURA.md, sección 6.
// Fuente: charla "Supervivencia Digital: tu guía definitiva contra ciberamenazas"
// (Secretaría de las TIC de Bolívar). Personas, marcas, apps y dominios son FICTICIOS.

import { CASOS_ERA_1_2 } from './casos-era1-2.js';
import { CASOS_ERA_3_4 } from './casos-era3-4.js';

// ───────────────────────────── ERAS ─────────────────────────────
// El ciclo del Ciudadano Digital Seguro: CONOCE → APLICA → REACCIONA → DENUNCIA.
// Requisitos pensados para unos 2 casos por era (era 2 ≈ 2 casos, era 3 ≈ 4, era 4 ≈ 7).
export const ERAS = [
  {
    n: 1,
    id: 'conoce',
    nombre: 'CONOCE',
    subtitulo: 'El Mapa',
    descripcion: 'Identifica los engaños y la ingeniería social, y asume que tu vida digital requiere protección activa.',
    requisito: { casos: 0, presupuesto: 0, evidencia: 0 },
    color: '#f07c2a'
  },
  {
    n: 2,
    id: 'aplica',
    nombre: 'APLICA',
    subtitulo: 'La Armadura',
    descripcion: 'Usa contraseñas únicas, perfiles privados y la verificación en dos pasos como tu escudo invencible.',
    requisito: { casos: 2, presupuesto: 120, evidencia: 20 },
    color: '#3d7fd1'
  },
  {
    n: 3,
    id: 'reacciona',
    nombre: 'REACCIONA',
    subtitulo: 'El Protocolo',
    descripcion: 'Si hay un acceso sospechoso, ejecuta la contención en los primeros 15 minutos.',
    requisito: { casos: 4, presupuesto: 200, evidencia: 40 },
    color: '#7fa64a'
  },
  {
    n: 4,
    id: 'denuncia',
    nombre: 'DENUNCIA',
    subtitulo: 'La Alianza',
    descripcion: 'Recopila evidencia, no borres nada de inmediato, rompe el silencio y contacta a las autoridades.',
    requisito: { casos: 7, presupuesto: 300, evidencia: 60 },
    color: '#8b9bd6'
  }
];

// ───────────────────────────── RECURSOS ─────────────────────────────
export const RECURSOS_INICIALES = { confianza: 60, energia: 100, energiaMax: 100, presupuesto: 150, evidencia: 0 };

// ───────────────────────────── TECNOLOGÍAS ─────────────────────────────
// Tipos de efecto que aplica main.js: 'energia-max', 'regen-energia', 'revelar-tipo',
// 'confianza-pasiva', 'presupuesto-pasivo', 'tiempo-casos'.
export const TECNOLOGIAS = [
  // Era 1 · CONOCE
  {
    id: 'termo-tinto',
    nombre: 'Termo de tinto de guardia',
    icono: '☕',
    descripcion: 'Un buen tinto costeño mantiene despierta a la Unidad: la energía se recupera más rápido (+4 por minuto).',
    era: 1,
    costo: { presupuesto: 60, evidencia: 0 },
    efecto: { tipo: 'regen-energia', valor: 4 }
  },
  {
    id: 'lupa-enlaces',
    nombre: 'Lupa de enlaces',
    icono: '🔗',
    descripcion: 'Expande enlaces acortados y compara el dominio real con el oficial. Las evidencias de tipo URL se analizan gratis.',
    era: 1,
    costo: { presupuesto: 80, evidencia: 5 },
    efecto: { tipo: 'revelar-tipo', valor: 'url' }
  },
  {
    id: 'red-vecinal',
    nombre: 'Red vecinal de alerta',
    icono: '📣',
    descripcion: 'Charlas en barrios y colegios: la ciudadanía reporta antes y confía más en la Central (+1 de confianza por minuto).',
    era: 1,
    costo: { presupuesto: 90, evidencia: 5 },
    efecto: { tipo: 'confianza-pasiva', valor: 1 }
  },
  // Era 2 · APLICA
  {
    id: 'kit-forense',
    nombre: 'Kit forense portátil',
    icono: '🧰',
    descripcion: 'Bloqueadores de escritura, cables y baterías de respaldo para analizar más en cada visita (+30 de energía máxima).',
    era: 2,
    costo: { presupuesto: 110, evidencia: 10 },
    efecto: { tipo: 'energia-max', valor: 30 }
  },
  {
    id: 'conciliador-extractos',
    nombre: 'Conciliador de extractos',
    icono: '🏦',
    descripcion: 'Convenio con las entidades financieras para cruzar movimientos sospechosos al instante. Los extractos se analizan gratis.',
    era: 2,
    costo: { presupuesto: 100, evidencia: 10 },
    efecto: { tipo: 'revelar-tipo', valor: 'extracto' }
  },
  {
    id: 'convenio-alcaldia',
    nombre: 'Convenio con la Alcaldía',
    icono: '🏛️',
    descripcion: 'La Alcaldía de Puerto Nexo financia la Unidad de Delitos Informáticos (+8 de presupuesto por minuto).',
    era: 2,
    costo: { presupuesto: 120, evidencia: 10 },
    efecto: { tipo: 'presupuesto-pasivo', valor: 8 }
  },
  // Era 3 · REACCIONA
  {
    id: 'correlador-registros',
    nombre: 'Correlador de registros',
    icono: '📜',
    descripcion: 'Ordena bitácoras de accesos, llamadas y servidores en una sola línea de tiempo. Los registros se analizan gratis.',
    era: 3,
    costo: { presupuesto: 140, evidencia: 15 },
    efecto: { tipo: 'revelar-tipo', valor: 'registro' }
  },
  {
    id: 'protocolo-15',
    nombre: 'Protocolo de los 15 minutos',
    icono: '⏱️',
    descripcion: 'Contención inmediata: bloquear cuentas, cambiar claves y avisar. Cada incidente nuevo da 60 segundos más de plazo.',
    era: 3,
    costo: { presupuesto: 130, evidencia: 15 },
    efecto: { tipo: 'tiempo-casos', valor: 60 }
  },
  {
    id: 'caja-arena',
    nombre: 'Caja de arena de malware',
    icono: '🧪',
    descripcion: 'Ejecuta archivos sospechosos en un entorno aislado para ver qué hacen de verdad. Los archivos se analizan gratis.',
    era: 3,
    costo: { presupuesto: 130, evidencia: 15 },
    efecto: { tipo: 'revelar-tipo', valor: 'archivo' }
  },
  {
    id: 'rastreador-perfiles',
    nombre: 'Rastreador de perfiles falsos',
    icono: '🪪',
    descripcion: 'Búsqueda inversa de fotos y análisis de cuentas recién creadas. Los perfiles de redes se analizan gratis.',
    era: 3,
    costo: { presupuesto: 150, evidencia: 20 },
    efecto: { tipo: 'revelar-tipo', valor: 'perfil' }
  },
  // Era 4 · DENUNCIA
  {
    id: 'alianza-escuela-familia',
    nombre: 'Alianza escuela-familia',
    icono: '🤝',
    descripcion: 'Padres, profesores y orientadores conectados con la Central: nadie se queda callado (+2 de confianza por minuto).',
    era: 4,
    costo: { presupuesto: 160, evidencia: 15 },
    efecto: { tipo: 'confianza-pasiva', valor: 2 }
  },
  {
    id: 'brigada-apoyo',
    nombre: 'Brigada de apoyo',
    icono: '🚓',
    descripcion: 'Más agentes en turno para cubrir a la detective: la energía se recupera mucho más rápido (+6 por minuto).',
    era: 4,
    costo: { presupuesto: 150, evidencia: 15 },
    efecto: { tipo: 'regen-energia', valor: 6 }
  }
];

// ───────────────────────────── CASOS ─────────────────────────────
// Ordenados por era: main.js lanza el primero disponible de la lista.
export const CASOS = [...CASOS_ERA_1_2, ...CASOS_ERA_3_4];

// ───────────────────────────── INTRO ─────────────────────────────
export const INTRO = [
  {
    titulo: 'Puerto Nexo · Bolívar, 2026',
    texto: 'Una joya costera del Caribe en el corazón de Bolívar: murallas coloniales, brisa salina, grúas portuarias y comercio vibrante. Pero a pocos días del Gran Festival Digital del Caribe, el sindicato «Sombra Phish» ha lanzado una ofensiva silenciosa contra colegios, comercios, bancos y familias.'
  },
  {
    titulo: 'Tú eres el primer escudo',
    texto: 'El 90 % de los ciberataques empiezan engañando a una persona. Un enlace urgente, un código compartido por WhatsApp o un perfil falso pueden abrir la puerta. Mientras los Guardianes Escolares defienden las aulas en la Operación Código Verde, la ciudad entera necesita tu mente analítica.'
  },
  {
    titulo: 'Unidad Especial de la Secretaría TIC',
    texto: 'Eres la inspectora Valeria Ríos, líder de la Unidad de Delitos Informáticos apoyada por la Gobernación de Bolívar y la Secretaría de las TIC. Desde la Central de Ciberpolicía recorrerás Puerto Nexo para contener cada ataque, reconstruir las pruebas forenses y devolver la tranquilidad a los ciudadanos.'
  },
  {
    titulo: 'Protocolo de mando',
    texto: 'Selecciona a la inspectora Ríos con clic izquierdo y envíala con clic derecho al edificio en alerta. Analizar evidencia consume energía ⚡; resolver cada expediente otorga presupuesto 💰, evidencia 🔍 y confianza ciudadana 🤝. Investiga mejoras en el Laboratorio Forense y despliega el Firewall de Bolívar desde la Central.'
  },
  {
    titulo: 'El ciclo del Ciudadano Digital Seguro',
    texto: 'CONOCE el mapa de engaños, APLICA tu armadura digital, REACCIONA en los primeros 15 minutos y DENUNCIA en alianza con las autoridades. El estafador necesita que actúes con miedo y prisa; tu superpoder es la pausa y la verificación.'
  }
];

// ───────────────────────────── FINAL ─────────────────────────────
export const FINAL = {
  titulo: '¡Puerto Nexo y Bolívar están protegidos!',
  texto: 'Desarticulaste la ofensiva de «Sombra Phish» y completaste las cuatro eras del Ciudadano Digital Seguro: conociste las trampas, blindaste cuentas con verificación en dos pasos, reaccionaste en los primeros 15 minutos y denunciaste en equipo. En Bolívar la ciberseguridad no se juega en solitario: hoy eres el escudo digital de tu colegio, tu barrio y tu familia.',
  cita: 'La seguridad digital no depende únicamente de la tecnología; nace de la pausa, el criterio y la solidaridad con que protegemos a nuestra comunidad.'
};

// ───────────────────────────── AUTORIDADES ─────────────────────────────
// VERIFICAR antes de publicar: datos tomados de la presentación
export const AUTORIDADES = [
  {
    incidente: 'Phishing, robo de WhatsApp o de cuentas de chat, ciberacoso y extorsión digital',
    nombre: 'Centro Cibernético Policial (CAI Virtual)',
    contacto: 'caivirtual@policia.gov.co · 01 8000 910 112'
  },
  {
    incidente: 'Hurto informático y acceso abusivo a sistemas',
    nombre: 'Fiscalía General de la Nación',
    contacto: 'Sistema ADenunciar'
  },
  {
    incidente: 'Robo de datos personales y uso indebido de información',
    nombre: 'Superintendencia de Industria y Comercio (SIC)',
    contacto: 'Denuncia por uso indebido de datos personales ante la SIC'
  },
  {
    incidente: 'Fraudes bancarios y transacciones no reconocidas',
    nombre: 'Banco y Superintendencia Financiera de Colombia',
    contacto: 'Línea oficial de tu banco (al respaldo de la tarjeta) · Superintendencia Financiera de Colombia'
  },
  {
    incidente: 'Ciberestrés, presión en redes o cualquier situación que te afecte (ecosistema de apoyo)',
    nombre: 'Red de apoyo: padres, profesores y orientación escolar',
    contacto: 'Habla con un adulto de confianza · usa los botones de Reportar y Bloquear de las apps'
  }
];

// ───────────────────────────── DETECTIVE ─────────────────────────────
export const DETECTIVE = {
  nombre: 'Valeria Ríos',
  rango: 'Inspectora · Unidad de Delitos Informáticos',
  retrato: '🕵️‍♀️',
  frases: {
    seleccion: [
      'Inspectora Ríos, a la orden.',
      '¿Qué tenemos, compañero?',
      'Lista. Y con el celular actualizado.',
      'Dígame dónde huele a phishing.',
      'Antes de actuar, una pausa. Ahora sí: ¿a dónde voy?'
    ],
    orden: [
      'Voy para allá.',
      'En camino. Que nadie borre nada.',
      'Entendido. Llego en un momento.',
      'Recibido. Primero la evidencia, después las conclusiones.',
      'Copiado. Ese ciberdelincuente no se me escapa.'
    ],
    llegada: [
      'Llegué. Todo tranquilo por aquí.',
      'Sin incidentes en este punto.',
      'Zona revisada: nada sospechoso.',
      'Aquí no hay nada... por ahora.',
      'En posición. A la espera de nuevas alertas.'
    ]
  }
};
