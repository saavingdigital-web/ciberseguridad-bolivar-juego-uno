// Genera Puerto Nexo: distritos decorativos, edificios del catálogo, mobiliario urbano y letreros
import * as THREE from 'three';
import { crearAzar, Malla, matriz } from './util.js';
import { crearContexto, hilera, perimetro, torre, bodega, casa, PALETA_COLONIAL, PALETA_MODERNA } from './construccion.js';
import { crearEdificiosCatalogo, fijarContextoGlobal } from './edificios.js';
import { atlasLetreros } from './texturas.js';
import {
  CALLES_X, CALLES_Z, TODAS_X, TODAS_Z, DISTRITOS, MURALLA, rectManzana, ALTO_ANDEN, OFF_ACERA,
  MEDIA_CALLE, MALECON_X0, MUELLE_Z, dentroMuralla, lineaPlaya, alturaTerreno
} from './plano.js';

const LETREROS = [
  { clave: 'ciberpolicia', texto: 'CIBERPOLICÍA', estilo: 'neon', color: '#3fd8ff', alto: 130 },
  { clave: 'lab', texto: 'LABORATORIO FORENSE', estilo: 'neon', color: '#7fffd4', alto: 110 },
  { clave: 'banco', texto: 'BANCO DEL PUERTO', estilo: 'panel', color: '#f2c94c', fondo: '#1c2b3a', alto: 110, fuente: 'Georgia, serif' },
  { clave: 'alcaldia', texto: 'ALCALDÍA DE PUERTO NEXO', estilo: 'panel', color: '#3b2a14', fondo: '#efe3c4', borde: '#8a6a2a', alto: 90, fuente: 'Georgia, serif' },
  { clave: 'colegio', texto: 'COLEGIO LA MURALLA', estilo: 'panel', color: '#ffffff', fondo: '#2d6fb7', alto: 100 },
  { clave: 'pixel', texto: 'CIBERCAFÉ PIXEL', estilo: 'neon', color: '#ff2bd6', marco: '#2bf3ff', alto: 130 },
  { clave: 'gamer', texto: 'GAMER ZONE 24H', estilo: 'neon', color: '#2bf3ff', alto: 100 },
  { clave: 'cafe', texto: 'CAFÉ DEL MALECÓN', estilo: 'panel', color: '#ffffff', fondo: '#2a9d8f', alto: 100, fuente: 'Georgia, serif' },
  { clave: 'wifi', texto: 'WI-FI GRATIS', estilo: 'neon', color: '#ffd27f', alto: 100 },
  { clave: 'tecnostore', texto: 'TECNOSTORE', estilo: 'neon', color: '#2bf3ff', alto: 140 },
  { clave: 'nexo', texto: 'NEXO TELECOM', estilo: 'neon', color: '#5ff3ff', alto: 110 },
  { clave: 'terminal', texto: 'TERMINAL PORTUARIA', estilo: 'panel', color: '#ffffff', fondo: '#1f4e79', alto: 100 },
  // decorativos
  { clave: 'hotel', texto: 'HOTEL MAR AZUL', estilo: 'neon', color: '#4ea8de', alto: 110 },
  { clave: 'farmacia', texto: '+ DROGUERÍA 24H', estilo: 'neon', color: '#39ff88', alto: 100 },
  { clave: 'arepas', texto: 'AREPAS DE HUEVO', estilo: 'neon', color: '#ffb347', alto: 100 },
  { clave: 'bar', texto: 'BAR LA OLA', estilo: 'neon', color: '#ff4f7b', alto: 100 },
  { clave: 'salsa', texto: 'SALSA BAR', estilo: 'neon', color: '#ff6ad5', alto: 100 },
  { clave: 'chatverde', texto: 'ChatVerde', estilo: 'neon', color: '#39ff88', alto: 120, fuente: 'Trebuchet MS, sans-serif' },
  { clave: 'fotogram', texto: 'FotoGram', estilo: 'neon', color: '#ff7ae0', alto: 120, fuente: 'Trebuchet MS, sans-serif' },
  { clave: 'recargas', texto: 'RECARGAS · MINUTOS', estilo: 'panel', color: '#1a1a1a', fondo: '#ffd23f', alto: 90 },
  { clave: 'panaderia', texto: 'PANADERÍA', estilo: 'panel', color: '#5a3216', fondo: '#f7e3c3', alto: 90 },
  { clave: 'minimercado', texto: 'MINIMERCADO', estilo: 'panel', color: '#ffffff', fondo: '#d1495b', alto: 90 },
  { clave: 'abierto', texto: 'ABIERTO', estilo: 'neon', color: '#ff3b30', alto: 90 },
  { clave: 'nube', texto: 'NUBE.CO', estilo: 'neon', color: '#a5b4ff', alto: 110 },
  { clave: 'puerto', texto: 'PUERTO NEXO', estilo: 'neon', color: '#ffd27f', alto: 130, fuente: 'Georgia, serif' }
];

export function crearCiudad(escena, M, progreso = () => {}) {
  const az = crearAzar(2026);
  const ctx = crearContexto(az);
  for (const k of ['balcon', 'flores', 'ac', 'tanque', 'antena', 'solar', 'toldo', 'arbol', 'palmera', 'farol', 'farolColonial', 'banca', 'semaforo', 'luzRoja', 'sombrilla', 'tumbona', 'contenedor', 'bolardo', 'charco', 'tendedero', 'parabolica', 'calentador', 'papelera', 'hidrante', 'quiosco', 'parada', 'alcantarilla']) ctx.inst[k] = [];
  fijarContextoGlobal(ctx);
  const letreros = [];
  const grupo = new THREE.Group(); grupo.name = 'ciudad';
  escena.add(grupo);

  // ---------- Edificios del catálogo ----------
  const catalogo = crearEdificiosCatalogo(M, az, ctx, letreros);
  for (const e of catalogo) grupo.add(e.grupo);
  progreso(0.35, 'Levantando la ciudad vieja…');

  // ---------- Distritos de la retícula principal ----------
  for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
    const tipo = DISTRITOS[j][i];
    const r = rectManzana(i, j);
    if (tipo === 'colonial') manzanaColonial(ctx, r, i, j);
    else if (tipo === 'getsemani') manzanaGetsemani(ctx, r);
    else if (tipo === 'bodegas') manzanaBodegas(ctx, r, az);
    else if (tipo === 'moderno') manzanaModerna(ctx, r, az, letreros);
    else if (tipo === 'residencial') manzanaResidencial(ctx, r, az, letreros);
    else if (tipo === 'parque') manzanaParque(ctx, r, az, M, grupo);
    else if (tipo === 'iglesia') manzanaIglesia(ctx, r, az);
  }
  progreso(0.45, 'Construyendo el distrito moderno…');

  // ---------- Afueras (retícula extendida) ----------
  for (let j = 0; j < TODAS_Z.length - 1; j++) for (let i = 0; i < TODAS_X.length - 1; i++) {
    if (i < 6 && j < 6) continue;
    const r = rectManzana(i, j);
    if (i >= 6 && j <= 3) manzanaModerna(ctx, r, az, letreros, 1.35);
    else manzanaResidencial(ctx, r, az, letreros, true);
  }

  // ---------- Mobiliario urbano ----------
  mobiliario(ctx, az);
  mobiliarioCruces(ctx, az);
  malecon(ctx, az);
  puertoYParque(ctx, az);
  colinas(ctx, az);

  // ---------- Construir mallas fusionadas ----------
  for (const [nombre, malla] of Object.entries(ctx.m)) {
    const mat = M[nombre];
    if (!mat) continue;
    const me = malla.malla(mat, grupo, { sombra: nombre !== 'luces' });
    if (me) me.name = 'ciudad-' + nombre;
  }

  // Contraste de valor: el decorado se desatura un 12 % para que el ojo vaya primero a lo jugable
  for (const me of grupo.children) {
    if (!me.isMesh || !/ciudad-(fachada|solido)/.test(me.name)) continue;
    const col = me.geometry.attributes.color;
    for (let i = 0; i < col.count; i++) {
      const r = col.getX(i), g = col.getY(i), b = col.getZ(i);
      const l = r * 0.2126 + g * 0.7152 + b * 0.0722;
      col.setXYZ(i, r + (l - r) * 0.12, g + (l - g) * 0.12, b + (l - b) * 0.12);
    }
    col.needsUpdate = true;
  }

  // ---------- Letreros ----------
  letreros.push(...ctx.letreros);
  const mLetreros = construirLetreros(letreros);
  grupo.add(mLetreros);

  return { grupo, catalogo, inst: ctx.inst, cajas: ctx.cajas };
}

// ======================= Distritos =======================
function recortarMuralla(r) {
  const g = MURALLA.grosor / 2 + 0.6;
  const q = { x0: r.ix0, x1: r.ix1, z0: r.iz0, z1: r.iz1 };
  const lados = { n: true, s: true, e: true, o: true };
  if (r.ix0 < MURALLA.x0 + g) { q.x0 = MURALLA.x0 + g + 2.5; lados.o = false; }
  if (r.ix1 > MURALLA.x1 - g) { q.x1 = MURALLA.x1 - g - 2.5; lados.e = false; }
  if (r.iz0 < MURALLA.z0 + g) { q.z0 = MURALLA.z0 + g + 2.5; lados.n = false; }
  if (r.iz1 > MURALLA.z1 - g) { q.z1 = MURALLA.z1 - g - 2.5; lados.s = false; }
  return { q, lados };
}

function manzanaColonial(ctx, r) {
  const { q, lados } = recortarMuralla(r);
  perimetro(ctx, q, lados, { fondo: 9, estilo: 'colonial', pisos: [2, 2, 2, 3], loteMin: 5.5, loteMax: 9, tiendas: 0, techo: () => ctx.az.prob(0.72) ? 'teja' : 'plano', probBalcon: 0.9, probFlores: 0.45 });
  // patio interior arbolado y franja verde junto a la muralla
  ctx.inst.arbol.push({ x: (q.x0 + q.x1) / 2 + ctx.az.rango(-1.5, 1.5), y: ALTO_ANDEN, z: (q.z0 + q.z1) / 2, esc: ctx.az.rango(0.9, 1.2), tipo: 1 });
  if (!lados.o || !lados.e || !lados.n || !lados.s) {
    const az = ctx.az;
    for (let k = 0; k < 4; k++) {
      const x = !lados.o ? MURALLA.x0 + 4.2 : !lados.e ? MURALLA.x1 - 4.2 : az.rango(q.x0, q.x1);
      const z = !lados.n ? MURALLA.z0 + 4.2 : !lados.s ? MURALLA.z1 - 4.2 : az.rango(q.z0, q.z1);
      const jitter = az.rango(-10, 10);
      ctx.inst.palmera.push({ x: x + ((!lados.o || !lados.e) ? 0 : jitter), y: ALTO_ANDEN, z: z + ((!lados.n || !lados.s) ? 0 : jitter), esc: az.rango(0.75, 1.0), rot: az() * 6 });
    }
  }
}

function manzanaGetsemani(ctx, r) {
  perimetro(ctx, { x0: r.ix0, x1: r.ix1, z0: r.iz0, z1: r.iz1 }, { n: true, s: true, e: true, o: true },
    { fondo: 9, estilo: 'colonial', pisos: [1, 2, 2], loteMin: 4.5, loteMax: 8, techo: () => ctx.az.prob(0.5) ? 'teja' : 'plano', probBalcon: 0.7, probFlores: 0.7 });
  ctx.inst.arbol.push({ x: r.cx, y: ALTO_ANDEN, z: r.cz, esc: 1.1, tipo: 1 });
}

function manzanaBodegas(ctx, r, az) {
  bodega(ctx, { cx: r.cx - 3, cz: r.iz0 + 7.5, ancho: 20, fondo: 12, alto: az.rango(8, 11), frente: 'n' });
  bodega(ctx, { cx: r.cx + 1, cz: r.iz1 - 6, ancho: 24, fondo: 11, alto: az.rango(7, 10), frente: 's' });
  for (let k = 0; k < 3; k++) ctx.inst.contenedor.push({ x: r.ix1 - 2, y: ALTO_ANDEN, z: r.cz - 4 + k * 2.6, rot: Math.PI / 2, color: az.elegir(['#c0392b', '#2471a3', '#d68910', '#1e8449']), alto: 0 });
}

function manzanaModerna(ctx, r, az, letreros, escalaAlto = 1) {
  const w = r.ix1 - r.ix0;
  const opcion = az();
  if (opcion < 0.4) {
    const alto = az.rango(18, 38) * escalaAlto;
    torre(ctx, { cx: r.cx, cz: r.cz, ancho: az.rango(14, 18), fondo: az.rango(13, 17), alto, estilo: 'vidrio', color: az.elegir(['#cfe8ff', '#d8fff4', '#ffe9d6', '#e6e6ff', '#ffffff']) });
  } else if (opcion < 0.75) {
    torre(ctx, { cx: r.ix0 + w * 0.3, cz: r.cz - 4, ancho: 11, fondo: 11, alto: az.rango(16, 32) * escalaAlto, estilo: 'vidrio', color: az.elegir(['#cfe8ff', '#d8fff4', '#ffffff']), podio: false });
    torre(ctx, { cx: r.ix0 + w * 0.73, cz: r.cz + 5, ancho: 10, fondo: 10, alto: az.rango(12, 24) * escalaAlto, estilo: az.prob(0.5) ? 'oficinas' : 'vidrio', color: '#ffffff', podio: false });
    casaEsquina(ctx, r, az);
  } else {
    const d = 10.5;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      torre(ctx, { cx: r.cx + sx * 6.5, cz: r.cz + sz * 6.5, ancho: d, fondo: d, alto: az.rango(12, 24) * escalaAlto, estilo: 'oficinas', color: az.elegir(['#ffffff', '#f3e9dc', '#e8f1f2']), podio: false, corona: false });
    }
  }
}

function casaEsquina(ctx, r, az) {
  // pequeño local comercial en la esquina suroeste
  casa(ctx, { O: [r.ix0, r.iz1], t: [1, 0], n: [0, 1], ancho: 8, fondo: 8, pisos: 2, estilo: 'moderno', color: az.elegir(PALETA_MODERNA), techo: 'plano', tienda: true });
}

function manzanaResidencial(ctx, r, az, letreros, afueras = false) {
  const o = {
    fondo: 9, estilo: az.prob(afueras ? 0.25 : 0.4) ? 'colonial' : 'moderno', paleta: az.prob(0.5) ? PALETA_MODERNA : PALETA_COLONIAL,
    pisos: [1, 2, 2, 3], tiendas: 0.25, loteMin: 6, loteMax: 10, techo: () => az.prob(0.3) ? 'teja' : 'plano', probBalcon: 0.5, probFlores: 0.4
  };
  perimetro(ctx, { x0: r.ix0, x1: r.ix1, z0: r.iz0, z1: r.iz1 }, { n: true, s: true, e: true, o: true }, o);
  ctx.inst.arbol.push({ x: r.cx + az.rango(-2, 2), y: ALTO_ANDEN, z: r.cz + az.rango(-2, 2), esc: az.rango(0.9, 1.3), tipo: az.entero(0, 1) });
}

function manzanaParque(ctx, r, az, M, grupo) {
  const b = ALTO_ANDEN;
  const ces = ctx.malla('cesped', Malla);
  ces.caja(r.cx, b, r.cz, r.ix1 - r.ix0 + 4, 0.05, r.iz1 - r.iz0 + 4, '#ffffff', { escala: 4 });
  const and = ctx.malla('anden', Malla);
  and.caja(r.cx, b + 0.01, r.cz, 2.6, 0.06, r.iz1 - r.iz0 + 4, '#ffffff', { escala: 2 });
  and.caja(r.cx, b + 0.012, r.cz, r.ix1 - r.ix0 + 4, 0.06, 2.6, '#ffffff', { escala: 2 });
  // kiosco central
  const sol = ctx.malla('solido', Malla);
  sol.geo(new THREE.CylinderGeometry(4.2, 4.4, 0.5, 8).translate(r.cx, b + 0.25, r.cz), null, '#efe6d2');
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; sol.caja(r.cx + Math.cos(a) * 3.6, b + 0.5, r.cz + Math.sin(a) * 3.6, 0.25, 3.0, 0.25, '#f7f4ec'); }
  ctx.malla('tejas', Malla).geo(new THREE.ConeGeometry(4.8, 2.0, 8).translate(r.cx, b + 4.5, r.cz), null, '#ffffff', { escalaUV: 3 });
  for (let k = 0; k < 14; k++) {
    const a = az() * Math.PI * 2, d = az.rango(7, 12.5);
    ctx.inst.arbol.push({ x: r.cx + Math.cos(a) * d, y: b, z: r.cz + Math.sin(a) * d, esc: az.rango(0.8, 1.35), tipo: az.entero(0, 1) });
  }
  for (const [dx, dz, ry] of [[-4, 5, 0], [4, 5, 0], [-4, -5, Math.PI], [4, -5, Math.PI], [6, 0, Math.PI / 2], [-6, 0, -Math.PI / 2]]) ctx.inst.banca.push({ x: r.cx + dx, y: b, z: r.cz + dz, rot: ry });
}

function manzanaIglesia(ctx, r, az) {
  const { q, lados } = recortarMuralla(r);
  const b = ALTO_ANDEN;
  const sol = ctx.malla('solido', Malla);
  // nave
  const cx = (q.x0 + q.x1) / 2 - 2.5, z1 = q.z1 - 6, z0 = z1 - 14;
  casa(ctx, { O: [cx - 5.5, z1], t: [1, 0], n: [0, 1], ancho: 11, fondo: 14, pisos: 3, estilo: 'colonial', color: '#f2d7a6', techo: 'teja', probBalcon: 0, probFlores: 0.3, altoPiso: 4, pendiente: 0.22 });
  // fachada con frontón curvo y torre campanario
  sol.caja(cx, b, z1 + 0.4, 12.2, 13.5, 0.8, '#f6e6c4');
  sol.geo(new THREE.CylinderGeometry(3.2, 3.2, 0.8, 24, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).translate(cx, b + 13.5, z1 + 0.4), null, '#f6e6c4');
  sol.caja(cx, b, z1 + 0.85, 3.2, 5.2, 0.12, '#5a3a22');
  const tx = cx + 8;
  sol.caja(tx, b, z1 - 2.5, 5, 22, 5, '#f2d7a6');
  for (const [dx, dz] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) sol.caja(tx + dx, b + 22, z1 - 2.5 + dz, 1, 3.2, 1, '#f2d7a6');
  sol.caja(tx, b + 25.2, z1 - 2.5, 5.4, 0.6, 5.4, '#e8c98f');
  sol.geo(new THREE.ConeGeometry(2.4, 5, 8).translate(tx, b + 28.3, z1 - 2.5), null, '#b5542f');
  sol.geo(new THREE.CylinderGeometry(0.4, 0.9, 1.2, 12).translate(tx, b + 22.8, z1 - 2.5), null, '#8a6a2a');
  // cúpula sobre el crucero
  sol.geo(new THREE.CylinderGeometry(3.6, 3.6, 3, 16).translate(cx, b + 13.5, z0 + 6), null, '#f2d7a6');
  sol.geo(new THREE.SphereGeometry(3.7, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2).translate(cx, b + 15, z0 + 6), null, '#c96b3c');
  sol.geo(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 4).translate(cx, b + 19.8, z0 + 6), null, '#333');
  ctx.cajas.push({ x0: cx - 6, x1: tx + 3, z0, z1: z1 + 1, y1: b + 30, color: '#f2d7a6', tipo: 'iglesia' });
  // atrio y casas alrededor
  ctx.malla('adoquin', Malla).caja(cx + 2, b, (z1 + q.z1) / 2 + 0.5, q.x1 - q.x0, 0.04, q.z1 - z1 + 1, '#ffffff', { escala: 4 });
  ctx.inst.palmera.push({ x: cx - 7, y: b, z: q.z1 - 3, esc: 0.9, rot: 1 }, { x: cx + 12, y: b, z: q.z1 - 3, esc: 0.85, rot: 2 });
  hilera(ctx, [q.x1, q.z0], [q.x0, q.z0], [0, -1], { fondo: Math.max(4, z0 - q.z0 - 0.5) });
  ctx.inst.arbol.push({ x: tx + 1, y: b, z: z0 + 3, esc: 1.0, tipo: 1 }, { x: q.x0 + 2.5, y: b, z: z0 + 6, esc: 0.9, tipo: 0 });
  void lados;
}

// ======================= Mobiliario urbano =======================
function mobiliario(ctx, az) {
  const b = ALTO_ANDEN;
  // farolas en las aceras de la retícula principal (y extendida cerca)
  for (let a = 0; a < TODAS_X.length; a++) for (let k = 0; k < TODAS_Z.length - 1; k++) {
    const x = TODAS_X[a];
    const z0 = TODAS_Z[k] + MEDIA_CALLE + 4, z1 = TODAS_Z[k + 1] - MEDIA_CALLE - 4;
    for (let z = z0; z <= z1; z += 13) for (const s of [-1, 1]) {
      const px = x + s * (MEDIA_CALLE - 0.6);
      if (px < MALECON_X0 + 1) continue;
      const viejo = dentroMuralla(px, z);
      if (viejo) ctx.inst.farolColonial.push({ x: px, y: b, z, rot: s > 0 ? Math.PI / 2 : -Math.PI / 2 });
      else ctx.inst.farol.push({ x: px, y: b, z, rot: s > 0 ? -Math.PI / 2 : Math.PI / 2 });
      if (!viejo && a < CALLES_X.length && k < 6 && az.prob(0.25)) ctx.inst.arbol.push({ x: px, y: b, z: z + 6, esc: az.rango(0.7, 0.95), tipo: 0 });
    }
  }
  for (let k = 0; k < TODAS_Z.length; k++) for (let a = 0; a < TODAS_X.length - 1; a++) {
    const z = TODAS_Z[k];
    const x0 = TODAS_X[a] + MEDIA_CALLE + 4, x1 = TODAS_X[a + 1] - MEDIA_CALLE - 4;
    for (let x = x0 + 6; x <= x1; x += 13) for (const s of [-1, 1]) {
      const pz = z + s * (MEDIA_CALLE - 0.6);
      if (k === 0 && s < 0) continue;
      const viejo = dentroMuralla(x, pz);
      if (viejo) ctx.inst.farolColonial.push({ x, y: b, z: pz, rot: s > 0 ? 0 : Math.PI });
      else ctx.inst.farol.push({ x, y: b, z: pz, rot: s > 0 ? Math.PI : 0 });
    }
  }
  // semáforos en las intersecciones de cuatro vías
  for (let i = 1; i < CALLES_X.length - 1; i++) for (let j = 1; j < CALLES_Z.length - 1; j++) {
    const x = CALLES_X[i], z = CALLES_Z[j];
    const id = j * CALLES_X.length + i;
    ctx.inst.semaforo.push({ x: x + 5.6, y: b, z: z + 5.6, rot: 0, nodo: id, eje: 'ns', sent: 1 });
    ctx.inst.semaforo.push({ x: x - 5.6, y: b, z: z - 5.6, rot: Math.PI, nodo: id, eje: 'ns', sent: -1 });
    ctx.inst.semaforo.push({ x: x - 5.6, y: b, z: z + 5.6, rot: -Math.PI / 2, nodo: id, eje: 'eo', sent: -1 });
    ctx.inst.semaforo.push({ x: x + 5.6, y: b, z: z - 5.6, rot: Math.PI / 2, nodo: id, eje: 'eo', sent: 1 });
  }
}

// Mobiliario en las esquinas de los cruces de la retícula principal: papeleras, hidrantes, quioscos,
// paradas de bus, bolardos, bancas y jardineras. Más árboles de sombra en las aceras.
function mobiliarioCruces(ctx, az) {
  const b = ALTO_ANDEN;
  for (let i = 0; i < CALLES_X.length; i++) for (let j = 0; j < CALLES_Z.length; j++) {
    const x = CALLES_X[i], z = CALLES_Z[j];
    if (x < MALECON_X0 + 8) continue;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      if (z + sz * 6 < MUELLE_Z + 14 && j === 0) continue;
      if (i === 0 && sx < 0) continue; // malecón
      if (j === 0 && sz < 0) continue; // patio portuario
      const viejo = dentroMuralla(x + sx * 6, z + sz * 6);
      // eje A: junto a la acera de la calle norte-sur; eje B: junto a la acera de la calle este-oeste
      for (const eje of ['a', 'b']) {
        const long = az.rango(9, 12);
        const px = eje === 'a' ? x + sx * 5.3 : x + sx * long;
        const pz = eje === 'a' ? z + sz * long : z + sz * 5.3;
        const rot = eje === 'a' ? (sx > 0 ? Math.PI / 2 : -Math.PI / 2) : (sz > 0 ? 0 : Math.PI);
        const r = az();
        if (r < 0.34) ctx.inst.papelera.push({ x: px, y: b, z: pz });
        else if (r < 0.48) ctx.inst.hidrante.push({ x: px, y: b, z: pz });
        else if (r < 0.58 && !viejo) ctx.inst.quiosco.push({ x: px + (eje === 'a' ? sx * 0.4 : 0), y: b, z: pz + (eje === 'b' ? sz * 0.4 : 0), rot, color: az.elegir(['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#48cae4']) });
        else if (r < 0.64 && !viejo) ctx.inst.parada.push({ x: px, y: b, z: pz, rot });
        else if (r < 0.78) ctx.inst.banca.push({ x: px, y: b, z: pz, rot });
        else if (r < 0.9) { ctx.inst.flores.push({ x: px, y: b + 0.4, z: pz, rot: az() * 6, esc: az.rango(0.9, 1.3), tipo: 2 }); }
        else ctx.inst.arbol.push({ x: px, y: b, z: pz, esc: az.rango(0.65, 0.9), tipo: 0 });
      }
      // bolardos en la esquina para proteger el cruce
      ctx.inst.bolardo.push({ x: x + sx * 5.0, y: b, z: z + sz * 5.0 }, { x: x + sx * 5.0, y: b, z: z + sz * 5.8 }, { x: x + sx * 5.8, y: b, z: z + sz * 5.0 });
    }
  }
  // tapas de alcantarilla en los carriles, cada ~30 m
  for (const x of CALLES_X) for (let k = 0; k < CALLES_Z.length - 1; k++) {
    const za = CALLES_Z[k] + 14, zb = CALLES_Z[k + 1] - 14;
    for (let z = za + 3; z < zb; z += 29) if (!dentroMuralla(x, z)) ctx.inst.alcantarilla.push({ x: x + az.elegir([-2.2, 2.2, 0.0]), z });
  }
  for (const z of CALLES_Z) for (let k = 0; k < CALLES_X.length - 1; k++) {
    const xa = CALLES_X[k] + 14, xb = CALLES_X[k + 1] - 14;
    for (let x = xa + 3; x < xb; x += 29) if (!dentroMuralla(x, z)) ctx.inst.alcantarilla.push({ x, z: z + az.elegir([-2.2, 2.2, 0.0]) });
  }
}

function malecon(ctx, az) {
  const yP = 0.35;
  const xP = (MALECON_X0 + CALLES_X[0] - 4.5) / 2;
  for (let z = MUELLE_Z + 8; z < 250; z += 11) {
    if (Math.abs(z + 10) < 10) continue; // café del malecón
    ctx.inst.palmera.push({ x: xP - 2.5 + az.rango(-0.6, 0.6), y: yP, z: z + az.rango(-1, 1), esc: az.rango(0.85, 1.15), rot: az() * 6 });
    if (az.prob(0.6)) ctx.inst.banca.push({ x: MALECON_X0 + 1.4, y: yP, z: z + 5, rot: -Math.PI / 2 });
    ctx.inst.farol.push({ x: CALLES_X[0] - MEDIA_CALLE - 1.2, y: yP, z: z + 5.5, rot: Math.PI / 2 });
  }
  // playa: sombrillas, tumbonas y palmeras sobre la arena
  for (let z = MUELLE_Z + 14; z < 240; z += az.rango(6, 12)) {
    if (Math.abs(z + 10) < 12) continue;
    const orilla = lineaPlaya(z);
    const x = az.rango(orilla + 5, MALECON_X0 - 3);
    const y = -0.55 - 0.45 * ((MALECON_X0 - x) / (MALECON_X0 - orilla));
    ctx.inst.sombrilla.push({ x, y, z, color: az.elegir(['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#48cae4', '#ffffff']) });
    ctx.inst.tumbona.push({ x: x + 1.2, y, z: z + 0.6, rot: Math.PI / 2 + az.rango(-0.3, 0.3) });
    if (az.prob(0.5)) ctx.inst.tumbona.push({ x: x + 1.2, y, z: z - 0.8, rot: Math.PI / 2 + az.rango(-0.3, 0.3) });
    if (az.prob(0.3)) ctx.inst.palmera.push({ x: MALECON_X0 - az.rango(1.5, 4), y: -0.6, z: z + 3, esc: az.rango(0.8, 1.1), rot: az() * 6 });
  }
}

function puertoYParque(ctx, az) {
  const b = 0.12;
  // contenedores apilados en el patio portuario
  const colores = ['#c0392b', '#2471a3', '#d68910', '#1e8449', '#7d3c98', '#5d6d7e', '#ca6f1e', '#117a65'];
  for (let fila = 0; fila < 4; fila++) for (let col = 0; col < 7; col++) {
    const x = 50 + col * 13, z = -131 + fila * 3.6;
    if (az.prob(0.15)) continue;
    const pisos = az.entero(1, 4);
    for (let p = 0; p < pisos; p++) ctx.inst.contenedor.push({ x: x + az.rango(-0.2, 0.2), y: b + p * 2.6, z, rot: 0, color: az.elegir(colores) });
    if (az.prob(0.6)) for (let p = 0; p < az.entero(1, 3); p++) ctx.inst.contenedor.push({ x: x + 6.3, y: b + p * 2.6, z, rot: 0, color: az.elegir(colores) });
  }
  // bolardos del muelle
  for (let x = -100; x < 250; x += 8) ctx.inst.bolardo.push({ x, y: b, z: MUELLE_Z + 0.9 });
  // parque norte con palmeras
  for (let k = 0; k < 26; k++) ctx.inst.palmera.push({ x: az.rango(MALECON_X0 + 3, -16), y: 0.14, z: az.rango(MUELLE_Z + 4, -121), esc: az.rango(0.8, 1.15), rot: az() * 6 });
  for (let k = 0; k < 10; k++) ctx.inst.banca.push({ x: az.rango(MALECON_X0 + 5, -20), y: 0.14, z: az.rango(MUELLE_Z + 6, -124), rot: az() * 6 });
}

function colinas(ctx, az) {
  for (let k = 0; k < 120; k++) {
    const lado = az();
    const x = lado < 0.5 ? az.rango(268, 420) : az.rango(-60, 420);
    const z = lado < 0.5 ? az.rango(-160, 420) : az.rango(268, 420);
    ctx.inst.arbol.push({ x, y: alturaTerreno(x, z) - 0.3, z, esc: az.rango(1.0, 1.7), tipo: az.prob(0.7) ? 1 : 0 });
    if (az.prob(0.25)) ctx.inst.palmera.push({ x: x + 3, y: alturaTerreno(x + 3, z) - 0.2, z, esc: az.rango(0.9, 1.2), rot: az() * 6 });
  }
}

// ======================= Letreros =======================

function construirLetreros(letreros) {
  const { textura, rects } = atlasLetreros(LETREROS);
  const estilos = Object.fromEntries(LETREROS.map(L => [L.clave, L.estilo]));
  const neon = new Malla(), panel = new Malla();
  for (const L of letreros) {
    const R = rects[L.clave]; if (!R) continue;
    const alto = L.alto, ancho = alto * R.aspecto;
    const m = matriz(L.x, L.y, L.z, L.rot ?? 0);
    const g = new THREE.PlaneGeometry(ancho, alto);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, R.uv[0] + uv.getX(i) * (R.uv[2] - R.uv[0]), R.uv[1] + uv.getY(i) * (R.uv[3] - R.uv[1]));
    (estilos[L.clave] === 'panel' ? panel : neon).geo(g, m, '#ffffff');
    g.dispose();
  }
  const grupo = new THREE.Group(); grupo.name = 'letreros';
  const mNeon = new THREE.MeshBasicMaterial({ map: textura, color: new THREE.Color(2.6, 2.6, 2.6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4 });
  const mPanel = new THREE.MeshStandardMaterial({ map: textura, emissiveMap: textura, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4 });
  const a = neon.malla(mNeon, grupo, { sombra: false, recibe: false });
  const p = panel.malla(mPanel, grupo, { sombra: false });
  if (a) a.userData.sinAO = true;
  if (p) p.userData.sinAO = true;
  return grupo;
}
void OFF_ACERA;
