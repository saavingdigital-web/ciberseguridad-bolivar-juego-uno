// Generadores de edificios decorativos: casas coloniales, viviendas modernas, torres y bodegas.
// Todo se acumula en mallas fusionadas (ctx.m.*) y listas de instancias (ctx.inst.*).
import * as THREE from 'three';
import { celdaAtlas } from './texturas.js';
import { ALTO_ANDEN } from './plano.js';
import { Malla } from './util.js';

export const PALETA_COLONIAL = ['#e9b44c', '#e07a5f', '#3fa7a3', '#f2cc8f', '#d1495b', '#8ecae6', '#f4a261', '#c77dff', '#90be6d', '#f7ede2', '#ffb4a2', '#4ea8de', '#f6bd60', '#e76f51'];
export const PALETA_MODERNA = ['#f1e3d3', '#d8e2dc', '#ffe5d9', '#cfe1b9', '#bde0fe', '#fde2e4', '#e2ece9', '#fff1e6', '#dfe7fd', '#f0efeb', '#ffd6a5', '#caffbf'];
const BLANCO_MOLDURA = '#efe6d2';

export function crearContexto(az) {
  return {
    az,
    M: Malla,
    m: {},          // mallas por material (se crean bajo demanda)
    inst: {},       // listas de instancias por tipo
    cajas: [],      // volúmenes para minimapa y oclusión de clics
    letreros: [],   // letreros decorativos sobre fachadas
    clavesTienda: ['farmacia', 'arepas', 'recargas', 'panaderia', 'minimercado', 'abierto', 'bar', 'salsa'],
    clavesPodio: ['hotel', 'chatverde', 'fotogram', 'nube', 'farmacia', 'bar'],
    malla(nombre, Clase) { return this.m[nombre] ?? (this.m[nombre] = new Clase()); },
    agregar(tipo, datos) { (this.inst[tipo] ?? (this.inst[tipo] = [])).push(datos); }
  };
}

// Rellena una azotea con equipos a escala humana: aires acondicionados, tanques, antenas, paneles,
// caja de escalera y pretil con moldura. (x0,x1,z0,z1) es el rectángulo útil; y la cota del techo.
export function rellenarAzotea(ctx, x0, x1, z0, z1, y, { densidad = 1, escalera = true, evitar = null } = {}) {
  const az = ctx.az;
  const sol = ctx.malla('solido', ctx.M);
  const n = Math.max(3, Math.round(az.rango(5, 10) * densidad));
  const ok = (x, z) => !evitar || !evitar(x, z);
  const punto = (m = 1.2) => {
    for (let i = 0; i < 8; i++) { const x = az.rango(x0 + m, x1 - m), z = az.rango(z0 + m, z1 - m); if (ok(x, z)) return [x, z]; }
    return null;
  };
  if (escalera && (x1 - x0) > 6 && (z1 - z0) > 6) {
    const p = punto(2.2);
    if (p) {
      sol.caja(p[0], y, p[1], 2.6, 2.5, 2.4, az.elegir(['#cfc8ba', '#d6cdbb', '#bdb5a5']));
      sol.caja(p[0], y + 2.5, p[1], 2.9, 0.22, 2.7, '#8f887b');
      sol.caja(p[0] - 0.5, y, p[1] + 1.22, 0.9, 1.9, 0.06, '#3a3f45');
    }
  }
  // tuberías con soportes y rejillas de ventilación
  if ((x1 - x0) > 6) {
    const np = az.entero(1, 2);
    for (let k = 0; k < np; k++) {
      const z = az.rango(z0 + 1, z1 - 1), xa = x0 + 1.2, L = (x1 - x0) - 2.4;
      sol.caja(xa + L / 2, y + 0.35, z, L, 0.13, 0.13, '#8f9298');
      for (let s = xa; s <= xa + L; s += 3) sol.caja(s, y, z, 0.12, 0.35, 0.12, '#5f6368');
    }
  }
  for (let i = 0; i < n; i++) {
    const p = punto(); if (!p) continue;
    const r = az();
    if (r > 0.94) {
      sol.caja(p[0], y, p[1], 1.0, 0.55, 0.7, '#6d7279');
      for (let k = 0; k < 4; k++) sol.caja(p[0], y + 0.12 + k * 0.1, p[1] + 0.36, 0.86, 0.04, 0.04, '#3a3f45');
      continue;
    }
    if (r < 0.45) ctx.agregar('ac', { x: p[0], y, z: p[1], rot: az.elegir([0, Math.PI / 2, Math.PI]), esc: az.rango(1.2, 1.6) });
    else if (r < 0.65) ctx.agregar('tanque', { x: p[0], y, z: p[1], esc: az.rango(1.0, 1.5) });
    else if (r < 0.8) ctx.agregar('antena', { x: p[0], y, z: p[1], alto: az.rango(4, 9) });
    else if (r < 0.9) ctx.agregar('solar', { x: p[0], y: y + 0.3, z: p[1], rot: az.elegir([0, Math.PI]), esc: az.rango(1.0, 1.5) });
    else ctx.agregar('parabolica', { x: p[0], y, z: p[1], rot: az() * 6 });
  }
}

// Pretil con moldura (0.9 m de alto + 0.4 m de cornisa) alrededor de un rectángulo
export function pretilConMoldura(ctx, cx, cz, W, D, y, color = '#d4d0c6', sinLado = null) {
  const sol = ctx.malla('solido', ctx.M);
  const g = 0.3, h = 0.9;
  if (sinLado !== 'n') sol.caja(cx, y, cz - D / 2 + g / 2, W, h, g, color);
  if (sinLado !== 's') sol.caja(cx, y, cz + D / 2 - g / 2, W, h, g, color);
  sol.caja(cx - W / 2 + g / 2, y, cz, g, h, D, color);
  sol.caja(cx + W / 2 - g / 2, y, cz, g, h, D, color);
  // franja oscura de 0.25 m junto al pretil (sombra de contacto)
  sol.caja(cx, y + 0.012, cz - D / 2 + g + 0.125, W - 2 * g, 0.02, 0.25, '#5f584f');
  sol.caja(cx, y + 0.012, cz + D / 2 - g - 0.125, W - 2 * g, 0.02, 0.25, '#5f584f');
  sol.caja(cx - W / 2 + g + 0.125, y + 0.012, cz, 0.25, 0.02, D - 2 * g, '#5f584f');
  sol.caja(cx + W / 2 - g - 0.125, y + 0.012, cz, 0.25, 0.02, D - 2 * g, '#5f584f');
  const c2 = '#e8e4da';
  sol.caja(cx, y + h, cz - D / 2 + 0.2, W + 0.2, 0.18, 0.4, c2);
  sol.caja(cx, y + h, cz + D / 2 - 0.2, W + 0.2, 0.18, 0.4, c2);
  sol.caja(cx - W / 2 + 0.2, y + h, cz, 0.4, 0.18, D, c2);
  sol.caja(cx + W / 2 - 0.2, y + h, cz, 0.4, 0.18, D, c2);
}

// Punto local de una fachada → mundo
function marco(O, t, n, base) {
  return (u, y, v) => [O[0] + t[0] * u - n[0] * v, base + y, O[1] + t[1] * u - n[1] * v];
}
const anguloDe = t => Math.atan2(-t[1], t[0]);

// ---------- Casa en hilera ----------
// O: esquina frontal izquierda (vista desde la calle), t: dirección a lo largo de la fachada, n: normal hacia la calle
export function casa(ctx, o) {
  const { M } = ctx; // clases
  const az = ctx.az;
  const fach = ctx.malla('fachada', M);
  const sol = ctx.malla('solido', M);
  const estilo = o.estilo ?? 'colonial';
  const colonial = estilo === 'colonial';
  const hp = o.altoPiso ?? (colonial ? 4.2 : 3.2);
  const pisos = o.pisos ?? 2;
  const w = o.ancho, d = o.fondo;
  const base = o.base ?? ALTO_ANDEN;
  const H = hp * pisos;
  const col = new THREE.Color(o.color);
  const P = marco(o.O, o.t, o.n, base);
  const nb = Math.max(1, Math.round(w / (colonial ? 4.0 : 3.6)));
  const bw = w / nb;
  const filaBaja = colonial ? 1 : 2, filaAlta = colonial ? 0 : 3;
  const puerta = Math.floor(nb / 2);
  const ang = anguloDe(o.t);

  // Fachada frontal
  for (let f = 0; f < pisos; f++) {
    for (let b = 0; b < nb; b++) {
      let v, fila;
      if (f === 0) {
        fila = filaBaja;
        if (colonial) v = b === puerta ? 0 : az.elegir([1, 1, 2, 3, 3]);
        else v = o.tienda && b === puerta ? 2 : az.elegir([0, 1, 1, 3, 3, 2]);
      } else {
        fila = filaAlta;
        v = colonial ? az.elegir([0, 1, 2, 3, 0, 1]) : az.elegir([0, 0, 1, 2, 3]);
      }
      const u0 = b * bw, u1 = (b + 1) * bw, y0 = f * hp, y1 = (f + 1) * hp;
      fach.quad(P(u0, y0, 0), P(u1, y0, 0), P(u1, y1, 0), P(u0, y1, 0), celdaAtlas(v, fila), col);
      // balcones coloniales sobre puertas-balcón
      if (colonial && f >= 1 && (v === 0 || v === 3) && az.prob(o.probBalcon ?? 0.85)) {
        const c = P((u0 + u1) / 2, y0 + 0.05, 0);
        ctx.agregar('balcon', { x: c[0], y: c[1], z: c[2], rot: ang, ancho: Math.min(bw * 0.85, 3.4), color: az.elegir(['#5a3a22', '#4a2e1a', '#2f5d3a', '#24476b', '#6b4a2b', '#e8e2d0']) });
        if (az.prob(0.45)) ctx.agregar('flores', { x: c[0] + o.n[0] * 0.6, y: c[1] + 0.6, z: c[2] + o.n[1] * 0.6, rot: ang + az.rango(-0.4, 0.4), esc: az.rango(0.7, 1.1), tipo: az.prob(0.75) ? 0 : 1 });
      }
      // balcones metálicos en fachadas modernas (cada dos pisos) y carteles de bandera en planta baja
      if (!colonial && f >= 1 && (f % 2 === 1) && az.prob(0.4)) {
        const cb = P((u0 + u1) / 2, y0 + 0.05, 0);
        ctx.agregar('balcon', { x: cb[0], y: cb[1], z: cb[2], rot: ang, ancho: Math.min(bw * 0.8, 3.2), color: az.elegir(['#2b2f35', '#cfd3d6', '#e8e2d0', '#3a5a40']) });
        if (az.prob(0.5)) ctx.agregar('flores', { x: cb[0] + o.n[0] * 0.7, y: cb[1] + 0.55, z: cb[2] + o.n[1] * 0.7, rot: ang, esc: az.rango(0.6, 0.9), tipo: 2 });
      }
      if (!colonial && f === 0 && v !== 2 && ctx.letreros && az.prob(0.18)) {
        const q = P((u0 + u1) / 2, 3.0, -0.8);
        ctx.letreros.push({ clave: az.elegir(ctx.clavesTienda), x: q[0], y: q[1], z: q[2], rot: ang + Math.PI / 2, alto: 0.42 });
      }
      if (!colonial && f === 0 && v === 2 && az.prob(0.7)) {
        const q = P((u0 + u1) / 2, hp * 0.78, -0.7);
        ctx.agregar('toldo', { x: q[0], y: q[1], z: q[2], rot: ang, ancho: bw * 0.92, color: az.elegir(['#d23a3a', '#1f7a8c', '#f2a541', '#2b9348', '#6a4c93', '#e76f51']) });
      }
      // aire acondicionado en ventanas modernas
      if (!colonial && f >= 1 && az.prob(0.3)) {
        const c = P((u0 + u1) / 2 + bw * 0.28, y0 + 0.4, -0.25);
        ctx.agregar('ac', { x: c[0], y: c[1], z: c[2], rot: ang, esc: 0.7 });
      }
    }
  }
  // Laterales y trasera (muro liso)
  const liso = f => celdaAtlas(4, colonial ? (f === 0 ? 1 : 0) : (f === 0 ? 2 : 3));
  for (let f = 0; f < pisos; f++) {
    const y0 = f * hp, y1 = (f + 1) * hp;
    fach.quad(P(0, y0, d), P(0, y0, 0), P(0, y1, 0), P(0, y1, d), liso(f), col);
    fach.quad(P(w, y0, 0), P(w, y0, d), P(w, y1, d), P(w, y1, 0), liso(f), col);
    fach.quad(P(w, y0, d), P(0, y0, d), P(0, y1, d), P(w, y1, d), liso(f), col);
  }
  // Moldura superior (cornisa)
  const cm = P(w / 2, H - 0.45, -0.12);
  sol.cajaRot(cm[0], cm[1], cm[2], w + 0.2, 0.45, 0.42, ang, colonial ? BLANCO_MOLDURA : '#d9d9d4');
  if (colonial) {
    // pilastras en las esquinas
    for (const u of [0.15, w - 0.15]) { const p = P(u, 0, -0.08); sol.cajaRot(p[0], p[1], p[2], 0.35, H - 0.4, 0.3, ang, BLANCO_MOLDURA); }
  }
  ctx.cajas.push(cajaDe([P(0, 0, 0), P(w, 0, 0), P(w, 0, d), P(0, 0, d)], base + H, o.color, o.tipoCaja ?? 'casa'));

  // Techo
  const techo = o.techo ?? (colonial ? 'teja' : 'plano');
  if (techo === 'teja') {
    const tej = ctx.malla('tejas', M);
    const r = d * (o.pendiente ?? 0.26);
    const ov = 0.55;
    const y0 = H - 0.05, yr = H + r;
    const tintes = ['#ffffff', '#f2e0d0', '#e6d2c0', '#fff0e0', '#d8c3b0'];
    const tc = o.tinteTeja ?? az.elegir(tintes);
    const L = Math.hypot(d / 2 + ov, r);
    // vertiente frontal
    tej.quad(P(-0.2, y0 - ov * r / (d / 2), -ov), P(w + 0.2, y0 - ov * r / (d / 2), -ov), P(w + 0.2, yr, d / 2), P(-0.2, yr, d / 2), [0, 0, (w + 0.4) / 2, L / 2], tc);
    // vertiente trasera
    tej.quad(P(w + 0.2, y0 - ov * r / (d / 2), d + ov), P(-0.2, y0 - ov * r / (d / 2), d + ov), P(-0.2, yr, d / 2), P(w + 0.2, yr, d / 2), [0, 0, (w + 0.4) / 2, L / 2], tc);
    // hastiales
    const cl = celdaAtlas(4, 0);
    const cuv = (k) => [cl[0] + (cl[2] - cl[0]) * k, cl[1] + (cl[3] - cl[1]) * 0.5];
    fach.tri(P(0, y0, d), P(0, y0, 0), P(0, yr, d / 2), cuv(0), cuv(1), cuv(0.5), col);
    fach.tri(P(w, y0, 0), P(w, y0, d), P(w, yr, d / 2), cuv(0), cuv(1), cuv(0.5), col);
    // cumbrera
    const cr = P(w / 2, yr - 0.08, d / 2);
    sol.cajaRot(cr[0], cr[1], cr[2], w + 0.4, 0.22, 0.32, ang, '#8a3d22');
    // elementos sobre el tejado: chimeneas y claraboyas, uno cada ~6 m
    {
      const nE = Math.max(1, Math.round(w / 6));
      const slot = w / nE;
      for (let k = 0; k < nE; k++) {
        const u = slot * (k + 0.5) + az.rango(-slot * 0.2, slot * 0.2);
        if (az.prob(0.45)) {
          const v = d * 0.36, yb = (H - 0.05) + v * r / (d / 2) - 0.35;
          const q = P(u, yb, v);
          sol.cajaRot(q[0], q[1], q[2], 0.7, 2.0, 0.7, ang, '#b9a58a');
          sol.cajaRot(q[0], q[1] + 2.0, q[2], 0.95, 0.16, 0.95, ang, '#8a7a66');
          sol.cajaRot(q[0], q[1] + 2.16, q[2], 0.5, 0.05, 0.5, ang, '#2a2622');
        } else {
          const v0 = d * 0.22, v1 = d * 0.34, du = 0.55;
          const sy = v => (H - 0.05) + v * r / (d / 2) + 0.07;
          sol.quad(P(u - du, sy(v0), v0), P(u + du, sy(v0), v0), P(u + du, sy(v1), v1), P(u - du, sy(v1), v1), [0, 0, 1, 1], '#8fb4c8');
          const m2 = (a, b2, v) => P((a + b2) / 2, sy(v) - 0.04, v);
          const lw = m2(u - du, u - du, v0); sol.cajaRot(lw[0], lw[1], lw[2], 0.06, 0.1, 0.06, ang, '#4a3a2c');
        }
      }
      // bajante en una esquina
      const bj = P(az.prob(0.5) ? 0.15 : w - 0.15, 0, -0.14);
      sol.cajaRot(bj[0], bj[1], bj[2], 0.1, H - 0.2, 0.1, ang, '#8a8f96');
    }
  } else {
    const tch = ctx.malla('techo', M);
    const tinte = az.elegir(['#d6d2c8', '#cfc8ba', '#c2baa9', '#b5ab98']);
    const ou = az() * 4, ov = az() * 4;
    tch.quad(P(0, H, 0), P(w, H, 0), P(w, H, d), P(0, H, d), [ou, ov, ou + w / 4, ov + d / 4], tinte); // normal hacia arriba
    // franja de sombra junto al pretil
    const fs = 0.45, ys = H + 0.012, g2 = 0.22, cs = '#6e665b';
    const franja = (u0, v0, u1, v1) => sol.quad(P(u0, ys, v0), P(u1, ys, v0), P(u1, ys, v1), P(u0, ys, v1), [0, 0, 1, 1], cs);
    franja(g2, d - g2 - fs, w - g2, d - g2);
    franja(g2, g2, w - g2, g2 + fs);
    franja(g2, g2 + fs, g2 + fs, d - g2 - fs);
    franja(w - g2 - fs, g2 + fs, w - g2, d - g2 - fs);
    // vida en la azotea caribeña
    if (w > 4.5 && d > 5 && az.prob(0.3)) {
      const p = P(w * az.rango(0.3, 0.7), H, d * az.rango(0.35, 0.65));
      ctx.agregar('tendedero', { x: p[0], y: p[1], z: p[2], rot: ang + (az.prob(0.5) ? 0 : Math.PI / 2), esc: Math.min(1, (w - 1.2) / 3.2) });
    }
    if (az.prob(0.4)) {
      const n = az.entero(1, 3);
      for (let k = 0; k < n; k++) { const p = P(az.rango(0.7, w - 0.7), H, az.rango(0.7, 1.4)); ctx.agregar('flores', { x: p[0], y: p[1] + 0.35, z: p[2], rot: az() * 6, esc: az.rango(0.5, 0.8), tipo: 2 }); }
    }
    if (az.prob(0.25)) { const p = P(az.rango(0.8, w - 0.8), H, d - 0.9); ctx.agregar('parabolica', { x: p[0], y: p[1], z: p[2], rot: ang + az.rango(-0.6, 0.6) }); }
    if (az.prob(0.3) && w > 4) { const p = P(az.rango(1.2, w - 1.2), H, d * 0.75); ctx.agregar('calentador', { x: p[0], y: p[1], z: p[2], rot: Math.PI * 0.75 + az.rango(-0.2, 0.2) }); }
    // pretil
    const alto = 0.9, g = 0.22;
    for (const [u, v, sx, sz] of [[w / 2, g / 2, w, g], [w / 2, d - g / 2, w, g], [g / 2, d / 2, g, d], [w - g / 2, d / 2, g, d]]) {
      const p = P(u, H, v);
      sol.cajaRot(p[0], p[1], p[2], sx, alto, sz, ang, col);
    }
    if (o.tanque !== false && az.prob(0.75)) {
      const p = P(az.rango(1.2, w - 1.2), H, az.rango(1.5, d - 1.5));
      ctx.agregar('tanque', { x: p[0], y: p[1], z: p[2], esc: az.rango(0.8, 1.1) });
    }
    {
      const nAc = az.entero(colonial ? 0 : 1, colonial ? 2 : 4);
      for (let k = 0; k < nAc; k++) {
        const p = P(az.rango(1, w - 1), H, az.rango(1, d - 1));
        ctx.agregar('ac', { x: p[0], y: p[1], z: p[2], rot: ang + az.elegir([0, Math.PI / 2]), esc: az.rango(1.0, 1.4) });
      }
      if (!colonial && az.prob(0.35)) { const p = P(az.rango(1, w - 1), H, az.rango(1, d - 1)); ctx.agregar('antena', { x: p[0], y: p[1], z: p[2], alto: az.rango(3, 7) }); }
      if (w > 7 && d > 7 && az.prob(0.3)) {
        const p = P(az.rango(2, w - 2), H, az.rango(2, d - 2));
        sol.caja(p[0], p[1], p[2], 2.2, 2.4, 2.0, '#cfc8ba'); sol.caja(p[0], p[1] + 2.4, p[2], 2.5, 0.2, 2.3, '#8f887b');
      }
    }
    if (!colonial && az.prob(0.25) && w > 5) {
      const p = P(w / 2, H, d * 0.6);
      ctx.agregar('solar', { x: p[0], y: p[1] + 0.3, z: p[2], rot: ang, esc: Math.min(1.3, w / 5) });
    }
    if (colonial && az.prob(0.4)) {
      // terraza con matas
      const p = P(az.rango(1, w - 1), H, az.rango(1, 3));
      ctx.agregar('flores', { x: p[0], y: p[1] + 0.2, z: p[2], rot: az() * 6, esc: az.rango(0.6, 0.9), tipo: 2 });
    }
  }
  // buganvilias colgando de la cornisa
  if (colonial && az.prob(o.probFlores ?? 0.3)) {
    const u = az.prob(0.5) ? az.rango(0.4, 1.4) : w - az.rango(0.4, 1.4);
    const p = P(u, H - 0.9, -0.35);
    ctx.agregar('flores', { x: p[0], y: p[1], z: p[2], rot: ang, esc: az.rango(0.9, 1.4), tipo: az.prob(0.7) ? 0 : 1 });
  }
  // toldo de tienda en planta baja moderna
  if (o.tienda) {
    const p = P(w / 2, hp * 0.78, -0.75);
    ctx.agregar('toldo', { x: p[0], y: p[1], z: p[2], rot: ang, ancho: Math.min(w * 0.8, 5), color: az.elegir(['#d23a3a', '#1f7a8c', '#f2a541', '#2b9348', '#6a4c93']) });
    if (ctx.letreros && az.prob(0.65)) {
      const q = P(w / 2, hp * 0.93, -0.1);
      ctx.letreros.push({ clave: az.elegir(ctx.clavesTienda), x: q[0], y: q[1], z: q[2], rot: ang, alto: 0.5 });
    }
  }
  return { H, P };
}

function cajaDe(pts, y1, color, tipo) {
  const xs = pts.map(p => p[0]), zs = pts.map(p => p[2]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), y1, color, tipo };
}

// ---------- Hilera de casas a lo largo de un tramo de fachada ----------
// A → B en dirección t; n normal hacia la calle
export function hilera(ctx, A, B, n, o = {}) {
  const az = ctx.az;
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  if (L < 3) return;
  const t = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
  let u = 0;
  const minimo = o.loteMin ?? 5, maximo = o.loteMax ?? 9.5;
  while (u < L - 0.01) {
    let w = az.rango(minimo, maximo);
    if (L - u - w < minimo) w = L - u;
    const O = [A[0] + t[0] * u, A[1] + t[1] * u];
    const pisos = o.pisos ? (Array.isArray(o.pisos) ? az.elegir(o.pisos) : o.pisos) : 2;
    const paleta = o.paleta ?? PALETA_COLONIAL;
    casa(ctx, {
      O, t, n, ancho: w, fondo: o.fondo ?? 9.5, pisos, estilo: o.estilo ?? 'colonial',
      color: az.elegir(paleta), techo: o.techo ? (typeof o.techo === 'function' ? o.techo() : o.techo) : undefined,
      tienda: o.tiendas ? az.prob(o.tiendas) : false, probBalcon: o.probBalcon, probFlores: o.probFlores
    });
    u += w;
  }
}

// Rellena el perímetro de un rectángulo con hileras (las esquinas pertenecen a norte/sur)
// lados: { n, s, e, o } booleanos (si hay calle en ese lado)
export function perimetro(ctx, r, lados, o = {}) {
  const f = o.fondo ?? 9.5;
  const x0 = r.x0, x1 = r.x1, z0 = r.z0, z1 = r.z1;
  const zi0 = lados.n ? z0 + f : z0, zi1 = lados.s ? z1 - f : z1;
  if (lados.s) hilera(ctx, [x0, z1], [x1, z1], [0, 1], o);
  if (lados.n) hilera(ctx, [x1, z0], [x0, z0], [0, -1], o);
  if (lados.e) hilera(ctx, [x1, zi1], [x1, zi0], [1, 0], o);
  if (lados.o) hilera(ctx, [x0, zi0], [x0, zi1], [-1, 0], o);
}

// ---------- Torre moderna ----------
export function torre(ctx, o) {
  const { M } = ctx;
  const az = ctx.az;
  const sol = ctx.malla('solido', M);
  const met = ctx.malla('metal', M);
  const lu = ctx.malla('luces', M);
  const estilo = o.estilo ?? 'vidrio';
  const piel = ctx.malla(estilo, M);
  const base = o.base ?? ALTO_ANDEN;
  const { cx, cz } = o;
  const w = o.ancho, d = o.fondo, H = o.alto;
  const tinte = new THREE.Color(o.color ?? '#ffffff');
  const escU = estilo === 'vidrio' ? 24 : 12, escV = estilo === 'vidrio' ? 28 : 14;
  const offU = az.rango(0, 1), offV = az.rango(0, 1);
  const hPodio = o.podio === false ? 0 : 7.2;

  // Podio comercial
  if (hPodio) {
    const pw = w + 4, pd = d + 4;
    const fach = ctx.malla('fachada', M);
    const colP = new THREE.Color(az.elegir(['#e8e4dc', '#d6d2c8', '#cbd5dc', '#efe9df']));
    const caras = [
      { A: [cx - pw / 2, cz + pd / 2], t: [1, 0], n: [0, 1], L: pw },
      { A: [cx + pw / 2, cz + pd / 2], t: [0, -1], n: [1, 0], L: pd },
      { A: [cx + pw / 2, cz - pd / 2], t: [-1, 0], n: [0, -1], L: pw },
      { A: [cx - pw / 2, cz - pd / 2], t: [0, 1], n: [-1, 0], L: pd }
    ];
    for (const c of caras) {
      const P = marco(c.A, c.t, c.n, base);
      const nb = Math.max(1, Math.round(c.L / 4));
      const bw = c.L / nb;
      for (let b = 0; b < nb; b++) {
        fach.quad(P(b * bw, 0, 0), P((b + 1) * bw, 0, 0), P((b + 1) * bw, 3.6, 0), P(b * bw, 3.6, 0), celdaAtlas(az.elegir([2, 2, 2, 1, 3]), 2), colP);
        fach.quad(P(b * bw, 3.6, 0), P((b + 1) * bw, 3.6, 0), P((b + 1) * bw, 7.2, 0), P(b * bw, 7.2, 0), celdaAtlas(az.elegir([0, 1, 1]), 3), colP);
      }
    }
    const tch = ctx.malla('techo', M);
    tch.quad([cx - pw / 2, base + hPodio, cz + pd / 2], [cx + pw / 2, base + hPodio, cz + pd / 2], [cx + pw / 2, base + hPodio, cz - pd / 2], [cx - pw / 2, base + hPodio, cz - pd / 2], [0, 0, pw / 4, pd / 4], '#ffffff');
    sol.caja(cx, base + hPodio - 0.3, cz, pw + 0.4, 0.5, pd + 0.4, '#9aa1a8', { sinTapa: true });
    // marquesina con franja de luz
    lu.caja(cx, base + 3.75, cz + pd / 2 + 0.05, pw * 0.6, 0.12, 0.08, new THREE.Color(o.luz ?? '#7ff6ff').multiplyScalar(2.2));
    if (ctx.letreros && az.prob(0.7)) ctx.letreros.push({ clave: az.elegir(ctx.clavesPodio), x: cx, y: base + 5.4, z: cz + pd / 2 + 0.08, rot: 0, alto: 1.1 });
    if (ctx.letreros && az.prob(0.4)) ctx.letreros.push({ clave: az.elegir(ctx.clavesPodio), x: cx + pw / 2 + 0.08, y: base + 5.4, z: cz, rot: Math.PI / 2, alto: 1.0 });
  }

  // Cuerpo con posible retranqueo
  const tramos = H > (estilo === 'oficinas' ? 14 : 28) && az.prob(0.65) ? [[hPodio, H * 0.72, w, d], [H * 0.72, H, w * 0.78, d * 0.78]] : [[hPodio, H, w, d]];
  for (const [y0, y1, tw, td] of tramos) {
    const yb = base + y0, yt = base + y1;
    const x0 = cx - tw / 2, x1 = cx + tw / 2, z0 = cz - td / 2, z1 = cz + td / 2;
    const uv = (s0, s1) => [offU + s0 / escU, offV + y0 / escV, offU + s1 / escU, offV + y1 / escV];
    piel.quad([x0, yb, z1], [x1, yb, z1], [x1, yt, z1], [x0, yt, z1], uv(0, tw), tinte);
    piel.quad([x1, yb, z1], [x1, yb, z0], [x1, yt, z0], [x1, yt, z1], uv(tw, tw + td), tinte);
    piel.quad([x1, yb, z0], [x0, yb, z0], [x0, yt, z0], [x1, yt, z0], uv(tw + td, 2 * tw + td), tinte);
    piel.quad([x0, yb, z0], [x0, yb, z1], [x0, yt, z1], [x0, yt, z0], uv(2 * tw + td, 2 * tw + 2 * td), tinte);
    // aristas metálicas
    for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) met.caja(px, yb, pz, 0.45, y1 - y0, 0.45, '#3a4048');
    // cornisa que sobresale 0.25 m
    sol.caja(cx, yt - 0.8, cz, tw + 0.5, 0.8, td + 0.5, '#b9b3a6');
    // techo y pretil
    const tch = ctx.malla('techo', M);
    tch.quad([x0, yt, z1], [x1, yt, z1], [x1, yt, z0], [x0, yt, z0], [0, 0, tw / 4, td / 4], '#a39b8f');
    met.caja(cx, yt, z0 + 0.15, tw, 1.0, 0.3, '#4a5058');
    met.caja(cx, yt, z1 - 0.15, tw, 1.0, 0.3, '#4a5058');
    met.caja(x0 + 0.15, yt, cz, 0.3, 1.0, td, '#4a5058');
    met.caja(x1 - 0.15, yt, cz, 0.3, 1.0, td, '#4a5058');
  }
  const [, , tw, td] = tramos[tramos.length - 1];
  const yTop = base + H;
  // Corona de luz LED
  if (o.corona ?? az.prob(0.55)) {
    const c = new THREE.Color(az.elegir(['#7ff6ff', '#ffffff', '#ff4fd8', '#ffd27f', '#7fffb2'])).multiplyScalar(2.6);
    const e = 0.14;
    lu.caja(cx, yTop + 0.95, cz + td / 2 + 0.02, tw, e, e, c);
    lu.caja(cx, yTop + 0.95, cz - td / 2 - 0.02, tw, e, e, c);
    lu.caja(cx + tw / 2 + 0.02, yTop + 0.95, cz, e, e, td, c);
    lu.caja(cx - tw / 2 - 0.02, yTop + 0.95, cz, e, e, td, c);
  }
  // Sala de máquinas, equipos y antenas
  {
    const mx = cx + az.rango(-tw * 0.15, tw * 0.15), mz = cz + az.rango(-td * 0.15, td * 0.15), mw = tw * 0.4, md = td * 0.35;
    sol.caja(mx, yTop, mz, mw, 3.2, md, '#7d7468');
    sol.caja(mx, yTop + 3.2, mz, mw + 0.3, 0.25, md + 0.3, '#5f584f');
    sol.caja(mx - mw * 0.25, yTop, mz + md / 2 + 0.03, 1.0, 2.1, 0.06, '#3a3f45');
    for (let k = 0; k < 4; k++) sol.caja(mx + mw * 0.18, yTop + 1.2 + k * 0.32, mz + md / 2 + 0.04, mw * 0.35, 0.08, 0.08, '#2e2b27');
    for (let k = 0; k < 3; k++) sol.caja(mx + mw / 2 + 0.04, yTop + 1.0 + k * 0.4, mz, 0.08, 0.1, md * 0.6, '#2e2b27');
  }
  const nAc = Math.floor(az.rango(3, 8));
  for (let i = 0; i < nAc; i++) ctx.agregar('ac', { x: cx + az.rango(-tw * 0.38, tw * 0.38), y: yTop, z: cz + az.rango(-td * 0.38, td * 0.38), rot: az.elegir([0, Math.PI / 2]), esc: az.rango(1.4, 1.9) });
  rellenarAzotea(ctx, cx - tw / 2 + 0.6, cx + tw / 2 - 0.6, cz - td / 2 + 0.6, cz + td / 2 - 0.6, yTop, { densidad: 0.7, escalera: false });
  pretilConMoldura(ctx, cx, cz, tw, td, yTop, '#c9c4b8');
  if (az.prob(0.7)) {
    const nA = az.entero(1, 3);
    for (let i = 0; i < nA; i++) ctx.agregar('antena', { x: cx + az.rango(-tw * 0.35, tw * 0.35), y: yTop, z: cz + az.rango(-td * 0.35, td * 0.35), alto: az.rango(5, 12) });
  }
  if (az.prob(0.35)) ctx.agregar('solar', { x: cx - tw * 0.2, y: yTop + 0.3, z: cz + td * 0.2, rot: 0, esc: Math.min(2.5, tw / 6) });
  if (ctx.letreros && az.prob(estilo === 'oficinas' ? 0.85 : 0.4)) {
    ctx.letreros.push({ clave: az.elegir(['nube', 'chatverde', 'fotogram', 'hotel', 'bar']), x: cx, y: yTop - 2.4, z: cz + td / 2 + 0.3, rot: 0, alto: 1.2 });
    if (az.prob(0.5)) ctx.letreros.push({ clave: az.elegir(['nube', 'chatverde', 'fotogram', 'hotel']), x: cx + tw / 2 + 0.3, y: yTop - 2.4, z: cz, rot: Math.PI / 2, alto: 1.1 });
  }
  const pad = hPodio ? 2 : 0;
  ctx.cajas.push({ x0: cx - w / 2 - pad, x1: cx + w / 2 + pad, z0: cz - d / 2 - pad, z1: cz + d / 2 + pad, y1: yTop, color: o.colorMapa ?? '#6f8fb0', tipo: 'torre' });
  return { yTop };
}

// ---------- Bloque de oficinas de mediana altura ----------
export function bloqueMedio(ctx, o) {
  return torre(ctx, { ...o, estilo: 'oficinas', corona: false });
}

// ---------- Bodega portuaria ----------
export function bodega(ctx, o) {
  const { M } = ctx;
  const az = ctx.az;
  const cor = ctx.malla('corrugado', M);
  const sol = ctx.malla('solido', M);
  const base = o.base ?? ALTO_ANDEN;
  const { cx, cz, ancho: w, fondo: d, alto: H } = o;
  const col = new THREE.Color(o.color ?? az.elegir(['#c9ccd1', '#b8c4cf', '#d9cbb5', '#9fb4a8', '#c2b2a0']));
  const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, y0 = base, y1 = base + H;
  const e = 3;
  cor.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0 / e, y0 / e, x1 / e, y1 / e], col);
  cor.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x0 / e, y0 / e, x1 / e, y1 / e], col);
  cor.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [z0 / e, y0 / e, z1 / e, y1 / e], col);
  cor.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [z0 / e, y0 / e, z1 / e, y1 / e], col);
  // techo a dos aguas (cumbrera a lo largo de x)
  const r = d * 0.12, ov = 0.6;
  const techoCol = new THREE.Color(o.colorTecho ?? az.elegir(['#8c9399', '#a4492f', '#5f7d8c', '#9b9b8f']));
  const L = Math.hypot(d / 2 + ov, r);
  cor.quad([x0 - ov, y1 - 0.1, z1 + ov], [x1 + ov, y1 - 0.1, z1 + ov], [x1 + ov, y1 + r, cz], [x0 - ov, y1 + r, cz], [0, 0, (w + 2 * ov) / e, L / e], techoCol);
  cor.quad([x1 + ov, y1 - 0.1, z0 - ov], [x0 - ov, y1 - 0.1, z0 - ov], [x0 - ov, y1 + r, cz], [x1 + ov, y1 + r, cz], [0, 0, (w + 2 * ov) / e, L / e], techoCol);
  cor.tri([x0, y1, z0], [x0, y1, z1], [x0, y1 + r, cz], [0, 0], [d / e, 0], [d / 2 / e, r / e], col);
  cor.tri([x1, y1, z1], [x1, y1, z0], [x1, y1 + r, cz], [0, 0], [d / e, 0], [d / 2 / e, r / e], col);
  // portones
  const lado = o.frente ?? 's';
  const nP = Math.max(1, Math.floor(w / 9));
  for (let i = 0; i < nP; i++) {
    const px = x0 + (i + 0.5) * w / nP;
    if (lado === 's') sol.caja(px, y0, z1 + 0.06, 4.2, 5, 0.12, '#3c4148');
    else sol.caja(px, y0, z0 - 0.06, 4.2, 5, 0.12, '#3c4148');
  }
  // franja de color corporativa
  sol.caja(cx, y1 - 1.6, z1 + 0.05, w, 0.7, 0.1, o.franja ?? az.elegir(['#1f7a8c', '#d1495b', '#f2a541', '#2b9348']));
  // claraboyas
  ctx.agregar('ac', { x: cx + w * 0.25, y: y1 + r * 0.4, z: cz, rot: 0, esc: 1.4 });
  ctx.cajas.push({ x0, x1, z0, z1, y1: y1 + r, color: '#8d939a', tipo: 'bodega' });
}
