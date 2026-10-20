// CiberDetective · iconografía SVG propia (sin marcas ni arte de terceros)

const svg = (cuerpo, vb = '0 0 24 24', extra = '') =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" focusable="false" ${extra}>${cuerpo}</svg>`;

const grad = (id, a, b, c) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/>${c ? `<stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>` : `<stop offset="1" stop-color="${b}"/>`}</linearGradient></defs>`;

export const ICONOS = {
  // ---------- Recursos ----------
  confianza: svg(
    grad('cdgConf', '#9dffd7', '#22c98a', '#0b6b4a') +
    `<path d="M2.2 11.4 6 7.6l3 1.1 2.6-1.6c.9-.5 2-.4 2.7.3l5.3 5.2c.7.7.7 1.8 0 2.5-.6.6-1.5.7-2.2.2l.2.2c.7.7.7 1.8 0 2.4-.6.6-1.6.7-2.3.1.3.7.1 1.5-.5 2-.7.5-1.6.4-2.2-.2l-.4-.4c.1.6-.1 1.2-.6 1.6-.7.5-1.7.4-2.3-.3L4 14.6Z" fill="url(#cdgConf)" stroke="#04140e" stroke-width=".9" stroke-linejoin="round"/>
     <path d="M21.8 11.4 18 7.6l-3.3.9" fill="none" stroke="#9dffd7" stroke-width="1.6" stroke-linecap="round"/>
     <path d="M9.4 10.6 12 9l2.3 2.2" fill="none" stroke="#04140e" stroke-width="1" stroke-linecap="round" opacity=".7"/>`),
  energia: svg(
    grad('cdgEne', '#fff6b0', '#ffc21a', '#c46a00') +
    `<path d="M13.6 1.8 4.4 13.4h6.1l-1.4 8.8 9.7-12.4h-6.3z" fill="url(#cdgEne)" stroke="#2a1600" stroke-width="1" stroke-linejoin="round"/>
     <path d="M12.4 4.6 7.6 11" stroke="#fffbe0" stroke-width="1" stroke-linecap="round" opacity=".8"/>`),
  presupuesto: svg(
    grad('cdgPre', '#fff1b8', '#e7b23c', '#8a5a10') +
    `<ellipse cx="12" cy="17.6" rx="8" ry="3" fill="url(#cdgPre)" stroke="#2b1a03" stroke-width=".9"/>
     <ellipse cx="12" cy="13.6" rx="8" ry="3" fill="url(#cdgPre)" stroke="#2b1a03" stroke-width=".9"/>
     <ellipse cx="12" cy="9.4" rx="8" ry="3" fill="url(#cdgPre)" stroke="#2b1a03" stroke-width=".9"/>
     <ellipse cx="12" cy="9.4" rx="4.6" ry="1.5" fill="none" stroke="#fff4c6" stroke-width=".8" opacity=".8"/>
     <path d="M12 8.3v2.2" stroke="#6b4206" stroke-width="1.1" stroke-linecap="round"/>`),
  evidencia: svg(
    grad('cdgEvi', '#c9fbff', '#2fd8f0', '#0a6f86') +
    `<circle cx="10" cy="10" r="6.6" fill="#06222c" stroke="url(#cdgEvi)" stroke-width="2.4"/>
     <path d="M7.2 9.4c.4-1.8 2.1-3 4-2.6M7.6 12c-.4-.6-.6-1.2-.6-1.9M10 13.3c-1.1 0-1.9-.9-1.9-2 0-1 .9-1.8 1.9-1.8s1.9.8 1.9 1.8" fill="none" stroke="#8ef5ff" stroke-width=".9" stroke-linecap="round"/>
     <path d="m15 15 5.6 5.6" stroke="#e7b23c" stroke-width="3.2" stroke-linecap="round"/>
     <path d="m15 15 5.6 5.6" stroke="#2b1a03" stroke-width="1" stroke-linecap="round" opacity=".5"/>`),

  // ---------- Interfaz ----------
  reloj: svg(`<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5.2l3.4 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`),
  menu: svg(`<path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`),
  pausa: svg(`<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>`),
  jugar: svg(`<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>`),
  cerrar: svg(`<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`),
  check: svg(`<path d="m4.5 12.5 4.6 4.6L19.5 6.7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  cruz: svg(`<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`),
  candado: svg(`<rect x="5" y="10.5" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/>`),
  candadoAbierto: svg(`<rect x="5" y="10.5" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.8" fill="none" stroke="currentColor" stroke-width="2"/>`),
  advertencia: svg(`<path d="M12 3 22 20H2z" fill="currentColor"/><path d="M12 9.5v5" stroke="#1a0d00" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.4" r="1.2" fill="#1a0d00"/>`),
  info: svg(`<circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="M12 10.8v6" stroke="#00141a" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.3" fill="#00141a"/>`),
  exito: svg(`<circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="m7.4 12.4 3.1 3.1 6.1-6.4" fill="none" stroke="#00170d" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`),
  error: svg(`<path d="M8 2.5h8l5.5 5.5v8L16 21.5H8L2.5 16V8z" fill="currentColor"/><path d="m8.6 8.6 6.8 6.8m0-6.8-6.8 6.8" stroke="#1d0303" stroke-width="2.3" stroke-linecap="round"/>`),
  alerta: svg(`<path d="M12 2.5c-3.6 0-6 2.7-6 6.3v4.4L4 17h16l-2-3.8V8.8c0-3.6-2.4-6.3-6-6.3Z" fill="currentColor"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0" fill="currentColor"/>`),
  estrella: svg(`<path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="currentColor"/>`),
  estrellaVacia: svg(`<path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`),
  escaner: svg(`<path d="M3 8V4.5A1.5 1.5 0 0 1 4.5 3H8M16 3h3.5A1.5 1.5 0 0 1 21 4.5V8M21 16v3.5a1.5 1.5 0 0 1-1.5 1.5H16M8 21H4.5A1.5 1.5 0 0 1 3 19.5V16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`),
  clip: svg(`<path d="m20 11.5-8.2 8.2a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.4 8.4a1.7 1.7 0 0 1-2.4-2.4l7.6-7.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`),
  escudo: svg(`<path d="M12 2.4 20 5.6v6c0 5-3.4 8.8-8 10.2-4.6-1.4-8-5.2-8-10.2v-6z" fill="currentColor"/><path d="m8.2 12 2.7 2.7 5-5.2" fill="none" stroke="#04140e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`),
  carpeta: svg(`<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.2h8.5A1.5 1.5 0 0 1 21 8.7v9.8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" fill="currentColor"/>`),
  bateria: svg(`<rect x="2.5" y="7" width="17" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="4.5" y="9" width="10" height="6" rx=".8" fill="currentColor"/><rect x="20" y="10" width="2" height="4" rx=".6" fill="currentColor"/>`),
  senal: svg(`<rect x="3" y="15" width="3" height="5" rx=".6" fill="currentColor"/><rect x="8" y="11.5" width="3" height="8.5" rx=".6" fill="currentColor"/><rect x="13" y="8" width="3" height="12" rx=".6" fill="currentColor"/><rect x="18" y="4.5" width="3" height="15.5" rx=".6" fill="currentColor" opacity=".35"/>`),
  flecha: svg(`<path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`),
  atras: svg(`<path d="M19 12H6m5-5-5 5 5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`),
  recargar: svg(`<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`),
  ayuda: svg(`<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.3 9.4a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.2.9-1.2 1.8v.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17.2" r="1.1" fill="currentColor"/>`),
  telefono: svg(`<path d="M6.6 3.5h3l1.4 4-2 1.4a11 11 0 0 0 6.1 6.1l1.4-2 4 1.4v3A2 2 0 0 1 18.4 19.5 15 15 0 0 1 4.5 5.6 2 2 0 0 1 6.6 3.5Z" fill="currentColor"/>`),
  lupa: svg(`<circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m15 15 5 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`),
  matraz: svg(`<path d="M9 3h6M10 3v6l-5.4 9.2A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.8L14 9V3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.2 15h9.6l2 3.4c.3.6-.1 1.3-.8 1.3H6c-.7 0-1.1-.7-.8-1.3z" fill="currentColor"/>`),
  maletin: svg(`<rect x="3" y="7.5" width="18" height="12" rx="2" fill="currentColor"/><path d="M9 7.5V5.6c0-.6.5-1.1 1.1-1.1h3.8c.6 0 1.1.5 1.1 1.1v1.9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12.5h18" stroke="#0b0d12" stroke-width="1.2"/>`)
};

/** Emblema heráldico de una era (escudo con número romano). */
export function emblemaEra(n = 1, color = '#00e5ff', tam = 64) {
  const romanos = ['', 'I', 'II', 'III', 'IV', 'V'];
  const r = romanos[n] || String(n);
  const id = `cdEra${n}${Math.random().toString(36).slice(2, 7)}`;
  return `<svg viewBox="0 0 64 72" width="${tam}" height="${tam * 72 / 64}" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
  <defs>
    <linearGradient id="${id}o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe6a6"/><stop offset=".45" stop-color="#c8963a"/><stop offset="1" stop-color="#5d3c0c"/></linearGradient>
    <radialGradient id="${id}c" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="${color}" stop-opacity=".95"/><stop offset=".6" stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="#05080e" stop-opacity="1"/></radialGradient>
    <filter id="${id}f" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>
  <path d="M32 3 58 11v20c0 18-11 30-26 38C17 61 6 49 6 31V11Z" fill="${color}" opacity=".35" filter="url(#${id}f)"/>
  <path d="M32 3 58 11v20c0 18-11 30-26 38C17 61 6 49 6 31V11Z" fill="url(#${id}o)" stroke="#1a1004" stroke-width="1.4"/>
  <path d="M32 8.5 53 15v16c0 15-9 25-21 32C20 56 11 46 11 31V15Z" fill="url(#${id}c)" stroke="#2a1a05" stroke-width="1"/>
  <path d="M32 8.5 53 15v16c0 15-9 25-21 32" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1"/>
  <path d="M14 22h36M14 44h36" stroke="${color}" stroke-opacity=".5" stroke-width=".8" stroke-dasharray="2 2"/>
  <circle cx="32" cy="13.5" r="2.2" fill="#fbe6a6" stroke="#3b2507" stroke-width=".6"/>
  <text x="32" y="${n >= 4 ? 41.5 : 42}" text-anchor="middle" font-family="Cinzel, serif" font-weight="800" font-size="${r.length > 2 ? 16 : 20}" fill="#fff8e1" stroke="#0a0602" stroke-width=".8" paint-order="stroke">${r}</text>
</svg>`;
}

/** Emblema del juego: escudo con lupa y circuito. */
export function emblemaLogo(tam = 96) {
  return `<svg viewBox="0 0 120 130" width="${tam}" height="${tam * 130 / 120}" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
  <defs>
    <linearGradient id="cdLogoO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffeec0"/><stop offset=".4" stop-color="#d4a54a"/><stop offset="1" stop-color="#5a3a0b"/></linearGradient>
    <radialGradient id="cdLogoC" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#0d4a5c"/><stop offset="1" stop-color="#03080e"/></radialGradient>
    <linearGradient id="cdLogoL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9fbff"/><stop offset="1" stop-color="#00a9c7"/></linearGradient>
    <filter id="cdLogoG"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <path d="M60 4 110 19v37c0 33-21 56-50 70C31 112 10 89 10 56V19Z" fill="#00e5ff" opacity=".25" filter="url(#cdLogoG)"/>
  <path d="M60 4 110 19v37c0 33-21 56-50 70C31 112 10 89 10 56V19Z" fill="url(#cdLogoO)" stroke="#1b1003" stroke-width="2"/>
  <path d="M60 13 101 25v31c0 28-17 47-41 60C36 103 19 84 19 56V25Z" fill="url(#cdLogoC)" stroke="#2c1b05" stroke-width="1.5"/>
  <g stroke="#00e5ff" stroke-opacity=".55" stroke-width="1.4" fill="none">
    <path d="M30 40h14l6 6M90 40H76l-6 6M30 82h12l8-8M90 82H78l-8-8"/>
  </g>
  <g fill="#00e5ff"><circle cx="30" cy="40" r="2"/><circle cx="90" cy="40" r="2"/><circle cx="30" cy="82" r="2"/><circle cx="90" cy="82" r="2"/></g>
  <circle cx="56" cy="56" r="17" fill="#04161d" stroke="url(#cdLogoL)" stroke-width="5"/>
  <path d="M47 53c1.5-5 6-8 11-7M48 61c-1-1.5-1.5-3-1.5-4.8M56 64c-3.6 0-6-2.8-6-6 0-3.2 2.7-5.8 6-5.8s6 2.6 6 5.8M56 58.2v4" fill="none" stroke="#7ff3ff" stroke-width="1.6" stroke-linecap="round"/>
  <path d="m69 69 16 16" stroke="url(#cdLogoO)" stroke-width="8" stroke-linecap="round"/>
  <path d="m69 69 16 16" stroke="#1b1003" stroke-width="2" stroke-linecap="round" opacity=".5"/>
</svg>`;
}

/** Escudo grande para la tarjeta de Escudo táctico. */
export function emblemaEscudo(tam = 140) {
  return `<svg viewBox="0 0 120 134" width="${tam}" height="${tam * 134 / 120}" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
  <defs>
    <linearGradient id="cdEscO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c8"/><stop offset=".45" stop-color="#d9a84a"/><stop offset="1" stop-color="#5a3a0b"/></linearGradient>
    <linearGradient id="cdEscC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ffcd0"/><stop offset=".55" stop-color="#0c9a73"/><stop offset="1" stop-color="#03281e"/></linearGradient>
    <filter id="cdEscG"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <path d="M60 5 112 22v38c0 34-22 58-52 70C30 118 8 94 8 60V22Z" fill="#2ee59d" opacity=".35" filter="url(#cdEscG)"/>
  <path d="M60 5 112 22v38c0 34-22 58-52 70C30 118 8 94 8 60V22Z" fill="url(#cdEscO)" stroke="#1b1003" stroke-width="2"/>
  <path d="M60 14 103 28v32c0 29-18 50-43 61C35 110 17 89 17 60V28Z" fill="url(#cdEscC)" stroke="#2c1b05" stroke-width="1.5"/>
  <path d="M60 14 103 28v32c0 29-18 50-43 61" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1.5"/>
  <path d="m38 64 15 15 30-31" fill="none" stroke="#04140e" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/>
  <path d="m38 62 15 15 30-31" fill="none" stroke="#f4fff9" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

// =====================================================================
// Iconos GRABADOS: siluetas rellenas que se pintan con un degradado dorado,
// trazo oscuro y sombra (ver .cd-grabado en estilo.css). Sustituyen a todos los emoji.
// =====================================================================
const g = d => svg(`<path fill="currentColor" fill-rule="evenodd" d="${d}"/>`);
export const GRABADOS = {
  lupa: g('M10.5 3a7.5 7.5 0 1 0 4.55 13.46l4.75 4.75a1.4 1.4 0 0 0 2-2l-4.75-4.75A7.5 7.5 0 0 0 10.5 3Zm0 2.6a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Z'),
  central: g('M12 2.5 2.5 7.5v1.8h19V7.5ZM12 4.9a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM4 10.5h3v7H4Zm6.5 0h3v7h-3Zm6.5 0h3v7h-3ZM2.5 18.6h19V21h-19Z'),
  alcaldia: g('M12 1.8a3 3 0 0 1 3 3.2H9a3 3 0 0 1 3-3.2ZM3 8l9-2.4L21 8v1.6H3Zm1.5 2.6h2.6v7H4.5Zm6.2 0h2.6v7h-2.6Zm6.2 0h2.6v7h-2.6ZM2.5 18.6h19V21h-19Z'),
  ascender: g('M12 2.5 3.5 11H8v3.2h8V11h4.5ZM8 15.6h8v2.2H8Zm0 3.4h8v2H8Z'),
  volver: g('M12 3 2 11.5h2.6V21h5.4v-5.6h4V21h5.4v-9.5H22Z'),
  banco: g('M12 2.5 2.5 7v2h19V7Zm1.3 3.4a1.3 1.3 0 1 0-2.6 0 1.3 1.3 0 0 0 2.6 0ZM4 10h2.6v7.5H4Zm4.5 0h2.6v7.5H8.5Zm4.4 0h2.6v7.5h-2.6Zm4.5 0H20v7.5h-2.6ZM2.5 18.5h19V21h-19Z'),
  colegio: g('M11.3 2h1.4v5h-1.4Zm1.4 0h4.8l-1.3 1.5 1.3 1.5h-4.8ZM12 6.5 3 11.5V21h6.5v-5h5v5H21v-9.5ZM5.5 13h2.5v2.4H5.5Zm10.5 0h2.5v2.4H16Z'),
  mando: g('M7 7h10c2.9 0 4.6 2.4 5 5.6l.6 4.4c.3 2.2-2.4 3.5-4 1.9L16 16.3H8l-2.6 2.6c-1.6 1.6-4.3.3-4-1.9l.6-4.4C2.4 9.4 4.1 7 7 7Zm-.8 3.2v1.6H4.6v1.6h1.6V15h1.6v-1.6h1.6v-1.6H7.8v-1.6Zm10.3.3a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2.1 2.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z'),
  taza: g('M4 9h12v5.5A5.5 5.5 0 0 1 10.5 20h-1A5.5 5.5 0 0 1 4 14.5Zm12 1.2h1.6a2.9 2.9 0 0 1 0 5.8H16v-1.8h1.6a1.1 1.1 0 0 0 0-2.2H16ZM3 21h14v1.4H3ZM7.7 2.3l1.2.7c-1 1.4.9 2.1-.1 3.7l-1.2-.7c.8-1.3-.9-2.1.1-3.7Zm3.6 0 1.2.7c-1 1.4.9 2.1-.1 3.7l-1.2-.7c.8-1.3-.9-2.1.1-3.7Z'),
  movil: g('M7.5 2h9A1.5 1.5 0 0 1 18 3.5v17a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20.5v-17A1.5 1.5 0 0 1 7.5 2ZM8 4.5v13h8v-13Zm4 14.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z'),
  antena: g('M11 8h2l4.5 14h-2.2L14 18h-4l-1.3 4H6.5Zm-.4 8h2.8l-.9-3h-1ZM12 2.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM6.3 2.2l1.3 1a6 6 0 0 0 0 5.4l-1.3 1a7.8 7.8 0 0 1 0-7.4Zm11.4 0a7.8 7.8 0 0 1 0 7.4l-1.3-1a6 6 0 0 0 0-5.4Z'),
  ancla: g('M12 2a2.6 2.6 0 0 1 1 5v1.8h3.5v2H13v8.1c2.6-.4 4.6-2.3 5.2-4.8H16l3.2-3.6 3 3.6h-2.1c-.8 4-4.3 7-8.1 7s-7.3-3-8.1-7H1.8l3-3.6L8 14.1H5.8c.6 2.5 2.6 4.4 5.2 4.8v-8.1H7.5v-2H11V7a2.6 2.6 0 0 1 1-5Zm0 1.8a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z'),
  casa: g('M12 3 2 11.5h2.6V21h5.4v-5.6h4V21h5.4v-9.5H22ZM10.6 9.5h2.8v2.6h-2.8Z'),
  tienda: g('M3 4h18l1.5 5a2.5 2.5 0 0 1-4.8 1 2.5 2.5 0 0 1-4.7 0 2.5 2.5 0 0 1-4.7 0A2.5 2.5 0 0 1 1.5 9ZM4 12.5h16V21H4Zm2.5 2v4.5h4v-4.5Zm6.5 0h4.5V18H13Z'),
  edificio: g('M5 2h10v20H5ZM7 4.5v2h2v-2Zm4 0v2h2v-2ZM7 8.5v2h2v-2Zm4 0v2h2v-2Zm-4 4v2h2v-2Zm4 0v2h2v-2Zm-2 4.5V22h2v-5ZM16 9h4v13h-4Z'),
  pin: g('M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Zm0 4.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z'),
  engranaje: g('M10.3 2h3.4l.5 2.6 1.6.7 2.2-1.5 2.4 2.4-1.5 2.2.7 1.6 2.6.5v3.4l-2.6.5-.7 1.6 1.5 2.2-2.4 2.4-2.2-1.5-1.6.7-.5 2.6h-3.4l-.5-2.6-1.6-.7-2.2 1.5-2.4-2.4 1.5-2.2-.7-1.6L2 13.7v-3.4l2.6-.5.7-1.6-1.5-2.2 2.4-2.4 2.2 1.5 1.6-.7ZM12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z'),
  personas: g('M8 4a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 8 4Zm8.5 1a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6ZM2 19c0-3.6 2.7-6.6 6-6.6s6 3 6 6.6v1.5H2Zm13 1.5V19c0-1.9-.6-3.6-1.7-5 .9-.6 2-1 3.2-1 3 0 5.5 2.7 5.5 6v1.5Z'),
  imagen: g('M3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13A1.5 1.5 0 0 1 3.5 4Zm1 2.2v9.6l4.6-5 3.6 3.9 2.3-2.4 4.5 4.6V6.2Zm11.5 1.3a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z'),
  brujula: g('M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Zm4.6 3.2-2.8 6.4-6.4 2.8 2.8-6.4ZM12 10.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z'),
  sms: g('M4 3.5h16A2 2 0 0 1 22 5.5v10a2 2 0 0 1-2 2H9.5L5 21.5v-4H4a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2Zm3 6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm5 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm5 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z'),
  chat: g('M3.5 3h11A1.5 1.5 0 0 1 16 4.5v7a1.5 1.5 0 0 1-1.5 1.5H8l-3.5 3v-3h-1A1.5 1.5 0 0 1 2 11.5v-7A1.5 1.5 0 0 1 3.5 3Zm14 4.5h3A1.5 1.5 0 0 1 22 9v7a1.5 1.5 0 0 1-1.5 1.5h-1v3l-3.5-3H11a1.5 1.5 0 0 1-1.5-1.5v-1.5h5a3 3 0 0 0 3-3Z'),
  correo: g('M3.5 5h17A1.5 1.5 0 0 1 22 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5v-11A1.5 1.5 0 0 1 3.5 5Zm.7 2.3v.5l7.8 5.4 7.8-5.4v-.5Zm0 2.9v6.6h15.6v-6.6L12 15.6Z'),
  enlace: svg('<path fill="currentColor" d="M9.2 14.8a1.1 1.1 0 0 1 0-1.6l4-4a1.1 1.1 0 0 1 1.6 1.6l-4 4a1.1 1.1 0 0 1-1.6 0ZM10.6 6.5l1.8-1.8a4.6 4.6 0 0 1 6.5 6.5l-1.8 1.8-1.6-1.6 1.8-1.8a2.3 2.3 0 0 0-3.3-3.3L12.2 8Zm2.8 11-1.8 1.8a4.6 4.6 0 0 1-6.5-6.5l1.8-1.8 1.6 1.6-1.8 1.8a2.3 2.3 0 0 0 3.3 3.3l1.8-1.8Z"/>'),
  terminal: g('M3.5 3.5h17A1.5 1.5 0 0 1 22 5v14a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19V5a1.5 1.5 0 0 1 1.5-1.5Zm.7 4v10.8h15.6V7.5ZM6 9.6l1.3-1.3 3.4 3.4-3.4 3.4L6 13.8l2.1-2.1Zm5.5 5h6v1.8h-6Z'),
  perfil: g('M12 3a4.2 4.2 0 1 1 0 8.4A4.2 4.2 0 0 1 12 3ZM3.5 21c0-4.4 3.8-7.6 8.5-7.6s8.5 3.2 8.5 7.6Z'),
  archivo: g('M5.5 2h9L20 7.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20.5v-17A1.5 1.5 0 0 1 5.5 2Zm8 1.8v4.7h4.7ZM7 12h10v1.6H7Zm0 3.2h10v1.6H7Zm0 3.2h6V20H7Z'),
  megafono: g('M3 9.5h3.5L15 5v14l-8.5-4.5H6l1.2 5H4.6l-1.2-5H3a1.5 1.5 0 0 1-1.5-1.5v-2A1.5 1.5 0 0 1 3 9.5ZM17 9a3.2 3.2 0 0 1 0 6Zm1.6-2.8a6.4 6.4 0 0 1 0 11.6l-.8-1.6a4.6 4.6 0 0 0 0-8.4Z'),
  maletin: g('M9 4h6a1.5 1.5 0 0 1 1.5 1.5V7H20a2 2 0 0 1 2 2v3.2h-8.5V11h-3v1.2H2V9a2 2 0 0 1 2-2h3.5V5.5A1.5 1.5 0 0 1 9 4Zm.2 1.8V7h5.6V5.8ZM2 13.8h8.5v1.4h3v-1.4H22V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z'),
  reloj: g('M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6ZM11 6.5h2v5l3.6 2.2-1 1.7L11 12.6Z'),
  calendario: g('M6 2h2v2h8V2h2v2h2.5A1.5 1.5 0 0 1 22 5.5v15a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 20.5v-15A1.5 1.5 0 0 1 3.5 4H6Zm-1.8 7v10.8h15.6V9Zm2.3 2.5h3v3h-3Zm4 0h3v3h-3Z'),
  credencial: g('M3.5 5h17A1.5 1.5 0 0 1 22 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5v-11A1.5 1.5 0 0 1 3.5 5ZM8 8.2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm-3.4 8.2h6.8c0-2-1.5-3.3-3.4-3.3s-3.4 1.3-3.4 3.3ZM13.5 9h6v1.6h-6Zm0 3.4h6V14h-6Z'),
  sirena: g('M8 9a4 4 0 0 1 8 0v7H8Zm-3 8h14a1.5 1.5 0 0 1 1.5 1.5V21h-17v-2.5A1.5 1.5 0 0 1 5 17Zm6.2-15h1.6v3h-1.6ZM3.6 4.4l1.1-1.1 2.1 2.1-1.1 1.1Zm16.8 0-2.1 2.1-1.1-1.1 2.1-2.1Z'),
  matraz: g('M9 2h6v1.8h-1V9l5.6 9.4A2.4 2.4 0 0 1 17.5 22h-11a2.4 2.4 0 0 1-2.1-3.6L10 9V3.8H9Zm2.8 1.8V9.5L9.9 13h4.2l-1.9-3.5V3.8Z'),
  escudo: g('M12 2.4 20 5.6v6c0 5-3.4 8.8-8 10.2-4.6-1.4-8-5.2-8-10.2v-6Zm-1.1 15-5-5 1.6-1.6 3.4 3.4 6.1-6.3 1.6 1.6Z'),
  candado: g('M7 10V7.5a5 5 0 0 1 10 0V10h1.5A1.5 1.5 0 0 1 20 11.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20.5v-9A1.5 1.5 0 0 1 5.5 10Zm2.2 0h5.6V7.5a2.8 2.8 0 0 0-5.6 0Zm2.8 3.5a1.6 1.6 0 0 0-.8 3V19h1.6v-2.5a1.6 1.6 0 0 0-.8-3Z'),
  rayo: g('M13.6 1.8 4.4 13.4h6.1l-1.4 8.8 9.7-12.4h-6.3z'),
  diamante: g('M12 2 22 12 12 22 2 12Zm0 4.2L6.2 12l5.8 5.8 5.8-5.8Z')
};

// Sustitución de los emoji que llegan desde main.js o datos.js por iconos grabados.
const EMOJI_A_GRABADO = {
  '🔍': 'lupa', '🔎': 'lupa', '🏛': 'central', '⏫': 'ascender', '🧪': 'matraz', '🏦': 'banco', '🏫': 'colegio',
  '🎮': 'mando', '☕': 'taza', '📱': 'movil', '📡': 'antena', '⚓': 'ancla', '🏠': 'casa', '🏢': 'edificio',
  '🔗': 'enlace', '📣': 'megafono', '🧰': 'maletin', '📜': 'terminal', '⏱': 'reloj', '🪪': 'credencial',
  '🤝': 'personas', '🚓': 'sirena', '💬': 'sms', '✉': 'correo', '📎': 'archivo', '👤': 'perfil', '🖥': 'terminal',
  '🛡': 'escudo', '📍': 'pin', '⚙': 'engranaje', '🧭': 'brujula', '🖼': 'imagen', '📅': 'calendario', '🔒': 'candado'
};
export function claveGrabado(valor, porDefecto = 'diamante') {
  if (valor && GRABADOS[valor]) return valor;
  const s = String(valor || '').replace(/️/g, '');
  for (const [e, k] of Object.entries(EMOJI_A_GRABADO)) if (s.includes(e)) return k;
  return porDefecto;
}

/** Elemento <span> con un icono grabado en oro. */
export function grabado(clave, clase = '') {
  const el = document.createElement('span');
  el.className = `cd-ico cd-grabado ${clase}`.trim();
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = GRABADOS[claveGrabado(clave)];
  return el;
}

/** Inserta una vez las definiciones compartidas (degradado dorado) que usan los iconos grabados. */
export function instalarDefsGrabado() {
  if (document.getElementById('cd-defs-grabado')) return;
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg');
  s.setAttribute('id', 'cd-defs-grabado');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('width', '0'); s.setAttribute('height', '0');
  s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  s.innerHTML = `<defs>
    <linearGradient id="cdOroGrabado" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="22">
      <stop offset="0" stop-color="#fff2c4"/><stop offset=".38" stop-color="#e3b65a"/><stop offset=".62" stop-color="#b7832c"/><stop offset="1" stop-color="#7a5414"/></linearGradient>
    <linearGradient id="cdCianGrabado" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="22">
      <stop offset="0" stop-color="#d8feff"/><stop offset=".5" stop-color="#3fe6ff"/><stop offset="1" stop-color="#00809a"/></linearGradient>
  </defs>`;
  document.body.append(s);
}

/** Icono de una acción del panel: por id (investigar, avanzar-era…) o por su emoji. */
export function claveAccion(a = {}, casos = []) {
  const id = String(a.id || '');
  if (id.startsWith('investigar')) {
    // Cada caso se distingue por el icono de su edificio (banco, colegio, casa…); la lupa va como insignia aparte.
    const c = Array.isArray(casos) ? casos.find(x => x && x.id === id.slice(id.indexOf(':') + 1)) : null;
    const e = c?.edificio || '';
    return EDIFICIO_ICONO[e] || (/^casa/.test(e) ? 'casa' : 'lupa');
  }
  if (id === 'volver-central') return 'central';
  if (id === 'avanzar-era') return 'ascender';
  if (id === 'laboratorio') return 'matraz';
  return claveGrabado(a.icono);
}

/** Icono de una tecnología según su efecto. */
export function claveTecnologia(t = {}) {
  const e = t.efecto || {};
  switch (e.tipo) {
    case 'revelar-tipo': return TIPOS_EVIDENCIA[e.valor]?.icono || 'lupa';
    case 'regen-energia': return claveGrabado(t.icono, 'rayo');
    case 'energia-max': return 'maletin';
    case 'confianza-pasiva': return claveGrabado(t.icono, 'personas');
    case 'presupuesto-pasivo': return claveGrabado(t.icono, 'banco');
    case 'tiempo-casos': return 'reloj';
    default: return claveGrabado(t.icono, 'matraz');
  }
}

/** Tipo de edificio a partir del id del catálogo o del emoji del retrato. */
const EDIFICIO_ICONO = {
  central: 'central', laboratorio: 'matraz', banco: 'banco', colegio: 'colegio', cibercafe: 'mando',
  'cafe-malecon': 'taza', tecnostore: 'tienda', 'torre-telecom': 'antena', alcaldia: 'alcaldia', puerto: 'ancla'
};
export function retratoEdificio(id, emoji) {
  const k = EDIFICIO_ICONO[id] || (/^casa/.test(id || '') ? 'casa' : claveGrabado(emoji, 'edificio'));
  const cuerpo = GRABADOS[k].replace(/^<svg[^>]*>|<\/svg>$/g, '');
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" class="cd-retrato-svg" role="img" aria-label="Emblema del edificio" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="cdEdF${k}" cx=".5" cy=".38" r=".8"><stop offset="0" stop-color="#3a5a5e"/><stop offset=".6" stop-color="#16262c"/><stop offset="1" stop-color="#070c10"/></radialGradient>
    <linearGradient id="cdEdO${k}" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="22"><stop offset="0" stop-color="#fff2c4"/><stop offset=".4" stop-color="#e3b65a"/><stop offset=".65" stop-color="#b7832c"/><stop offset="1" stop-color="#6e4c16"/></linearGradient>
  </defs>
  <rect width="160" height="160" fill="url(#cdEdF${k})"/>
  <g opacity=".22" fill="#ffc58a">${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${6 + i * 22}" y="${112 - (i % 3) * 10}" width="16" height="60"/>`).join('')}</g>
  <circle cx="80" cy="76" r="54" fill="none" stroke="#d4a94c" stroke-opacity=".55" stroke-width="2"/>
  <circle cx="80" cy="76" r="47" fill="#0a1216" fill-opacity=".55" stroke="#d4a94c" stroke-opacity=".3" stroke-width="1" stroke-dasharray="2 3"/>
  <g transform="translate(46 42) scale(2.83)" style="filter:drop-shadow(0 .6px 0 #000)">
    <g fill="url(#cdEdO${k})" stroke="#1b1003" stroke-width=".45" paint-order="stroke">${cuerpo.replace(/fill="currentColor"/g, '')}</g>
  </g>
</svg>`;
}

/** Icono grabado por tipo de evidencia. */
export const TIPOS_EVIDENCIA = {
  sms: { icono: 'sms', nombre: 'Mensaje SMS' },
  chat: { icono: 'chat', nombre: 'Conversación de chat' },
  correo: { icono: 'correo', nombre: 'Correo electrónico' },
  url: { icono: 'enlace', nombre: 'Enlace web' },
  extracto: { icono: 'banco', nombre: 'Extracto bancario' },
  registro: { icono: 'terminal', nombre: 'Registro del sistema' },
  perfil: { icono: 'perfil', nombre: 'Perfil en red social' },
  archivo: { icono: 'archivo', nombre: 'Archivo' }
};

export const CUADRANTES = {
  tecnico: { nombre: 'Riesgo técnico', icono: 'engranaje' },
  contacto: { nombre: 'Riesgo de contacto', icono: 'personas' },
  contenido: { nombre: 'Riesgo de contenido', icono: 'imagen' },
  conducta: { nombre: 'Riesgo de conducta', icono: 'brujula' }
};

/** Nombres del catálogo de edificios (sección 3 del contrato). */
export const EDIFICIOS = {
  central: 'Central de Ciberpolicía', laboratorio: 'Laboratorio Forense', banco: 'Banco del Puerto',
  colegio: 'Colegio La Muralla', cibercafe: 'Cibercafé Pixel', 'cafe-malecon': 'Café del Malecón',
  tecnostore: 'TecnoStore', 'torre-telecom': 'Torre de Telecomunicaciones', alcaldia: 'Alcaldía de Puerto Nexo',
  puerto: 'Terminal Portuaria'
};
export const nombreEdificio = id => EDIFICIOS[id] || (/^casa-\d+$/.test(id || '') ? 'Vivienda familiar' : (id || ''));
