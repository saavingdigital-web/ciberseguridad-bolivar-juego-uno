// Plano de Puerto Nexo: retícula de calles, manzanas, costa, murallas y grafos de circulación
// Unidades: 1 = 1 metro. X hacia el este, Z hacia el sur. El mar queda al oeste y al norte.

export const CALLES_X = [-110, -70, -30, 10, 50, 90, 130];   // calles norte-sur (x fija)
export const CALLES_Z = [-110, -70, -30, 10, 50, 90, 130];   // calles este-oeste (z fija)
export const EXT_X = [170, 210, 250];                          // calles de las afueras (solo decorado)
export const EXT_Z = [170, 210, 250];
export const TODAS_X = [...CALLES_X, ...EXT_X];
export const TODAS_Z = [...CALLES_Z, ...EXT_Z];

export const MEDIA_CALLE = 7;      // media vía incluida la acera
export const MEDIA_CALZADA = 4.5;  // media calzada
export const ACERA = 2.5;
export const OFF_ACERA = 5.75;     // eje de la acera respecto al eje de la calle
export const CARRIL = 2.25;        // eje del carril respecto al eje de la calle
export const ALTO_ANDEN = 0.15;

// Costa
export const MALECON_X0 = -127;    // borde exterior del malecón (y comienzo de la playa)
export const MUELLE_Z = -152;      // borde del muelle norte (pared vertical)
export const NIVEL_MAR = -1.0;

export function lineaPlaya(z) {    // x de la orilla del agua en la playa oeste
  return -143.5 + 2.5 * Math.sin(z * 0.05) + 1.2 * Math.sin(z * 0.13 + 1.0);
}

// Altura del terreno (sin edificios)
export function alturaTerreno(x, z) {
  let h = 0;
  // playa oeste
  if (x < MALECON_X0) {
    const orilla = lineaPlaya(z);
    const t = (MALECON_X0 - x) / (MALECON_X0 - orilla); // 0 en el malecón, 1 en la orilla
    if (t <= 1) h = -0.55 - 0.45 * t;
    else h = -1.0 - Math.min(6, (t - 1) * 3.2);
  }
  // muelle norte (corte vertical)
  if (z < MUELLE_Z) {
    const hm = -6.5;
    h = Math.min(h, hm);
  }
  // colinas al sur y al este, más allá de las afueras
  const dx = Math.max(0, x - 262), dz = Math.max(0, z - 262);
  const d = Math.hypot(dx, dz);
  if (d > 0) {
    const ond = 0.5 + 0.5 * Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.017 - 0.4);
    h += Math.min(1, d / 120) * (18 + 26 * ond);
  }
  return h;
}

// ---------- Manzanas de la retícula principal ----------
// Índices i (columna, oeste→este) y j (fila, norte→sur) de 0 a 5
export function rectManzana(i, j, xs = TODAS_X, zs = TODAS_Z) {
  return {
    x0: xs[i] + MEDIA_CALZADA, x1: xs[i + 1] - MEDIA_CALZADA,   // losa de acera completa
    z0: zs[j] + MEDIA_CALZADA, z1: zs[j + 1] - MEDIA_CALZADA,
    ix0: xs[i] + MEDIA_CALLE, ix1: xs[i + 1] - MEDIA_CALLE,     // interior construible
    iz0: zs[j] + MEDIA_CALLE, iz1: zs[j + 1] - MEDIA_CALLE,
    cx: (xs[i] + xs[i + 1]) / 2, cz: (zs[j] + zs[j + 1]) / 2
  };
}

// Tipo de cada manzana [j][i]
export const DISTRITOS = [
  ['getsemani', 'getsemani', 'getsemani', 'bodegas', 'bodegas', 'bodegas'],
  ['colonial', 'banco', 'colonial', 'moderno', 'torre-telecom', 'moderno'],
  ['colonial', 'alcaldia', 'iglesia', 'central', 'tecnostore', 'moderno'],
  ['colonial', 'colonial', 'colonial', 'laboratorio', 'moderno', 'moderno'],
  ['casa-1', 'colegio', 'cibercafe', 'casa-4', 'parque', 'casa-7'],
  ['casa-2', 'residencial', 'casa-3', 'casa-5', 'casa-6', 'casa-8']
];

// ---------- Murallas de la ciudad vieja ----------
// Rectángulo de la muralla (eje del muro). Pasa por dentro de las manzanas exteriores.
export const MURALLA = { x0: -101, x1: 1, z0: -61, z1: 41, grosor: 3.5, alto: 7.5 };
export function dentroMuralla(x, z) {
  return x > MURALLA.x0 && x < MURALLA.x1 && z > MURALLA.z0 && z < MURALLA.z1;
}

// ---------- Límites ----------
export const LIMITES_CAMARA = { minX: -150, maxX: 165, minZ: -172, maxZ: 150 };
export const LIMITES_MINIMAPA = { minX: -175, maxX: 185, minZ: -195, maxZ: 170 };

// ---------- Grafo vial (vehículos): nodos en intersecciones ----------
export function grafoVial() {
  const nodos = [];
  const id = (i, j) => j * CALLES_X.length + i;
  for (let j = 0; j < CALLES_Z.length; j++) for (let i = 0; i < CALLES_X.length; i++) {
    nodos.push({ id: id(i, j), i, j, x: CALLES_X[i], z: CALLES_Z[j], vecinos: [] });
  }
  for (const n of nodos) {
    if (n.i > 0) n.vecinos.push(id(n.i - 1, n.j));
    if (n.i < CALLES_X.length - 1) n.vecinos.push(id(n.i + 1, n.j));
    if (n.j > 0) n.vecinos.push(id(n.i, n.j - 1));
    if (n.j < CALLES_Z.length - 1) n.vecinos.push(id(n.i, n.j + 1));
    n.semaforo = n.vecinos.length === 4;
  }
  return nodos;
}

// ---------- Grafo peatonal: esquinas de acera ----------
// Cada intersección tiene 4 esquinas (sx, sz ∈ {-1, 1}); aristas por las aceras y por los pasos de cebra.
export function grafoPeatonal() {
  const nodos = [];
  const aristas = [];
  const nI = CALLES_X.length, nJ = CALLES_Z.length;
  const id = (i, j, sx, sz) => ((j * nI + i) * 4) + (sx > 0 ? 1 : 0) + (sz > 0 ? 2 : 0);
  for (let j = 0; j < nJ; j++) for (let i = 0; i < nI; i++) for (const sz of [-1, 1]) for (const sx of [-1, 1]) {
    nodos[id(i, j, sx, sz)] = { id: id(i, j, sx, sz), x: CALLES_X[i] + sx * OFF_ACERA, z: CALLES_Z[j] + sz * OFF_ACERA, vecinos: [] };
  }
  const unir = (a, b) => {
    nodos[a].vecinos.push(b); nodos[b].vecinos.push(a);
    aristas.push([a, b]);
  };
  for (let j = 0; j < nJ; j++) for (let i = 0; i < nI; i++) {
    // pasos de cebra dentro de la intersección
    unir(id(i, j, -1, -1), id(i, j, 1, -1));
    unir(id(i, j, -1, 1), id(i, j, 1, 1));
    unir(id(i, j, -1, -1), id(i, j, -1, 1));
    unir(id(i, j, 1, -1), id(i, j, 1, 1));
    // aceras hacia el este
    if (i < nI - 1) { unir(id(i, j, 1, -1), id(i + 1, j, -1, -1)); unir(id(i, j, 1, 1), id(i + 1, j, -1, 1)); }
    // aceras hacia el sur
    if (j < nJ - 1) { unir(id(i, j, -1, 1), id(i, j + 1, -1, -1)); unir(id(i, j, 1, 1), id(i, j + 1, 1, -1)); }
  }
  return { nodos, aristas };
}
