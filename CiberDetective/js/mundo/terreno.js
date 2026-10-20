// Terreno, playa, mar animado, calles con andenes y demarcación, malecón, muelle y murallas coloniales
import * as THREE from 'three';
import { Malla, parchear, matriz } from './util.js';
import {
  CALLES_X, CALLES_Z, TODAS_X, TODAS_Z, MEDIA_CALLE, MEDIA_CALZADA, ALTO_ANDEN, MALECON_X0, MUELLE_Z,
  NIVEL_MAR, alturaTerreno, lineaPlaya, MURALLA, rectManzana
} from './plano.js';

const X_MAX = TODAS_X[TODAS_X.length - 1] + MEDIA_CALZADA + 3;
const Z_MAX = TODAS_Z[TODAS_Z.length - 1] + MEDIA_CALZADA + 3;

export function crearTerreno(escena, M) {
  const grupo = new THREE.Group();
  grupo.name = 'terreno';
  escena.add(grupo);

  // ---------- Suelo con relieve ----------
  const T = 820, S = 200;
  const g = new THREE.PlaneGeometry(T, T, S, S).rotateX(-Math.PI / 2);
  g.translate(60, 0, 60);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const arena = new THREE.Color('#e8cf9f'), arenaMojada = new THREE.Color('#b59a6e'), pasto = new THREE.Color('#7d9a4c'),
    tierra = new THREE.Color('#a08a62'), colina = new THREE.Color('#5f7f3b'), fondo = new THREE.Color('#7a6a50');
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const h = alturaTerreno(x, z);
    pos.setY(i, h);
    if (h < -1.15) c.copy(fondo);
    else if (x < MALECON_X0 + 0.5 && z > MUELLE_Z) {
      const orilla = lineaPlaya(z);
      c.copy(arena).lerp(arenaMojada, THREE.MathUtils.smoothstep(x, orilla + 6, orilla - 1) * 0 + THREE.MathUtils.clamp((orilla + 5 - x) / 6, 0, 1));
    } else if (h > 0.5) c.copy(pasto).lerp(colina, Math.min(1, h / 30));
    else c.copy(tierra).lerp(pasto, 0.5 + 0.5 * Math.sin(x * 0.07) * Math.cos(z * 0.05));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // UV en metros para el detalle
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 10, pos.getZ(i) / 10);
  g.computeVertexNormals();
  const suelo = new THREE.Mesh(g, M.terreno);
  suelo.receiveShadow = true;
  grupo.add(suelo);

  // ---------- Calzada (asfalto) y adoquines de la ciudad vieja ----------
  const asf = new Malla();
  const x0 = CALLES_X[0] - MEDIA_CALZADA, z0 = CALLES_Z[0] - MEDIA_CALZADA;
  asf.quad([x0, 0.02, Z_MAX], [X_MAX, 0.02, Z_MAX], [X_MAX, 0.02, z0], [x0, 0.02, z0], [x0 / 8, -Z_MAX / 8, X_MAX / 8, -z0 / 8], '#ffffff');
  asf.malla(M.asfalto, grupo, { sombra: false });

  const ado = new Malla();
  const yA = 0.035;
  for (const x of CALLES_X) if (x > MURALLA.x0 && x < MURALLA.x1) {
    ado.quad([x - MEDIA_CALZADA, yA, MURALLA.z1 + 2], [x + MEDIA_CALZADA, yA, MURALLA.z1 + 2], [x + MEDIA_CALZADA, yA, MURALLA.z0 - 2], [x - MEDIA_CALZADA, yA, MURALLA.z0 - 2], [(x - MEDIA_CALZADA) / 4, -(MURALLA.z1 + 2) / 4, (x + MEDIA_CALZADA) / 4, -(MURALLA.z0 - 2) / 4], '#ffffff');
  }
  for (const z of CALLES_Z) if (z > MURALLA.z0 && z < MURALLA.z1) {
    ado.quad([MURALLA.x0 - 2, yA + 0.003, z + MEDIA_CALZADA], [MURALLA.x1 + 2, yA + 0.003, z + MEDIA_CALZADA], [MURALLA.x1 + 2, yA + 0.003, z - MEDIA_CALZADA], [MURALLA.x0 - 2, yA + 0.003, z - MEDIA_CALZADA], [(MURALLA.x0 - 2) / 4, -(z + MEDIA_CALZADA) / 4, (MURALLA.x1 + 2) / 4, -(z - MEDIA_CALZADA) / 4], '#ffffff');
  }
  ado.malla(M.adoquin, grupo, { sombra: false });

  // ---------- Demarcación vial ----------
  const marcas = new Malla();
  const yM = 0.05;
  const blanco = new THREE.Color('#e9e9e2'), amarillo = new THREE.Color('#f2c230');
  const enViejo = (x, z) => x > MURALLA.x0 - 1 && x < MURALLA.x1 + 1 && z > MURALLA.z0 - 1 && z < MURALLA.z1 + 1;
  const rect = (xa, za, xb, zb, k) => marcas.quad([xa, yM, zb], [xb, yM, zb], [xb, yM, za], [xa, yM, za], [0, 0, 1, 1], k);
  // líneas centrales discontinuas
  for (let a = 0; a < TODAS_X.length; a++) for (let b = 0; b < TODAS_Z.length - 1; b++) {
    const x = TODAS_X[a], za = TODAS_Z[b] + MEDIA_CALLE + 1, zb = TODAS_Z[b + 1] - MEDIA_CALLE - 1;
    if (enViejo(x, (za + zb) / 2)) continue;
    const principal = a < CALLES_X.length;
    for (let z = za; z < zb - 1; z += 4) rect(x - 0.08, z, x + 0.08, Math.min(z + 2.2, zb), principal ? amarillo : blanco);
  }
  for (let b = 0; b < TODAS_Z.length; b++) for (let a = 0; a < TODAS_X.length - 1; a++) {
    const z = TODAS_Z[b], xa = TODAS_X[a] + MEDIA_CALLE + 1, xb = TODAS_X[a + 1] - MEDIA_CALLE - 1;
    if (enViejo((xa + xb) / 2, z)) continue;
    const principal = b < CALLES_Z.length;
    for (let x = xa; x < xb - 1; x += 4) rect(x, z - 0.08, Math.min(x + 2.2, xb), z + 0.08, principal ? amarillo : blanco);
  }
  // cebras y líneas de pare en la retícula principal
  for (const x of CALLES_X) for (const z of CALLES_Z) {
    if (enViejo(x, z)) continue; // sin cebras modernas en la ciudad colonial
    for (const s of [-1, 1]) {
      // cruce sobre la calle norte-sur (franja en z)
      if ((s < 0 && z > CALLES_Z[0]) || (s > 0 && z < CALLES_Z[CALLES_Z.length - 1])) {
        const zc = z + s * (MEDIA_CALZADA + 1.3);
        for (let k = -3; k <= 3; k++) rect(x + k * 1.2 - 0.35, zc - 1.1, x + k * 1.2 + 0.35, zc + 1.1, blanco);
        const zp = z + s * (MEDIA_CALZADA + 2.8);
        if (s < 0) rect(x - MEDIA_CALZADA + 0.2, zp - 0.2, x - 0.2, zp + 0.2, blanco); else rect(x + 0.2, zp - 0.2, x + MEDIA_CALZADA - 0.2, zp + 0.2, blanco);
      }
      if ((s < 0 && x > CALLES_X[0]) || (s > 0 && x < CALLES_X[CALLES_X.length - 1])) {
        const xc = x + s * (MEDIA_CALZADA + 1.3);
        for (let k = -3; k <= 3; k++) rect(xc - 1.1, z + k * 1.2 - 0.35, xc + 1.1, z + k * 1.2 + 0.35, blanco);
        const xp = x + s * (MEDIA_CALZADA + 2.8);
        if (s > 0) rect(xp - 0.2, z - MEDIA_CALZADA + 0.2, xp + 0.2, z - 0.2, blanco); else rect(xp - 0.2, z + 0.2, xp + 0.2, z + MEDIA_CALZADA - 0.2, blanco);
      }
    }
  }
  const mMarcas = marcas.malla(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), grupo, { sombra: false });

  // ---------- Losas de andén de cada manzana ----------
  const anden = new Malla();
  for (let i = 0; i < TODAS_X.length - 1; i++) for (let j = 0; j < TODAS_Z.length - 1; j++) {
    const r = rectManzana(i, j);
    anden.caja((r.x0 + r.x1) / 2, 0, (r.z0 + r.z1) / 2, r.x1 - r.x0, ALTO_ANDEN, r.z1 - r.z0, '#ffffff', { escala: 2 });
  }
  // franjas exteriores: sur y este de la última calle
  // malecón (oeste)
  anden.caja((MALECON_X0 + CALLES_X[0] - MEDIA_CALZADA) / 2, 0, (MUELLE_Z + Z_MAX) / 2, CALLES_X[0] - MEDIA_CALZADA - MALECON_X0, 0.35, Z_MAX - MUELLE_Z, '#f3e6d6', { escala: 2 });
  // acera norte de la avenida portuaria
  anden.caja((MALECON_X0 + X_MAX) / 2, 0, CALLES_Z[0] - MEDIA_CALZADA - 1.25, X_MAX - MALECON_X0, ALTO_ANDEN, 2.5, '#ffffff', { escala: 2 });
  anden.malla(M.anden, grupo, { sombra: false });
  // bordillos claros que recortan cada manzana
  const bord = new Malla();
  const cb = '#d8cfc0', gb = 0.25, hb = ALTO_ANDEN + 0.03;
  for (let i = 0; i < TODAS_X.length - 1; i++) for (let j = 0; j < TODAS_Z.length - 1; j++) {
    const r = rectManzana(i, j);
    const w = r.x1 - r.x0, d = r.z1 - r.z0;
    bord.caja((r.x0 + r.x1) / 2, 0, r.z0 + gb / 2, w, hb, gb, cb, { escala: 2 });
    bord.caja((r.x0 + r.x1) / 2, 0, r.z1 - gb / 2, w, hb, gb, cb, { escala: 2 });
    bord.caja(r.x0 + gb / 2, 0, (r.z0 + r.z1) / 2, gb, hb, d - 2 * gb, cb, { escala: 2 });
    bord.caja(r.x1 - gb / 2, 0, (r.z0 + r.z1) / 2, gb, hb, d - 2 * gb, cb, { escala: 2 });
  }
  bord.malla(M.solido, grupo, { sombra: false });

  // patio portuario y parque norte
  const patio = new Malla();
  const zn0 = MUELLE_Z, zn1 = CALLES_Z[0] - MEDIA_CALZADA - 2.5;
  patio.caja((-12 + X_MAX) / 2, 0, (zn0 + zn1) / 2, X_MAX + 12, 0.12, zn1 - zn0, '#c9c6c0', { escala: 4 });
  patio.malla(M.techo, grupo, { sombra: false });
  const parque = new Malla();
  parque.caja((MALECON_X0 - 12) / 2, 0, (zn0 + zn1) / 2, -12 - MALECON_X0, 0.14, zn1 - zn0, '#ffffff', { escala: 4 });
  parque.malla(M.cesped, grupo, { sombra: false });

  // ---------- Muro del muelle y del malecón ----------
  const piedra = new Malla();
  piedra.caja((MALECON_X0 + X_MAX) / 2, -7, MUELLE_Z - 0.4, X_MAX - MALECON_X0 + 0.8, 7.2, 0.8, '#cfc7b8', { escala: 4 });
  piedra.caja(MALECON_X0 - 0.4, -1.6, (MUELLE_Z + Z_MAX) / 2, 0.8, 2.25, Z_MAX - MUELLE_Z, '#d8cbb3', { escala: 4 });
  // espolón en la esquina noroeste
  piedra.cajaRot(MALECON_X0 - 14, -3, MUELLE_Z - 4, 30, 3.4, 6, 0.35, '#bfb6a5');
  // muralla colonial
  construirMuralla(piedra, M);
  const mPiedra = piedra.malla(M.piedra, grupo);

  // ---------- Mar ----------
  const agua = crearAgua();
  grupo.add(agua.malla);

  return { grupo, agua, marcas: mMarcas, piedra: mPiedra };
}

// ---------- Murallas con puertas, baluartes y garitas ----------
function construirMuralla(m) {
  const { x0, x1, z0, z1, grosor: G, alto: H } = MURALLA;
  const y0 = ALTO_ANDEN;
  const huecosX = CALLES_X.filter(x => x > x0 && x < x1);   // puertas en muros norte y sur
  const huecosZ = CALLES_Z.filter(z => z > z0 && z < z1);   // puertas en muros oeste y este
  const ANCHO_PUERTA = MEDIA_CALLE * 2;

  // Tramos de muro a lo largo de un eje
  const tramos = (a, b, huecos) => {
    const r = []; let ini = a;
    for (const h of huecos) { r.push([ini, h - ANCHO_PUERTA / 2]); ini = h + ANCHO_PUERTA / 2; }
    r.push([ini, b]);
    return r;
  };
  const muroX = (xa, xb, z, haciaFuera) => { // muro paralelo a x
    const L = xb - xa, cx = (xa + xb) / 2;
    m.caja(cx, y0, z, L, H, G, '#ffffff', { escala: 4 });
    m.caja(cx, y0 + H, z + haciaFuera * (G / 2 - 0.4), L, 1.3, 0.8, '#f2ece0', { escala: 4 });
    for (let x = xa + 1.5; x < xb - 1; x += 3.2) m.caja(x, y0 + H + 1.3, z + haciaFuera * (G / 2 - 0.4), 1.8, 0.6, 0.8, '#f2ece0', { escala: 4 });
    m.caja(cx, y0, z + haciaFuera * (G / 2 + 0.3), L, 1.2, 0.6, '#e2d8c4', { escala: 4 }); // talud
    for (let x = xa + 14; x < xb - 6; x += 26) garita(m, x, z + haciaFuera * (G / 2 + 0.2), y0 + H, haciaFuera > 0 ? 0 : Math.PI);
  };
  const muroZ = (za, zb, x, haciaFuera) => {
    const L = zb - za, cz = (za + zb) / 2;
    m.caja(x, y0, cz, G, H, L, '#ffffff', { escala: 4 });
    m.caja(x + haciaFuera * (G / 2 - 0.4), y0 + H, cz, 0.8, 1.3, L, '#f2ece0', { escala: 4 });
    for (let z = za + 1.5; z < zb - 1; z += 3.2) m.caja(x + haciaFuera * (G / 2 - 0.4), y0 + H + 1.3, z, 0.8, 0.6, 1.8, '#f2ece0', { escala: 4 });
    m.caja(x + haciaFuera * (G / 2 + 0.3), y0, cz, 0.6, 1.2, L, '#e2d8c4', { escala: 4 });
    for (let z = za + 14; z < zb - 6; z += 26) garita(m, x + haciaFuera * (G / 2 + 0.2), z, y0 + H, haciaFuera > 0 ? -Math.PI / 2 : Math.PI / 2);
  };
  for (const [a, b] of tramos(x0, x1, huecosX)) { muroX(a, b, z0, -1); muroX(a, b, z1, 1); }
  for (const [a, b] of tramos(z0, z1, huecosZ)) { muroZ(a, b, x0, -1); muroZ(a, b, x1, 1); }

  // Puertas con arcos (calzada al centro y pasos peatonales a los lados)
  const W = ANCHO_PUERTA + 1, HP = H + 3.2;
  const forma = new THREE.Shape();
  forma.moveTo(-W / 2, 0);
  const arcos = [[-(MEDIA_CALZADA + 1.25), 2.0, 3.4], [0, MEDIA_CALZADA * 2 - 0.4, 7.2], [MEDIA_CALZADA + 1.25, 2.0, 3.4]];
  for (const [cx, ancho, alto] of arcos) {
    const r = ancho / 2;
    forma.lineTo(cx - r, 0); forma.lineTo(cx - r, alto - r);
    forma.absarc(cx, alto - r, r, Math.PI, 0, true);
    forma.lineTo(cx + r, 0);
  }
  forma.lineTo(W / 2, 0); forma.lineTo(W / 2, HP); forma.lineTo(-W / 2, HP); forma.lineTo(-W / 2, 0);
  const gPuerta = new THREE.ExtrudeGeometry(forma, { depth: G + 0.8, bevelEnabled: false, curveSegments: 10 });
  gPuerta.translate(0, 0, -(G + 0.8) / 2);
  const puerta = (x, z, rot) => {
    m.geo(gPuerta, matriz(x, y0, z, rot), '#efe7d6', { escalaUV: 0.25 });
    // remate superior con cornisa y escudo
    const mm = matriz(x, y0 + HP, z, rot);
    const cor = new THREE.BoxGeometry(W + 0.8, 0.6, G + 1.4).translate(0, 0.3, 0);
    m.geo(cor, mm, '#f6f0e4', { escalaUV: 0.25 });
    const rem = new THREE.BoxGeometry(5, 2.2, G).translate(0, 1.7, 0);
    m.geo(rem, mm, '#efe7d6', { escalaUV: 0.25 });
  };
  for (const x of huecosX) { puerta(x, z0, 0); puerta(x, z1, 0); }
  for (const z of huecosZ) { puerta(x0, z, Math.PI / 2); puerta(x1, z, Math.PI / 2); }

  // Baluartes en las esquinas
  for (const [x, z, sx, sz] of [[x0, z0, -1, -1], [x1, z0, 1, -1], [x0, z1, -1, 1], [x1, z1, 1, 1]]) {
    const b = new THREE.CylinderGeometry(5.6, 6.0, H + 0.4, 4, 1).rotateY(Math.PI / 4);
    b.translate(0, (H + 0.4) / 2, 0);
    m.geo(b, matriz(x, y0, z, 0), '#ffffff', { escalaUV: 0.25 });
    const p = new THREE.CylinderGeometry(5.8, 5.8, 1.3, 4, 1, true).rotateY(Math.PI / 4).translate(0, H + 1.05, 0);
    m.geo(p, matriz(x, y0, z, 0), '#f2ece0', { escalaUV: 0.25 });
    garita(m, x + sx * 3.4, z + sz * 3.4, y0 + H, Math.atan2(sx, sz));
  }
}

// Garita: torrecilla cilíndrica con cúpula
function garita(m, x, z, y, rot) {
  const cuerpo = new THREE.CylinderGeometry(0.95, 0.95, 2.6, 12).translate(0, 1.3 + 0.4, 0);
  const base = new THREE.CylinderGeometry(0.95, 0.35, 1.2, 12).translate(0, -0.2, 0);
  const cupula = new THREE.SphereGeometry(1.05, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 3.0, 0);
  const remate = new THREE.ConeGeometry(0.22, 0.7, 8).translate(0, 4.3, 0);
  const mm = matriz(x, y, z, rot);
  m.geo(cuerpo, mm, '#f4eee2', { escalaUV: 0.25 });
  m.geo(base, mm, '#e6dcc8', { escalaUV: 0.25 });
  m.geo(cupula, mm, '#f4eee2', { escalaUV: 0.25 });
  m.geo(remate, mm, '#d9cdb5', { escalaUV: 0.25 });
  // aspillera oscura
  const ventana = new THREE.BoxGeometry(0.25, 0.9, 0.2).translate(0, 2.0, 0.9);
  m.geo(ventana, mm, '#2a241c');
}

// ---------- Mar con oleaje, espuma de orilla y transparencia en la playa ----------
function crearAgua() {
  const g = new THREE.PlaneGeometry(1600, 1600, 150, 150).rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1b6f87, roughness: 0.10, metalness: 0.05, transparent: true, envMapIntensity: 1.5 });
  const uT = { value: 0 };
  parchear(mat, 'mar-caribe', sh => {
    sh.uniforms.uT = uT;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uT;\nvarying vec3 vMundo;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wp0 = modelMatrix * vec4(transformed, 1.0);
        float ola = sin(wp0.x * 0.07 + uT * 1.1) * 0.16 + sin(wp0.z * 0.09 - uT * 1.35) * 0.12 + sin((wp0.x + wp0.z) * 0.045 + uT * 0.7) * 0.18;
        transformed.y += ola;
        vMundo = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uT;
        varying vec3 vMundo;
        float rnd(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(rnd(i), rnd(i + vec2(1.0, 0.0)), f.x), mix(rnd(i + vec2(0.0, 1.0)), rnd(i + vec2(1.0, 1.0)), f.x), f.y); }
        float distCosta(vec2 p){
          float orilla = -143.5 + 2.5 * sin(p.y * 0.05) + 1.2 * sin(p.y * 0.13 + 1.0);
          float dPlaya = orilla - p.x;
          float dMuelle = ${MUELLE_Z.toFixed(1)} - p.y;
          return length(vec2(max(dPlaya, 0.0), max(dMuelle, 0.0)));
        }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 pp = vMundo.xz;
        float dc = distCosta(pp);
        float prof = smoothstep(0.0, 45.0, dc);
        vec3 bajo = vec3(0.16, 0.62, 0.60);
        vec3 hondo = vec3(0.02, 0.17, 0.27);
        diffuseColor.rgb = mix(bajo, hondo, prof);
        diffuseColor.rgb *= 1.0 + 0.16 * (vn(pp * 0.045 + 3.0) - 0.5) + 0.07 * (vn(pp * 0.17 - uT * 0.02) - 0.5); // parches de color ±8 %
        float playa = step(${MUELLE_Z.toFixed(1)}, pp.y);
        float ruidoE = vn(pp * 0.9 + vec2(uT * 0.15, -uT * 0.1));
        float ruidoF = vn(pp * 0.35);
        float b1 = smoothstep(0.55, 0.95, sin(dc * 1.9 + ruidoF * 4.0 - uT * 1.5));
        float b2 = smoothstep(0.7, 1.0, sin(dc * 3.1 + ruidoE * 3.0 - uT * 2.4));
        float bandas = (b1 * 0.6 + b2 * 0.4) * (0.35 + 1.1 * ruidoE) * (1.0 - smoothstep(0.0, 6.5, dc));
        float espuma = max(bandas, 1.0 - smoothstep(0.0, 1.2 + 0.7 * sin(uT * 1.3 + pp.y * 0.3), dc));
        espuma += (1.0 - smoothstep(0.0, 2.0, dc)) * 0.2 * ruidoE;
        espuma *= mix(0.55, 1.0, playa);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.96, 0.95), clamp(espuma, 0.0, 1.0));
        diffuseColor.a = mix(0.62, 0.96, smoothstep(0.0, 10.0, dc)) + espuma * 0.3;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { // destellos solares
          float gl = step(0.972, vn(vMundo.xz * 2.7 + vec2(uT * 0.6, -uT * 0.4))) * step(0.5, vn(vMundo.xz * 0.2));
          totalEmissiveRadiance += vec3(2.2, 1.9, 1.4) * gl * 0.6;
        }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        {
          vec2 p = vMundo.xz; float t = uT;
          vec2 gr = vec2(cos(p.x * 0.35 + t * 1.3), cos(p.y * 0.31 - t * 1.1)) * 0.09;
          gr += vec2(cos((p.x * 0.8 + p.y * 0.6) * 1.1 + t * 2.1), cos((p.y * 0.9 - p.x * 0.4) * 1.2 - t * 1.7)) * 0.06;
          gr += vec2(cos(p.x * 2.3 - p.y * 1.7 + t * 3.0), cos(p.y * 2.1 + p.x * 1.3 + t * 2.6)) * 0.035;
          gr += vec2(cos(p.x * 5.1 + p.y * 3.3 - t * 4.0), cos(p.y * 4.7 - p.x * 2.9 + t * 3.6)) * 0.02;
          vec3 nW = normalize(vec3(-gr.x, 1.0, -gr.y));
          normal = normalize((viewMatrix * vec4(nW, 0.0)).xyz);
        }`);
  });
  const malla = new THREE.Mesh(g, mat);
  malla.position.y = NIVEL_MAR;
  malla.receiveShadow = true;
  malla.renderOrder = 1;
  return { malla, actualizar: (t) => { uT.value = t; } };
}
