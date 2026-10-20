// Tráfico instanciado: autos, taxis, camionetas, buses, chivas y motos que circulan por la retícula,
// respetan semáforos, hacen fila y giran con curvas suaves.
import * as THREE from 'three';
import { Malla, crearAzar, matriz } from './util.js';
import { grafoVial, CARRIL, MEDIA_CALLE, dentroMuralla } from './plano.js';

const PARADA = MEDIA_CALLE + 0.8;  // distancia del centro de la intersección a la línea de pare
const CICLO = 22;

// ---------- Geometrías de vehículos (adelante = +z) ----------
function perfil(puntos) {
  const s = new THREE.Shape();
  s.moveTo(puntos[0][0], puntos[0][1]);
  for (let i = 1; i < puntos.length; i++) s.lineTo(puntos[i][0], puntos[i][1]);
  return s;
}
function extruir(m, puntos, ancho, color) {
  const g = new THREE.ExtrudeGeometry(perfil(puntos), { depth: ancho, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1 });
  g.translate(0, 0, -ancho / 2).rotateY(-Math.PI / 2);
  // rotateY(-90°) lleva x(largo) → z, pero invierte el ancho; ya está centrado
  m.geo(g, null, color);
  g.dispose();
}
function ruedas(m, largo, ancho, r = 0.34) {
  for (const sz of [-1, 1]) for (const sx of [-1, 1]) {
    m.geo(new THREE.CylinderGeometry(r, r, 0.26, 12).rotateZ(Math.PI / 2).translate(sx * (ancho / 2 - 0.08), r, sz * largo * 0.31), null, '#151515');
    m.geo(new THREE.CylinderGeometry(r * 0.55, r * 0.55, 0.27, 8).rotateZ(Math.PI / 2).translate(sx * (ancho / 2 - 0.07), r, sz * largo * 0.31), null, '#9aa0a6');
  }
}
function faros(l, largo, ancho, y, delante = '#fff3d6', detras = '#ff2a1a') {
  const cd = new THREE.Color(delante).multiplyScalar(4), ct = new THREE.Color(detras).multiplyScalar(3);
  for (const sx of [-1, 1]) {
    l.caja(sx * (ancho / 2 - 0.25), y, largo / 2 + 0.02, 0.32, 0.14, 0.06, cd);
    l.caja(sx * (ancho / 2 - 0.22), y, -largo / 2 - 0.02, 0.3, 0.14, 0.06, ct);
  }
}

function tipoAuto(clave) {
  const cuerpo = new Malla(), det = new Malla(), luz = new Malla();
  let largo = 4.4, ancho = 1.8;
  if (clave === 'sedan' || clave === 'taxi') {
    extruir(cuerpo, [[-2.2, 0.32], [2.2, 0.32], [2.25, 0.72], [1.95, 0.92], [0.95, 0.98], [-2.2, 1.0]], 1.72, '#ffffff');
    extruir(det, [[-1.55, 0.95], [0.95, 0.95], [0.35, 1.42], [-1.25, 1.42]], 1.56, '#1c2530');
    cuerpo.caja(0, 1.4, -0.45, 1.5, 0.08, 1.55, '#ffffff');
    if (clave === 'taxi') { det.caja(0, 1.48, -0.4, 0.5, 0.22, 0.9, '#f4f4f0'); }
    faros(luz, largo, ancho, 0.72);
  } else if (clave === 'suv') {
    largo = 4.7; ancho = 1.9;
    extruir(cuerpo, [[-2.35, 0.4], [2.35, 0.4], [2.4, 0.95], [2.0, 1.1], [-2.35, 1.12]], 1.84, '#ffffff');
    extruir(det, [[-2.25, 1.08], [1.7, 1.08], [1.2, 1.72], [-2.2, 1.72]], 1.7, '#1c2530');
    cuerpo.caja(0, 1.7, -0.5, 1.7, 0.09, 3.5, '#ffffff');
    det.caja(0, 1.82, -0.5, 1.4, 0.06, 2.6, '#2a2a2a');
    faros(luz, largo, ancho, 0.9);
  } else if (clave === 'bus') {
    largo = 11; ancho = 2.5;
    cuerpo.caja(0, 0.45, 0, ancho, 2.7, largo, '#ffffff');
    det.caja(0, 1.6, 0, ancho + 0.04, 1.0, largo - 1.2, '#1c2530');
    det.caja(0, 1.2, largo / 2 + 0.01, ancho - 0.3, 1.6, 0.04, '#1c2530');
    det.caja(0, 3.15, -1.5, 1.8, 0.35, 3.5, '#d9dcdf');
    luz.caja(0, 2.85, largo / 2 + 0.03, 1.6, 0.25, 0.04, new THREE.Color('#ffb347').multiplyScalar(3));
    faros(luz, largo, ancho, 0.75);
  } else if (clave === 'chiva') {
    largo = 9; ancho = 2.5;
    const franjas = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#457b9d', '#ffffff'];
    det.caja(0, 0.45, 0, ancho, 0.5, largo, '#e9c46a');
    franjas.forEach((c, k) => det.caja(0, 0.95 + k * 0.22, 0, ancho + 0.02, 0.22, largo, c));
    for (let z = -largo / 2 + 0.6; z <= largo / 2 - 0.5; z += 1.2) { det.caja(ancho / 2, 2.27, z, 0.12, 1.2, 0.12, '#f4f4f0'); det.caja(-ancho / 2, 2.27, z, 0.12, 1.2, 0.12, '#f4f4f0'); }
    cuerpo.caja(0, 3.45, 0, ancho + 0.3, 0.2, largo + 0.2, '#ffffff');
    det.caja(0, 3.65, -1, ancho - 0.2, 0.5, 4, '#7a4a28');
    det.caja(0, 0.45, largo / 2 + 0.4, ancho - 0.2, 1.4, 1.0, '#2a9d8f');
    faros(luz, largo + 0.8, ancho, 0.8);
  } else if (clave === 'camion') {
    largo = 7.4; ancho = 2.3;
    cuerpo.caja(0, 0.65, -1.0, ancho, 2.5, 5.0, '#ffffff');
    cuerpo.caja(0, 0.65, 2.7, 2.2, 1.6, 1.9, '#ffffff');
    det.caja(0, 0.3, 0, 2.0, 0.35, largo, '#222222');
    det.caja(0, 1.55, 3.66, 1.9, 0.75, 0.05, '#1c2530');
    det.caja(0, 3.2, -1.0, ancho + 0.05, 0.12, 5.05, '#d9dcdf');
    det.caja(0, 1.6, -3.52, 1.8, 1.6, 0.05, '#8a8f96');
    faros(luz, largo, ancho, 0.75);
  } else if (clave === 'mototaxi') {
    largo = 2.9; ancho = 1.3;
    for (const sx of [-0.55, 0.55]) det.geo(new THREE.CylinderGeometry(0.3, 0.3, 0.16, 10).rotateZ(Math.PI / 2).translate(sx, 0.3, -0.8), null, '#151515');
    det.geo(new THREE.CylinderGeometry(0.28, 0.28, 0.14, 10).rotateZ(Math.PI / 2).translate(0, 0.28, 1.1), null, '#151515');
    cuerpo.caja(0, 0.45, -0.3, 1.25, 1.0, 1.9, '#ffffff');
    cuerpo.caja(0, 0.55, 1.0, 0.5, 0.8, 0.8, '#ffffff');
    det.caja(0, 1.45, -0.3, 1.3, 0.1, 2.0, '#2b2d42');
    for (const sx of [-0.6, 0.6]) det.caja(sx, 1.0, -0.9, 0.05, 0.5, 0.05, '#2b2d42');
    det.caja(0, 0.55, -0.9, 1.0, 0.12, 0.6, '#2a2a2a');
    det.caja(0, 1.15, 0.85, 0.5, 0.6, 0.04, '#1c2530');
    luz.caja(0, 0.75, 1.42, 0.2, 0.14, 0.05, new THREE.Color('#fff3d6').multiplyScalar(4));
    luz.caja(0, 0.6, -1.27, 0.5, 0.1, 0.05, new THREE.Color('#ff2a1a').multiplyScalar(3));
    return { cuerpo: cuerpo.construir(), det: det.construir(), luz: luz.construir(), largo };
  } else if (clave === 'moto') {
    largo = 2.0; ancho = 0.7;
    for (const z of [-0.65, 0.65]) det.geo(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 10).rotateZ(Math.PI / 2).translate(0, 0.3, z), null, '#151515');
    cuerpo.caja(0, 0.45, 0, 0.32, 0.4, 1.3, '#ffffff');
    cuerpo.caja(0, 0.75, 0.45, 0.3, 0.25, 0.5, '#ffffff');
    det.caja(0, 0.85, -0.15, 0.3, 0.12, 0.7, '#1a1a1a');
    // conductor con casco
    det.caja(0, 0.95, -0.15, 0.42, 0.6, 0.28, '#3a5a8c');
    det.caja(0, 0.6, 0.05, 0.38, 0.35, 0.5, '#2b2b35');
    det.geo(new THREE.SphereGeometry(0.17, 10, 8).translate(0, 1.72, -0.12), null, '#f2c230');
    det.caja(0, 1.32, 0.15, 0.5, 0.1, 0.1, '#1a1a1a');
    luz.caja(0, 0.85, 0.72, 0.16, 0.12, 0.05, new THREE.Color('#fff3d6').multiplyScalar(4));
    luz.caja(0, 0.75, -0.68, 0.14, 0.08, 0.05, new THREE.Color('#ff2a1a').multiplyScalar(3));
    return { cuerpo: cuerpo.construir(), det: det.construir(), luz: luz.construir(), largo };
  }
  if (clave !== 'chiva') ruedas(det, largo, ancho, clave === 'bus' ? 0.5 : 0.34);
  else ruedas(det, largo, ancho, 0.48);
  return { cuerpo: cuerpo.construir(), det: det.construir(), luz: luz.construir(), largo };
}

const TIPOS = {
  sedan: { n: 74, vmax: [9, 12.5], colores: ['#e9ecef', '#adb5bd', '#212529', '#c1121f', '#1d3557', '#457b9d', '#6c757d', '#f1faee', '#8d99ae', '#283618'] },
  taxi: { n: 29, vmax: [10, 13], colores: ['#f6c90e'] },
  suv: { n: 26, vmax: [9, 12], colores: ['#f8f9fa', '#343a40', '#5c677d', '#7f5539', '#0b525b', '#9d0208'] },
  bus: { n: 6, vmax: [7, 8.5], colores: ['#2a9d8f', '#e76f51', '#3a86ff'] },
  chiva: { n: 4, vmax: [6, 7.5], colores: ['#e63946'] },
  moto: { n: 42, vmax: [10, 14], colores: ['#c1121f', '#1d3557', '#2b2d42', '#ff7b00', '#3a86ff', '#e5e5e5'] },
  mototaxi: { n: 14, vmax: [6, 8], colores: ['#f6c90e', '#e63946', '#2a9d8f', '#ff7b00'] },
  camion: { n: 8, vmax: [7, 9], colores: ['#f8f9fa', '#e9ecef', '#2a9d8f', '#e76f51', '#3a86ff', '#ffd166'] }
};

export function crearTrafico(escena, M) {
  const az = crearAzar(4242);
  const nodos = grafoVial();
  const grupo = new THREE.Group(); grupo.name = 'trafico';
  escena.add(grupo);
  const matCuerpo = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.55, envMapIntensity: 1.2 });
  const matDet = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.4 });
  const sinAO = [];

  // Estado del semáforo: 2 verde, 1 amarillo, 0 rojo
  const desfase = nodos.map(() => az() * CICLO);
  let reloj = 0;
  const estado = (nodo, eje) => {
    const n = nodos[nodo];
    if (!n || !n.semaforo) return 2;
    const t = (reloj + desfase[nodo]) % CICLO;
    if (eje === 'ns') return t < 9 ? 2 : t < 11 ? 1 : 0;
    return t >= 11 && t < 20 ? 2 : t >= 20 ? 1 : 0;
  };

  const aristas = new Map(); // "a-b" → vehículos en el tramo recto
  const clave = (a, b) => a * 1000 + b;
  const enArista = (a, b) => aristas.get(clave(a, b)) ?? (aristas.set(clave(a, b), []), aristas.get(clave(a, b)));
  const vehiculos = [];
  const mallas = {};

  for (const [tipo, cfg] of Object.entries(TIPOS)) {
    const g = tipoAuto(tipo);
    const mk = (geo, mat) => { const im = new THREE.InstancedMesh(geo, mat, cfg.n); im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); grupo.add(im); return im; };
    const cuerpo = mk(g.cuerpo, matCuerpo), det = mk(g.det, matDet), luz = mk(g.luz, M.luces);
    luz.castShadow = false; sinAO.push(luz);
    for (let i = 0; i < cfg.n; i++) cuerpo.setColorAt(i, new THREE.Color(az.elegir(cfg.colores)));
    cuerpo.instanceColor.needsUpdate = true;
    mallas[tipo] = { cuerpo, det, luz };
    for (let i = 0; i < cfg.n; i++) vehiculos.push({ tipo, i, largo: g.largo, vmax: az.rango(cfg.vmax[0], cfg.vmax[1]), v: 0, fase: 'recta', pos: new THREE.Vector3(), rumbo: 0 });
  }

  // geometría de un tramo
  function tramo(a, b) {
    const A = nodos[a], B = nodos[b];
    const dx = Math.sign(B.x - A.x), dz = Math.sign(B.z - A.z);
    const rx = -dz, rz = dx; // derecha
    const p0 = new THREE.Vector3(A.x + dx * PARADA + rx * CARRIL, 0, A.z + dz * PARADA + rz * CARRIL);
    const p1 = new THREE.Vector3(B.x - dx * PARADA + rx * CARRIL, 0, B.z - dz * PARADA + rz * CARRIL);
    return { p0, p1, L: p0.distanceTo(p1), dx, dz, eje: dx !== 0 ? 'eo' : 'ns' };
  }
  const cacheTramo = new Map();
  const T = (a, b) => cacheTramo.get(clave(a, b)) ?? (cacheTramo.set(clave(a, b), tramo(a, b)), cacheTramo.get(clave(a, b)));

  function elegirSiguiente(v) {
    const B = nodos[v.b];
    let ops = B.vecinos.filter(n => n !== v.a);
    if (!ops.length) ops = B.vecinos;
    // preferencia por seguir derecho
    const t = T(v.a, v.b);
    const recto = ops.find(n => Math.sign(nodos[n].x - B.x) === t.dx && Math.sign(nodos[n].z - B.z) === t.dz);
    if (recto !== undefined && az() < 0.55) return recto;
    return az.elegir(ops);
  }

  // Colocación inicial sin solapes
  for (const v of vehiculos) {
    for (let intento = 0; intento < 40; intento++) {
      const a = az.entero(0, nodos.length - 1);
      const b = az.elegir(nodos[a].vecinos);
      const t = T(a, b);
      const s = az.rango(0, t.L - 2);
      const lista = enArista(a, b);
      if (lista.some(o => Math.abs(o.s - s) < 9)) continue;
      v.a = a; v.b = b; v.s = s; v.c = undefined;
      lista.push(v);
      break;
    }
    if (v.a === undefined) { v.oculto = true; }
  }

  const _d = new THREE.Vector3();
  function bezier(p0, p1, p2, u, out) {
    const k = 1 - u;
    return out.set(k * k * p0.x + 2 * k * u * p1.x + u * u * p2.x, 0, k * k * p0.z + 2 * k * u * p1.z + u * u * p2.z);
  }

  function actualizar(dt, t) {
    reloj = t;
    for (const v of vehiculos) {
      if (v.oculto) continue;
      if (v.fase === 'recta') {
        const tr = T(v.a, v.b);
        const lista = enArista(v.a, v.b);
        // líder
        let lider = null;
        for (const o of lista) if (o !== v && o.s > v.s && (!lider || o.s < lider.s)) lider = o;
        const vmaxLocal = dentroMuralla(v.pos.x, v.pos.z) ? Math.min(v.vmax, 6.5) : v.vmax;
        let limite = tr.L;
        // semáforo o paso bloqueado
        if (v.c === undefined) v.c = elegirSiguiente(v);
        const sig = enArista(v.b, v.c);
        let minSig = Infinity;
        for (const o of sig) minSig = Math.min(minSig, o.s);
        const libre = minSig > (v.largo + 3) && (nodos[v.b].ocupado ?? 0) < 2;
        const luz = estado(v.b, tr.eje);
        const puede = luz === 2 && libre;
        let vdes = vmaxLocal;
        if (!puede) vdes = Math.min(vdes, Math.sqrt(Math.max(0, 2 * 5 * (limite - v.s - 0.3))));
        if (lider) {
          const gap = lider.s - v.s - (lider.largo + v.largo) / 2 - 2.0;
          vdes = Math.min(vdes, Math.max(0, gap * 1.4));
        }
        const acel = vdes > v.v ? 3.5 : 9;
        v.v += Math.sign(vdes - v.v) * Math.min(Math.abs(vdes - v.v), acel * dt);
        v.s += v.v * dt;
        if (lider) v.s = Math.min(v.s, lider.s - (lider.largo + v.largo) / 2 - 1.5);
        if (v.s >= limite) {
          if (puede) {
            // entrar al giro
            lista.splice(lista.indexOf(v), 1);
            const t2 = T(v.b, v.c);
            const p0 = tr.p1.clone(), p2 = t2.p0.clone();
            let p1;
            if (t2.dx === tr.dx && t2.dz === tr.dz) p1 = p0.clone().lerp(p2, 0.5);
            else {
              // intersección de las dos rectas de carril
              const k = (p2.x - p0.x) * tr.dx + (p2.z - p0.z) * tr.dz;
              p1 = new THREE.Vector3(p0.x + tr.dx * k, 0, p0.z + tr.dz * k);
            }
            v.giro = { p0, p1, p2, u: 0, len: p0.distanceTo(p1) + p1.distanceTo(p2) };
            v.fase = 'giro';
            nodos[v.b].ocupado = (nodos[v.b].ocupado ?? 0) + 1;
          } else { v.s = limite; v.v = 0; }
        }
        if (v.fase === 'recta') {
          v.pos.copy(tr.p0).lerp(tr.p1, Math.min(1, v.s / tr.L));
          v.rumbo = Math.atan2(tr.dx, tr.dz);
        }
      }
      if (v.fase === 'giro') {
        const g = v.giro;
        const recto = Math.abs((g.p2.x - g.p0.x) * (g.p2.z - g.p0.z)) < 0.01;
        v.v = Math.min(v.v + 3 * dt, recto ? v.vmax : 6);
        g.u += v.v * dt / Math.max(1, g.len);
        if (g.u >= 1) {
          nodos[v.b].ocupado = Math.max(0, (nodos[v.b].ocupado ?? 1) - 1);
          v.a = v.b; v.b = v.c; v.c = undefined; v.s = 0; v.fase = 'recta'; v.giro = null;
          enArista(v.a, v.b).push(v);
          const tr = T(v.a, v.b);
          v.pos.copy(tr.p0);
          v.rumbo = Math.atan2(tr.dx, tr.dz);
        } else {
          bezier(g.p0, g.p1, g.p2, g.u, v.pos);
          bezier(g.p0, g.p1, g.p2, Math.min(1, g.u + 0.02), _d);
          _d.sub(v.pos);
          if (_d.lengthSq() > 1e-6) v.rumbo = Math.atan2(_d.x, _d.z);
        }
      }
    }
  }

  function dibujar() {
    for (const v of vehiculos) {
      const m = mallas[v.tipo];
      const mm = v.oculto ? matriz(0, -50, 0, 0, 0.001) : matriz(v.pos.x, 0.02, v.pos.z, v.rumbo);
      m.cuerpo.setMatrixAt(v.i, mm); m.det.setMatrixAt(v.i, mm); m.luz.setMatrixAt(v.i, mm);
    }
    for (const m of Object.values(mallas)) { m.cuerpo.instanceMatrix.needsUpdate = true; m.det.instanceMatrix.needsUpdate = true; m.luz.instanceMatrix.needsUpdate = true; }
  }
  actualizar(0, 0); dibujar();

  return { grupo, sinAO, estado, vehiculos, actualizar(dt, t) { actualizar(dt, t); dibujar(); }, dibujar };
}
