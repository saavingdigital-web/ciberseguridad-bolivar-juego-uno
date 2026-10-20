// Peatones instanciados que caminan por las aceras (grafo peatonal) con piernas y brazos animados en GPU.
import * as THREE from 'three';
import { crearAzar, parchear } from './util.js';
import { grafoPeatonal, ALTO_ANDEN, MALECON_X0, MUELLE_Z, lineaPlaya } from './plano.js';

// parte: 0 fija, 1 pierna izq, 2 pierna der, 3 brazo izq, 4 brazo der
// tinte: 0 color fijo, 1 ropa, 2 pantalón, 3 piel
function geometriaPeaton() {
  const pos = [], nor = [], col = [], parte = [], tinte = [];
  const caja = (cx, y0, cz, sx, sy, sz, p, ti, color = '#222222') => {
    const g = new THREE.BoxGeometry(sx, sy, sz).translate(cx, y0 + sy / 2, cz).toNonIndexed();
    const c = new THREE.Color(color);
    const P = g.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P.count; i++) {
      pos.push(P.getX(i), P.getY(i), P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i));
      col.push(c.r, c.g, c.b); parte.push(p); tinte.push(ti);
    }
  };
  // piernas y zapatos
  caja(-0.1, 0.06, 0, 0.15, 0.84, 0.17, 1, 2); caja(0.1, 0.06, 0, 0.15, 0.84, 0.17, 2, 2);
  caja(-0.1, 0, 0.03, 0.15, 0.08, 0.26, 1, 0, '#1b1b1f'); caja(0.1, 0, 0.03, 0.15, 0.08, 0.26, 2, 0, '#1b1b1f');
  // torso y cadera
  caja(0, 0.86, 0, 0.42, 0.62, 0.24, 0, 1);
  caja(0, 0.8, 0, 0.38, 0.12, 0.22, 0, 2);
  // brazos y manos
  caja(-0.28, 0.9, 0, 0.11, 0.56, 0.13, 3, 1); caja(0.28, 0.9, 0, 0.11, 0.56, 0.13, 4, 1);
  caja(-0.28, 0.8, 0, 0.1, 0.12, 0.11, 3, 3); caja(0.28, 0.8, 0, 0.1, 0.12, 0.11, 4, 3);
  // accesorios (solo en algunas instancias): mochila y gorra con visera
  caja(0, 0.92, -0.2, 0.3, 0.4, 0.14, 0, 4);
  caja(0, 1.74, 0.0, 0.25, 0.07, 0.25, 0, 4);
  caja(0, 1.73, 0.16, 0.22, 0.02, 0.14, 0, 4);
  // cuello, cabeza y pelo
  caja(0, 1.48, 0, 0.1, 0.06, 0.1, 0, 3);
  caja(0, 1.53, 0, 0.22, 0.25, 0.22, 0, 3);
  caja(0, 1.72, -0.02, 0.24, 0.09, 0.25, 0, 0, '#2a1a10');
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('parte', new THREE.Float32BufferAttribute(parte, 1));
  g.setAttribute('tinte', new THREE.Float32BufferAttribute(tinte, 1));
  return g;
}

const POSE = `
  attribute float parte; attribute float tinte;
  attribute vec3 aRopa; attribute vec3 aPant; attribute vec3 aPiel; attribute float aFase; attribute float aMov; attribute float aAcc;
  uniform float uT;
  void pose(out mat3 R, out vec3 piv) {
    float sw = sin(uT * 7.5 + aFase) * aMov;
    float ang = 0.0; piv = vec3(0.0, 0.9, 0.0);
    if (parte > 0.5 && parte < 1.5) ang = sw * 0.55;
    else if (parte > 1.5 && parte < 2.5) ang = -sw * 0.55;
    else if (parte > 2.5 && parte < 3.5) { ang = -sw * 0.45; piv = vec3(0.0, 1.44, 0.0); }
    else if (parte > 3.5) { ang = sw * 0.45; piv = vec3(0.0, 1.44, 0.0); }
    float c = cos(ang), s = sin(ang);
    R = mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
  }`;

export function crearPeatones(escena, { caminantes = 420, quietos = 140 } = {}) {
  const az = crearAzar(555);
  const { nodos } = grafoPeatonal();
  const n = caminantes + quietos;
  const geo = geometriaPeaton();
  const uT = { value: 0 };

  const ropa = ['#e63946', '#ffd60a', '#06d6a0', '#118ab2', '#ef476f', '#f78c1f', '#8338ec', '#ffffff', '#ff5d8f', '#3a86ff', '#ffbe0b', '#2ec4b6', '#d00000', '#7bd150'];
  const pant = ['#2b2d42', '#1d3557', '#3d405b', '#6c584c', '#e0e1dd', '#264653', '#5e548e'];
  const piel = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#a0673e', '#6b4226'];
  const aRopa = new Float32Array(n * 3), aPant = new Float32Array(n * 3), aPiel = new Float32Array(n * 3), aFase = new Float32Array(n), aMov = new Float32Array(n), aAcc = new Float32Array(n);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    c.set(az.elegir(ropa)); aRopa.set([c.r, c.g, c.b], i * 3);
    c.set(az.elegir(pant)); aPant.set([c.r, c.g, c.b], i * 3);
    c.set(az.elegir(piel)); aPiel.set([c.r, c.g, c.b], i * 3);
    aFase[i] = az() * 6.28; aMov[i] = i < caminantes ? 1 : 0; aAcc[i] = az() < 0.55 ? 1 : 0;
  }
  geo.setAttribute('aRopa', new THREE.InstancedBufferAttribute(aRopa, 3));
  geo.setAttribute('aPant', new THREE.InstancedBufferAttribute(aPant, 3));
  geo.setAttribute('aPiel', new THREE.InstancedBufferAttribute(aPiel, 3));
  geo.setAttribute('aFase', new THREE.InstancedBufferAttribute(aFase, 1));
  geo.setAttribute('aMov', new THREE.InstancedBufferAttribute(aMov, 1));
  geo.setAttribute('aAcc', new THREE.InstancedBufferAttribute(aAcc, 1));

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });
  parchear(mat, 'peaton-anim', sh => {
    sh.uniforms.uT = uT;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + POSE)
      .replace('#include <beginnormal_vertex>', 'mat3 Rp; vec3 pivp; pose(Rp, pivp);\nvec3 objectNormal = Rp * vec3(normal);')
      .replace('#include <begin_vertex>', 'vec3 transformed = Rp * (position - pivp) + pivp;\nif (tinte > 3.5 && aAcc < 0.5) transformed = vec3(0.0);')
      .replace('#include <color_vertex>', '#include <color_vertex>\nvColor = tinte < 0.5 ? color : (tinte < 1.5 ? aRopa : (tinte < 2.5 ? aPant : (tinte < 3.5 ? aPiel : aPant * 0.8)));');
  });
  const prof = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  parchear(prof, 'peaton-sombra', sh => {
    sh.uniforms.uT = uT;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + POSE)
      .replace('#include <begin_vertex>', 'mat3 Rp; vec3 pivp; pose(Rp, pivp);\nvec3 transformed = Rp * (position - pivp) + pivp;\nif (tinte > 3.5 && aAcc < 0.5) transformed = vec3(0.0);');
  });

  const im = new THREE.InstancedMesh(geo, mat, n);
  im.customDepthMaterial = prof;
  im.castShadow = true; im.receiveShadow = true;
  im.frustumCulled = false;
  im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  escena.add(im);

  // caminantes
  const ESC = 1.68;
  const ag = [];
  for (let i = 0; i < caminantes; i++) {
    const a = az.entero(0, nodos.length - 1);
    const b = az.elegir(nodos[a].vecinos);
    ag.push({ a, b, u: az(), lat: az.rango(-0.75, 0.75), v: az.rango(1.1, 1.6), x: 0, z: 0, rumbo: 0 });
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(ESC, ESC, ESC), p = new THREE.Vector3();
  // quietos: grupos de 2-3 personas conversando frente a frente (plazas, malecón, playa y parques)
  {
    let i = 0;
    while (i < quietos) {
      let x, z, y = ALTO_ANDEN;
      const r = az();
      if (r < 0.3) { z = az.rango(MUELLE_Z + 10, 200); x = az.rango(lineaPlaya(z) + 3, MALECON_X0 - 2); y = -0.55 - 0.45 * ((MALECON_X0 - x) / (MALECON_X0 - lineaPlaya(z))); }
      else if (r < 0.52) { x = az.rango(MALECON_X0 + 1, -118); z = az.rango(MUELLE_Z + 6, 200); y = 0.35; }
      else if (r < 0.68) { x = az.rango(-62, -38); z = az.rango(-6, 5); }
      else if (r < 0.8) { x = az.rango(60, 80); z = az.rango(62, 78); }
      else if (r < 0.9) { const k = az.elegir([-3, -2, -1, 1, 2, 3]); x = k * 40 + az.rango(-8, 8); z = az.elegir([-70, -30, 10, 50, 90]) + az.elegir([-5.75, 5.75]); }
      else { x = az.rango(MALECON_X0 + 4, -20); z = az.rango(MUELLE_Z + 4, -122); y = 0.14; }
      const miembros = az.entero(2, 3);
      const base = az() * 6.28;
      for (let k = 0; k < miembros && i < quietos; k++, i++) {
        const ang = base + k * (Math.PI * 2 / miembros);
        const px = x + Math.cos(ang) * 0.9, pz = z + Math.sin(ang) * 0.9;
        e.set(0, Math.atan2(x - px, z - pz), 0); q.setFromEuler(e); p.set(px, y, pz);
        m4.compose(p, q, s); im.setMatrixAt(caminantes + i, m4);
      }
    }
  }

  function actualizar(dt, t) {
    uT.value = t;
    for (let i = 0; i < ag.length; i++) {
      const g = ag[i];
      const A = nodos[g.a], B = nodos[g.b];
      const L = Math.hypot(B.x - A.x, B.z - A.z) || 1;
      g.u += g.v * dt / L;
      if (g.u >= 1) {
        const ops = nodos[g.b].vecinos.filter(k => k !== g.a);
        g.a = g.b; g.b = ops.length ? az.elegir(ops) : g.a; g.u = 0;
        continue;
      }
      const dx = (B.x - A.x) / L, dz = (B.z - A.z) / L;
      g.x = A.x + (B.x - A.x) * g.u - dz * g.lat;
      g.z = A.z + (B.z - A.z) * g.u + dx * g.lat;
      g.rumbo = Math.atan2(dx, dz);
      e.set(0, g.rumbo, 0); q.setFromEuler(e); p.set(g.x, ALTO_ANDEN, g.z);
      m4.compose(p, q, s); im.setMatrixAt(i, m4);
    }
    im.instanceMatrix.needsUpdate = true;
  }
  actualizar(0, 0);
  im.instanceMatrix.needsUpdate = true;
  return { malla: im, actualizar, animar: t => { uT.value = t; } };
}
