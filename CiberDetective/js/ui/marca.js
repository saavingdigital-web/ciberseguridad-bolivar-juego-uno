// CiberDetective · marca institucional (Gobernación de Bolívar · Secretaría de las TIC).
// Reglas: ver «REGLAS_DE_USO_EN_LOS_JUEGOS.md». Los emblemas NUNCA se tiñen, rotan, deforman ni
// se vuelven translúcidos, y siempre van sobre un panel oscuro opaco con margen de seguridad.
// El marco táctico dorado/cian vive ESTRICTAMENTE FUERA del núcleo opaco (#0a0d14) de reserva.
import { h } from './util.js';

export const MARCA = {
  logo: 'assets/marca/logo_secretaria.png',     // 500×200, versión en negativo (solo sobre fondo oscuro)
  escudo: 'assets/marca/escudo.png',            // 512×512
  logoAlt: 'Gobernación de Bolívar · Secretaría de las TIC',
  escudoAlt: 'Escudo de la Gobernación de Bolívar',
  cinta: 'GOBERNACIÓN DE BOLÍVAR · SECRETARÍA TIC',
  subcinta: 'UNIDAD ESPECIAL DE CIBERDEFENSA CIUDADANA',
  leyenda: 'Una iniciativa de la Gobernación de Bolívar · Secretaría de las TIC',
  apoyo: 'Con el apoyo de la Gobernación de Bolívar · Secretaría de las TIC',
  credito: 'Escudo y marca: Gobernación de Bolívar (Manual de Identidad Visual 2024)',
  tooltip: 'Gobernación de Bolívar · Secretaría de las TIC · Unidad de Ciberdefensa'
};

const NATIVO_LOGO = 500, NATIVO_ESCUDO = 512;

/** Precarga ambas imágenes (evita parpadeo al abrir las pantallas). Ya hay <link rel="preload"> en index.html. */
export function precargarMarca() {
  for (const src of [MARCA.logo, MARCA.escudo]) {
    const im = new Image();
    im.decoding = 'async';
    im.src = src;
    (precargarMarca.guardadas ||= []).push(im);
  }
}

/**
 * Placa institucional con encabezado táctico exterior y núcleo oscuro 100 % opaco (#0a0d14) con margen de seguridad ≥ 14 %.
 * `ancho` en px CSS (180–420, sin superar el tamaño nativo).
 */
export function panelLogo(ancho = 280, clase = '') {
  const w = Math.max(180, Math.min(420, NATIVO_LOGO, ancho));
  return h('div', { class: `cd-marca-panel cd-marca-logo ${clase}`.trim() },
    h('div', { class: 'cd-marca-cinta', 'aria-hidden': 'true' },
      h('span', { class: 'cd-marca-rombo', text: '◆' }),
      h('span', { class: 'cd-marca-cinta-txt', text: MARCA.cinta }),
      h('span', { class: 'cd-marca-rombo', text: '◆' })),
    h('div', { class: 'cd-marca-nucleo' },
      h('img', {
        class: 'cd-marca-img',
        src: MARCA.logo,
        alt: MARCA.logoAlt,
        width: String(w),
        height: String(Math.round(w * 200 / 500)),
        draggable: 'false',
        decoding: 'async'
      })),
    h('div', { class: 'cd-marca-subcinta', 'aria-hidden': 'true' },
      h('span', { text: MARCA.subcinta })));
}

/** Panel oscuro opaco con el escudo solo (≥ 48 px). */
export function panelEscudo(px = 48, clase = '', minimo = 48) {
  const s = Math.max(minimo, Math.min(NATIVO_ESCUDO, px));
  return h('div', { class: `cd-marca-panel cd-marca-escudo ${clase}`.trim() },
    h('div', { class: 'cd-marca-nucleo-escudo' },
      h('img', {
        class: 'cd-marca-img',
        src: MARCA.escudo,
        alt: MARCA.escudoAlt,
        width: String(s),
        height: String(s),
        draggable: 'false',
        decoding: 'async'
      })));
}

/** Bloque «logo + leyenda» (menú, créditos, final). */
export function bloqueMarca({ ancho = 260, clase = '', leyenda = MARCA.leyenda } = {}) {
  return h('div', { class: `cd-marca-bloque ${clase}`.trim() },
    panelLogo(ancho),
    leyenda ? h('p', { class: 'cd-marca-leyenda', text: leyenda }) : null);
}

/** Pie «escudo + texto pequeño» (tarjeta del escudo táctico y pausa). */
export function pieEscudo(texto = MARCA.apoyo, clase = '') {
  return h('div', { class: `cd-marca-pie ${clase}`.trim() },
    panelEscudo(48),
    h('div', { class: 'cd-marca-pie-textos' },
      h('span', { class: 'cd-marca-pie-etq', text: 'GOBERNACIÓN DE BOLÍVAR · SECRETARÍA DE LAS TIC' }),
      h('p', { class: 'cd-marca-leyenda', text: texto })));
}

/** Sello oficial del HUD: escudo de 40 px sobre un cuadrado oscuro opaco de 48 px con bisel táctico exterior. */
export function selloHUD() {
  const s = panelEscudo(40, 'cd-marca-sello', 40);
  s.setAttribute('title', MARCA.tooltip);
  return s;
}
