// Elementos instanciados: balcones, buganvilias, árboles, palmeras, farolas, semáforos, bancas,
// equipos de azotea, contenedores, grúas, barco, botes, faro y gaviotas.
import * as THREE from 'three';
import { Malla, matriz, crearAzar, parchear } from './util.js';
import { texturaRadial, texturaHojas } from './texturas.js';
import { MUELLE_Z, MALECON_X0, NIVEL_MAR } from './plano.js';

const _m = new THREE.Matrix4();
const _c = new THREE.Color();

function geoDe(fn) { const m = new Malla(); fn(m); return m.construir(); }

// Normales esféricas desde el centro de la copa (sombreado suave y "pintado") y degradado:
// envés oscuro, cima clara.
function suavizarCopa(g, mezcla = 0.7, oscuro = 0.55, claro = 1.1) {
  g.computeBoundingBox();
  const bb = g.boundingBox, c = new THREE.Vector3();
  bb.getCenter(c); c.y = bb.min.y + (bb.max.y - bb.min.y) * 0.4;
  const pos = g.attributes.position, nor = g.attributes.normal, col = g.attributes.color;
  const p = new THREE.Vector3(), n = new THREE.Vector3(), r = new THREE.Vector3();
  const h = Math.max(0.001, bb.max.y - bb.min.y);
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i); n.fromBufferAttribute(nor, i);
    r.copy(p).sub(c).normalize();
    n.lerp(r, mezcla).normalize();
    nor.setXYZ(i, n.x, n.y, n.z);
    const k = oscuro + (claro - oscuro) * Math.min(1, Math.max(0, (p.y - bb.min.y) / h));
    col.setXYZ(i, col.getX(i) * k, col.getY(i) * k, col.getZ(i) * k);
  }
  return g;
}

// Tarjetas de hojas alrededor de una copa (silueta irregular con alpha-test)
function tarjetasHojas(centros, radio, n, semilla) {
  const m = new Malla();
  const a = crearAzar(semilla);
  const q = new THREE.Quaternion(), z = new THREE.Vector3(0, 0, 1), d = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const c = a.elegir(centros);
    d.set(a.rango(-1, 1), a.rango(-0.35, 1), a.rango(-1, 1)).normalize();
    const pos = new THREE.Vector3(c[0], c[1], c[2]).addScaledVector(d, radio * a.rango(0.75, 1.05));
    q.setFromUnitVectors(z, d);
    const g = new THREE.PlaneGeometry(radio * 1.15, radio * 1.15);
    g.applyQuaternion(q); g.rotateY(0); g.translate(pos.x, pos.y, pos.z);
    // normales radiales
    const P = g.attributes.position, N = g.attributes.normal, v = new THREE.Vector3();
    for (let k = 0; k < P.count; k++) { v.fromBufferAttribute(P, k).sub(new THREE.Vector3(c[0], c[1] - radio * 0.3, c[2])).normalize(); N.setXYZ(k, v.x, v.y, v.z); }
    m.geo(g, null, a.elegir(['#4f8f3a', '#79a84a', '#3f7a2f']));
  }
  return suavizarCopa(m.construir(), 0.0, 0.6, 1.1);
}

// Balanceo con el viento (copas y frondas) usando la posición de la instancia como fase
function conViento(material, clave, uT, fuerza = 0.06) {
  return parchear(material, clave, sh => {
    sh.uniforms.uT = uT;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uT;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 ip = instanceMatrix[3].xyz;
          float fase = ip.x * 0.37 + ip.z * 0.21;
          float h = max(0.0, position.y - 1.0);
          transformed.x += sin(uT * 1.3 + fase) * h * ${fuerza.toFixed(3)};
          transformed.z += cos(uT * 1.1 + fase * 1.3) * h * ${(fuerza * 0.7).toFixed(3)};
        #endif`);
  });
}

const PEQUENOS = [];   // instanciados de detalle menudo: se ocultan a zoom lejano (LOD simple)
function instanciar(grupo, geo, mat, lista, fnMatriz, { sombra = true, recibe = true, color = null } = {}) {
  if (!lista.length) return null;
  const im = new THREE.InstancedMesh(geo, mat, lista.length);
  lista.forEach((d, i) => {
    im.setMatrixAt(i, fnMatriz(d));
    if (color) im.setColorAt(i, _c.set(color(d, i)));
  });
  im.instanceMatrix.needsUpdate = true;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  im.castShadow = sombra; im.receiveShadow = recibe;
  im.computeBoundingSphere();
  if (!geo.boundingSphere) geo.computeBoundingSphere();
  if (geo.boundingSphere.radius < 1.5 && !mat.map) PEQUENOS.push(im);
  grupo.add(im);
  return im;
}

export function crearProps(escena, M, inst) {
  const grupo = new THREE.Group(); grupo.name = 'props';
  escena.add(grupo);
  const uT = { value: 0 };
  const az = crearAzar(909);
  const animar = [];
  const sinAO = [];

  const matSolido = M.solido;
  const matLuz = M.luces;

  // ---------- Balcones coloniales de madera ----------
  {
    const madera = geoDe(m => {
      m.caja(0, 0, 0.47, 3.0, 0.14, 0.95, '#ffffff');
      for (const x of [-1.3, -0.45, 0.45, 1.3]) m.caja(x, -0.45, 0.25, 0.14, 0.45, 0.5, '#ffffff');
      m.caja(0, 1.0, 0.9, 3.0, 0.08, 0.1, '#ffffff');
      m.caja(0, 0.15, 0.9, 3.0, 0.08, 0.1, '#ffffff');
      for (let x = -1.45; x <= 1.46; x += 0.25) m.caja(x, 0.14, 0.9, 0.05, 0.88, 0.05, '#ffffff');
      for (const z of [0.1, 0.5]) { m.caja(-1.48, 0.14, z, 0.06, 0.88, 0.06, '#ffffff'); m.caja(1.48, 0.14, z, 0.06, 0.88, 0.06, '#ffffff'); }
      m.caja(-1.45, 0.14, 0.9, 0.1, 2.3, 0.1, '#ffffff');
      m.caja(1.45, 0.14, 0.9, 0.1, 2.3, 0.1, '#ffffff');
    });
    const techo = geoDe(m => {
      const g = new THREE.BoxGeometry(3.3, 0.1, 1.25).translate(0, 0, 0.55);
      m.geo(g, matriz(0, 2.5, 0, 0, 1, 0.28), '#b2563a');
    });
    const fn = d => matriz(d.x, d.y, d.z, d.rot, [d.ancho / 3, 1, 1]);
    instanciar(grupo, madera, matSolido, inst.balcon, fn, { color: d => d.color });
    instanciar(grupo, techo, matSolido, inst.balcon, fn);
  }

  // ---------- Buganvilias y matas ----------
  {
    const mata = (colFlor, colgante) => geoDe(m => {
      const a = crearAzar(colgante ? 5 : 9);
      const n = colgante ? 9 : 6;
      for (let i = 0; i < n; i++) {
        const y = colgante ? -i * 0.28 : a.rango(0, 0.6);
        const r = colgante ? 0.55 - i * 0.035 : a.rango(0.3, 0.5);
        const g = new THREE.IcosahedronGeometry(r, 0);
        m.geo(g, matriz(a.rango(-0.5, 0.5), y, a.rango(0, 0.35), a() * 6), i % 3 === 0 ? '#3f7d2b' : colFlor);
      }
      if (!colgante) m.caja(0, -0.35, 0, 0.7, 0.4, 0.5, '#9c5b3b');
    });
    const tipos = [mata('#d6247e', true), mata('#f28c28', true), mata('#4d8f35', false)].map(g => suavizarCopa(g, 0.8, 0.7, 1.1));
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
    tipos.forEach((g, k) => instanciar(grupo, g, mat, inst.flores.filter(d => (d.tipo ?? 0) === k), d => matriz(d.x, d.y, d.z, d.rot ?? 0, d.esc ?? 1)));
  }

  // ---------- Equipos de azotea ----------
  {
    const ac = geoDe(m => { m.caja(0, 0, 0, 0.95, 0.65, 0.45, '#d9dcdf'); m.geo(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12).rotateX(Math.PI / 2).translate(0.15, 0.33, 0.24), null, '#5d6166'); });
    instanciar(grupo, ac, matSolido, inst.ac, d => matriz(d.x, d.y, d.z, d.rot ?? 0, d.esc ?? 1));
    const tanque = geoDe(m => { m.geo(new THREE.CylinderGeometry(0.62, 0.55, 1.2, 14).translate(0, 0.6, 0), null, '#3a3f45'); m.geo(new THREE.CylinderGeometry(0.3, 0.35, 0.15, 12).translate(0, 1.25, 0), null, '#4a5057'); for (const y of [0.25, 0.65, 1.05]) m.geo(new THREE.CylinderGeometry(0.62 - y * 0.06, 0.62 - y * 0.06, 0.07, 10, 1, true).translate(0, y, 0), null, '#9aa3ad'); });
    instanciar(grupo, tanque, matSolido, inst.tanque, d => matriz(d.x, d.y, d.z, 0, d.esc ?? 1));
    const solar = geoDe(m => {
      m.geo(new THREE.BoxGeometry(2.0, 0.06, 1.1), matriz(0, 0.35, 0, 0, 1, -0.35), '#1d3557');
      m.caja(-0.8, 0, -0.2, 0.06, 0.4, 0.06, '#888'); m.caja(0.8, 0, -0.2, 0.06, 0.4, 0.06, '#888');
    });
    const matSolar = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.25, metalness: 0.7 });
    instanciar(grupo, solar, matSolar, inst.solar, d => matriz(d.x, d.y, d.z, d.rot ?? 0, d.esc ?? 1));
    const antena = geoDe(m => {
      m.geo(new THREE.CylinderGeometry(0.05, 0.08, 1, 6).translate(0, 0.5, 0), null, '#b8bec6');
      m.caja(0, 0.6, 0, 0.8, 0.03, 0.03, '#b8bec6'); m.caja(0, 0.75, 0, 0.5, 0.03, 0.03, '#b8bec6');
    });
    instanciar(grupo, antena, M.metal, inst.antena, d => matriz(d.x, d.y, d.z, 0, [1, d.alto, 1]), { sombra: false });
    for (const d of inst.antena) inst.luzRoja.push({ x: d.x, y: d.y + d.alto + 0.1, z: d.z });
    const toldo = geoDe(m => {
      m.geo(new THREE.BoxGeometry(1, 0.06, 1.4).translate(0, 0, 0.7), matriz(0, 0, 0, 0, 1, 0.35), '#ffffff');
      m.geo(new THREE.BoxGeometry(1, 0.35, 0.04).translate(0, -0.15, 1.33), matriz(0, -0.47, 0, 0), '#ffffff');
    });
    instanciar(grupo, toldo, matSolido, inst.toldo, d => matriz(d.x, d.y, d.z, d.rot, [d.ancho, 1, 1]), { color: d => d.color });
  }

  // ---------- Vida en las azoteas: tendederos, parabólicas y calentadores solares ----------
  {
    const tend = geoDe(m => {
      for (const x of [-1.6, 1.6]) m.caja(x, 0, 0, 0.06, 1.65, 0.06, '#8a8f96');
      m.caja(0, 1.58, 0, 3.2, 0.02, 0.02, '#d0d0d0');
      const ropa = ['#e63946', '#f1faee', '#457b9d', '#f4a261', '#2a9d8f', '#ffd166'];
      let x = -1.35;
      ropa.forEach((c, i) => { const w = 0.35 + (i % 3) * 0.12; m.caja(x + w / 2, 1.58 - 0.45 - (i % 2) * 0.15, 0, w, 0.45 + (i % 2) * 0.15, 0.02, c); x += w + 0.08; });
    });
    instanciar(grupo, tend, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }), inst.tendedero ?? [], d => matriz(d.x, d.y, d.z, d.rot ?? 0, [d.esc ?? 1, 1, 1]));
    const para = geoDe(m => {
      m.caja(0, 0, 0, 0.06, 0.7, 0.06, '#9aa0a6');
      m.geo(new THREE.SphereGeometry(0.42, 14, 6, 0, Math.PI * 2, 0, Math.PI / 3.2).rotateX(-Math.PI / 2.3), matriz(0, 0.85, 0.05), '#eef0f2');
      m.caja(0, 0.85, 0.32, 0.04, 0.04, 0.4, '#5d6166');
    });
    instanciar(grupo, para, M.metal, inst.parabolica ?? [], d => matriz(d.x, d.y, d.z, d.rot ?? 0));
    const cal = geoDe(m => {
      m.geo(new THREE.BoxGeometry(1.5, 0.06, 1.0), matriz(0, 0.55, 0, 0, 1, -0.6), '#1d3557');
      m.geo(new THREE.CylinderGeometry(0.24, 0.24, 1.5, 12).rotateZ(Math.PI / 2), matriz(0, 1.0, -0.45), '#e9ecef');
      for (const x of [-0.65, 0.65]) { m.caja(x, 0, -0.45, 0.05, 0.95, 0.05, '#9aa0a6'); m.caja(x, 0, 0.3, 0.05, 0.25, 0.05, '#9aa0a6'); }
    });
    instanciar(grupo, cal, M.metal, inst.calentador ?? [], d => matriz(d.x, d.y, d.z, d.rot ?? 0));
  }

  // ---------- Luces rojas de balizaje (parpadean) ----------
  {
    for (const x of [62, 96, 130]) inst.luzRoja.push({ x, y: 34.2, z: MUELLE_Z + 9 - 4 });
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.3, 0.2) });
    const im = instanciar(grupo, new THREE.SphereGeometry(0.22, 8, 6), mat, inst.luzRoja, d => matriz(d.x, d.y, d.z), { sombra: false, recibe: false });
    if (im) { sinAO.push(im); animar.push(t => { const on = (t % 1.6) < 0.8; mat.color.setRGB(on ? 5 : 0.4, on ? 0.35 : 0.04, on ? 0.25 : 0.03); }); }
  }

  // ---------- Árboles (dos especies) ----------
  {
    const tronco = [geoDe(m => m.geo(new THREE.CylinderGeometry(0.16, 0.24, 3.2, 7).translate(0, 1.6, 0), null, '#6b4f3a')),
      geoDe(m => { m.geo(new THREE.CylinderGeometry(0.28, 0.45, 3.4, 8).translate(0, 1.7, 0), null, '#5b4433'); m.geo(new THREE.CylinderGeometry(0.12, 0.2, 2.2, 6).rotateZ(0.7).translate(0.7, 3.4, 0), null, '#5b4433'); m.geo(new THREE.CylinderGeometry(0.12, 0.2, 2.2, 6).rotateZ(-0.6).translate(-0.6, 3.4, 0.2), null, '#5b4433'); })];
    const paleta = ['#2f6b2a', '#4f8f3a', '#79a84a'];
    const centros0 = [[0, 3.9, 0]], centros1 = [[-1.4, 4.6, -0.6], [1.3, 4.7, 0.4], [0, 5.3, 0.9], [0.2, 4.4, -1.4]];
    const copa = [suavizarCopa(geoDe(m => {
      const a = crearAzar(3);
      for (let i = 0; i < 6; i++) m.geo(new THREE.IcosahedronGeometry(a.rango(1.0, 1.35), 1), matriz(a.rango(-0.7, 0.7), 3.7 + a.rango(-0.2, 0.8), a.rango(-0.7, 0.7)), paleta[i % 3]);
    })), suavizarCopa(geoDe(m => {
      const a = crearAzar(4);
      for (let i = 0; i < 9; i++) { const c = centros1[i % 4]; m.geo(new THREE.IcosahedronGeometry(a.rango(1.3, 1.8), 1), matriz(c[0] + a.rango(-0.8, 0.8), c[1] + a.rango(-0.3, 0.5), c[2] + a.rango(-0.8, 0.8), 0, [1, 0.72, 1]), paleta[i % 3]); }
    }))];
    const hojas = [tarjetasHojas(centros0, 1.5, 14, 21), tarjetasHojas(centros1, 2.0, 22, 22)];
    const matCopa = conViento(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82 }), 'copa-viento', uT, 0.03);
    const texH = texturaHojas();
    const matHojas = conViento(new THREE.MeshStandardMaterial({ map: texH, alphaTest: 0.5, vertexColors: true, roughness: 0.8, side: THREE.DoubleSide }), 'hojas-viento', uT, 0.035);
    const profHojas = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: texH, alphaTest: 0.5 });
    const tintes = ['#ffffff', '#d6e6b0', '#b9cf8f', '#e9f0c8'];
    for (const k of [0, 1]) {
      const lista = inst.arbol.filter(d => (d.tipo ?? 0) === k);
      const fn = d => matriz(d.x, d.y, d.z, (d.x * 13.1 + d.z * 7.7) % 6.28, d.esc ?? 1);
      instanciar(grupo, tronco[k], matSolido, lista, fn);
      instanciar(grupo, copa[k], matCopa, lista, fn, { color: (d, i) => tintes[i % 4] });
      const imH = instanciar(grupo, hojas[k], matHojas, lista, fn, { color: (d, i) => tintes[(i + 1) % 4] });
      if (imH) imH.customDepthMaterial = profHojas;
    }
  }

  // ---------- Palmeras de coco ----------
  {
    const curva = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.2, 4.5, 0), new THREE.Vector3(1.4, 8.6, 0));
    const tronco = geoDe(m => {
      const g = new THREE.TubeGeometry(curva, 10, 0.24, 7, false);
      m.geo(g, null, '#8b7355');
      for (let i = 1; i < 10; i++) { const p = curva.getPoint(i / 10); m.geo(new THREE.TorusGeometry(0.25, 0.05, 4, 8).rotateX(Math.PI / 2), matriz(p.x, p.y, p.z), '#6f5a40'); }
      m.geo(new THREE.SphereGeometry(0.42, 8, 6), matriz(1.4, 8.5, 0), '#5d7a2f');
      for (let i = 0; i < 4; i++) m.geo(new THREE.SphereGeometry(0.17, 6, 4), matriz(1.4 + Math.cos(i * 1.7) * 0.35, 8.25, Math.sin(i * 1.7) * 0.35), '#6b5a2a');
    });
    const fronda = geoDe(m => {
      const n = 10;
      for (let f = 0; f < n; f++) {
        const ang = f / n * Math.PI * 2 + (f % 2) * 0.2;
        const largo = 3.6 + (f % 3) * 0.4;
        const caida = 0.55 + (f % 2) * 0.25;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const seg = 7;
        const pts = [];
        for (let s = 0; s <= seg; s++) {
          const u = s / seg;
          const r = u * largo;
          const y = 8.7 + Math.sin(u * Math.PI * 0.8) * 0.9 - u * u * largo * caida;
          pts.push([1.4 + ca * r, y, sa * r]);
        }
        for (let s = 0; s < seg; s++) {
          const [x0, y0, z0] = pts[s], [x1, y1, z1] = pts[s + 1];
          const u = (s + 0.5) / seg;
          const ancho = Math.sin(u * Math.PI) * 0.75 + 0.08;
          const px = -sa * ancho, pz = ca * ancho;
          const col = s % 2 ? '#3f7d2b' : '#4e9134';
          // foliolos a ambos lados, caídos
          m.tri([x0, y0, z0], [x1, y1, z1], [x0 + px, y0 - 0.25, z0 + pz], [0, 0], [1, 0], [0, 1], col);
          m.tri([x1, y1, z1], [x0, y0, z0], [x0 - px, y0 - 0.25, z0 - pz], [0, 0], [1, 0], [0, 1], col);
        }
      }
    });
    const matF = conViento(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, side: THREE.DoubleSide }), 'fronda-viento', uT, 0.045);
    const fn = d => matriz(d.x, d.y, d.z, d.rot ?? 0, d.esc ?? 1);
    instanciar(grupo, tronco, matSolido, inst.palmera, fn);
    instanciar(grupo, fronda, matF, inst.palmera, fn, { color: (d, i) => ['#ffffff', '#f0f5d0', '#e2ecc0', '#d7e8b8'][i % 4] });
  }

  // ---------- Farolas ----------
  {
    const poste = geoDe(m => {
      m.geo(new THREE.CylinderGeometry(0.09, 0.14, 7.2, 8).translate(0, 3.6, 0), null, '#5b6168');
      m.caja(0, 7.0, 0.95, 0.09, 0.09, 1.9, '#5b6168');
      m.caja(0, 6.85, 1.9, 0.35, 0.22, 0.75, '#3a3f45');
    });
    instanciar(grupo, poste, M.metal, inst.farol, d => matriz(d.x, d.y, d.z, d.rot ?? 0));
    const foco = new THREE.BoxGeometry(0.3, 0.05, 0.6).translate(0, 6.82, 1.9);
    const im = instanciar(grupo, foco, new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.1, 2.0) }), inst.farol, d => matriz(d.x, d.y, d.z, d.rot ?? 0), { sombra: false });
    if (im) sinAO.push(im);
    const colonial = geoDe(m => {
      m.geo(new THREE.CylinderGeometry(0.07, 0.12, 3.6, 8).translate(0, 1.8, 0), null, '#16181b');
      m.geo(new THREE.CylinderGeometry(0.2, 0.25, 0.4, 8).translate(0, 0.2, 0), null, '#16181b');
      m.geo(new THREE.CylinderGeometry(0.32, 0.18, 0.12, 6).translate(0, 4.3, 0), null, '#16181b');
      m.geo(new THREE.ConeGeometry(0.34, 0.35, 6).translate(0, 4.5, 0), null, '#16181b');
    });
    instanciar(grupo, colonial, matSolido, inst.farolColonial, d => matriz(d.x, d.y, d.z, d.rot ?? 0));
    const linterna = new THREE.CylinderGeometry(0.2, 0.15, 0.55, 6).translate(0, 3.95, 0);
    const im2 = instanciar(grupo, linterna, new THREE.MeshBasicMaterial({ color: new THREE.Color(4.2, 2.7, 1.3) }), inst.farolColonial, d => matriz(d.x, d.y, d.z), { sombra: false });
    if (im2) sinAO.push(im2);
    // charcos de luz cálida en el suelo
    const charcos = [...inst.farol.map(d => ({ x: d.x + Math.sin(d.rot ?? 0) * 1.9, z: d.z + Math.cos(d.rot ?? 0) * 1.9, y: d.y, r: 4.5 })), ...inst.farolColonial.map(d => ({ x: d.x, z: d.z, y: d.y, r: 3 }))];
    const matCh = new THREE.MeshBasicMaterial({ map: texturaRadial('rgba(255,190,110,0.5)', 'rgba(255,170,90,0)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6 });
    const im3 = instanciar(grupo, new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), matCh, charcos, d => matriz(d.x, d.y + 0.06, d.z, 0, [d.r, 1, d.r]), { sombra: false, recibe: false });
    if (im3) { sinAO.push(im3); im3.visible = false; } // de día no se ven: se reservan para una versión nocturna
  }

  // ---------- Bancas, sombrillas, tumbonas, bolardos ----------
  {
    const banca = geoDe(m => {
      m.caja(0, 0.42, 0, 1.8, 0.08, 0.45, '#8a5a35'); m.geo(new THREE.BoxGeometry(1.8, 0.4, 0.06), matriz(0, 0.75, -0.24, 0, 1, -0.2), '#8a5a35');
      for (const x of [-0.75, 0.75]) m.caja(x, 0, 0, 0.08, 0.45, 0.45, '#2b2d30');
    });
    instanciar(grupo, banca, matSolido, inst.banca, d => matriz(d.x, d.y, d.z, d.rot ?? 0));
    const palo = geoDe(m => m.geo(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6).translate(0, 1.2, 0), null, '#e8e2d6'));
    const lona = geoDe(m => {
      const g = new THREE.ConeGeometry(1.6, 0.6, 10, 1, true).translate(0, 2.45, 0);
      m.geo(g, null, '#ffffff');
    });
    instanciar(grupo, palo, matSolido, inst.sombrilla, d => matriz(d.x, d.y, d.z));
    instanciar(grupo, lona, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, side: THREE.DoubleSide, flatShading: true }), inst.sombrilla, d => matriz(d.x, d.y, d.z, d.x), { color: d => d.color });
    const tumbona = geoDe(m => {
      m.caja(0, 0.25, 0, 0.6, 0.06, 1.3, '#f4efe6');
      m.geo(new THREE.BoxGeometry(0.6, 0.06, 0.6), matriz(0, 0.45, -0.75, 0, 1, 0.7), '#f4efe6');
      m.caja(0, 0, 0.5, 0.55, 0.25, 0.05, '#9c9c9c'); m.caja(0, 0, -0.4, 0.55, 0.25, 0.05, '#9c9c9c');
    });
    instanciar(grupo, tumbona, matSolido, inst.tumbona, d => matriz(d.x, d.y, d.z, d.rot ?? 0));
    const bol = geoDe(m => { m.geo(new THREE.CylinderGeometry(0.25, 0.3, 0.7, 6).translate(0, 0.35, 0), null, '#2b2f35'); });
    instanciar(grupo, bol, matSolido, inst.bolardo, d => matriz(d.x, d.y, d.z));
  }

  // ---------- Mobiliario de esquina: papeleras, hidrantes, quioscos, paradas y alcantarillas ----------
  {
    const papelera = geoDe(m => {
      m.geo(new THREE.CylinderGeometry(0.34, 0.3, 0.85, 10).translate(0, 0.45, 0), null, '#2d6a4f');
      m.geo(new THREE.CylinderGeometry(0.37, 0.37, 0.08, 10).translate(0, 0.9, 0), null, '#1f4a37');
      m.geo(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 5).translate(0, 0.05, 0), null, '#333');
    });
    instanciar(grupo, papelera, matSolido, inst.papelera, d => matriz(d.x, d.y, d.z));
    const hidrante = geoDe(m => {
      m.geo(new THREE.CylinderGeometry(0.16, 0.2, 0.75, 10).translate(0, 0.38, 0), null, '#c1121f');
      m.geo(new THREE.SphereGeometry(0.17, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.75, 0), null, '#c1121f');
      m.geo(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8).rotateZ(Math.PI / 2).translate(0, 0.5, 0), null, '#e9c46a');
    });
    instanciar(grupo, hidrante, matSolido, inst.hidrante, d => matriz(d.x, d.y, d.z));
    const quiosco = geoDe(m => {
      m.caja(0, 0, 0, 1.8, 1.2, 1.4, '#f4efe6');
      m.caja(0, 1.2, 0, 1.9, 0.08, 1.5, '#8a6a48');
      m.caja(0, 0.95, 0.72, 1.6, 0.35, 0.05, '#2a9d8f');
      for (const sx of [-0.85, 0.85]) m.caja(sx, 1.28, 0.55, 0.06, 1.0, 0.06, '#5a5a5a');
      m.geo(new THREE.ConeGeometry(1.7, 0.55, 8).translate(0, 2.55, 0.2), null, '#ffffff');
      m.caja(0, 1.28, 0.2, 0.06, 1.0, 0.06, '#5a5a5a');
    });
    instanciar(grupo, quiosco, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 }), inst.quiosco, d => matriz(d.x, d.y, d.z, d.rot ?? 0));
    const parada = geoDe(m => {
      for (const sx of [-1.3, 1.3]) m.caja(sx, 0, 0, 0.08, 2.5, 0.08, '#3a4048');
      m.caja(0, 2.5, 0, 2.9, 0.1, 1.3, '#2a9d8f');
      m.caja(0, 0.5, -0.5, 2.6, 0.06, 0.4, '#8a5a35');
      m.caja(0, 0.5, -0.62, 2.6, 0.9, 0.04, '#9fc3d0');
      m.caja(1.4, 0, 0.4, 0.06, 2.2, 0.06, '#c9d2dc'); m.caja(1.4, 2.0, 0.4, 0.5, 0.35, 0.05, '#d1372f');
    });
    instanciar(grupo, parada, M.metal, inst.parada, d => matriz(d.x, d.y, d.z, d.rot ?? 0));
    const tapa = geoDe(m => {
      m.geo(new THREE.CylinderGeometry(0.52, 0.52, 0.02, 18).translate(0, 0.01, 0), null, '#3b3631');
      m.geo(new THREE.CylinderGeometry(0.44, 0.44, 0.03, 18).translate(0, 0.02, 0), null, '#25221f');
      for (let k = -2; k <= 2; k++) m.caja(0, 0.035, k * 0.14, 0.7 - Math.abs(k) * 0.12, 0.012, 0.05, '#4a443d');
    });
    instanciar(grupo, tapa, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.5, polygonOffset: true, polygonOffsetFactor: -8, polygonOffsetUnits: -8 }),
      inst.alcantarilla, d => matriz(d.x, 0.05, d.z, 0), { sombra: false });
  }

  // ---------- Semáforos ----------
  let semaforos = null;
  {
    const poste = geoDe(m => {
      m.geo(new THREE.CylinderGeometry(0.08, 0.1, 5.2, 8).translate(0, 2.6, 0), null, '#2c3036');
      m.caja(-1.6, 5.0, 0, 3.4, 0.1, 0.1, '#2c3036');
      m.caja(-3.0, 4.0, 0.05, 0.38, 1.1, 0.3, '#1b1d20');
      m.caja(0, 2.2, 0.12, 0.3, 0.8, 0.2, '#1b1d20');
    });
    instanciar(grupo, poste, matSolido, inst.semaforo, d => matriz(d.x, d.y, d.z, d.rot));
    // 3 lámparas por semáforo
    const lamparas = [];
    for (const s of inst.semaforo) for (let k = 0; k < 3; k++) lamparas.push({ ...s, k });
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const im = instanciar(grupo, new THREE.CircleGeometry(0.13, 10), mat, lamparas, d => {
      const loc = new THREE.Vector3(-3.0, 4.92 - d.k * 0.34, 0.21).applyAxisAngle(new THREE.Vector3(0, 1, 0), d.rot);
      return matriz(d.x + loc.x, d.y + loc.y, d.z + loc.z, d.rot);
    }, { sombra: false, recibe: false, color: () => '#111111' });
    if (im) {
      sinAO.push(im);
      const colores = [new THREE.Color(5, 0.25, 0.15), new THREE.Color(5, 3.2, 0.2), new THREE.Color(0.3, 4.5, 1.6)];
      const apagado = new THREE.Color(0.05, 0.05, 0.05);
      semaforos = {
        // estado(nodo, eje) → 0 rojo, 1 amarillo, 2 verde
        actualizar(estado) {
          lamparas.forEach((d, i) => {
            const e = estado(d.nodo, d.eje);
            const k = e === 2 ? 2 : e === 1 ? 1 : 0;
            im.setColorAt(i, d.k === k ? colores[k] : apagado);
          });
          im.instanceColor.needsUpdate = true;
        }
      };
    }
  }

  // ---------- Contenedores ----------
  {
    const geo = geoDe(m => {
      m.caja(0, 0, 0, 6.06, 2.59, 2.44, '#ffffff', { escala: 3 });
    });
    instanciar(grupo, geo, M.corrugado, inst.contenedor, d => matriz(d.x, d.y, d.z, d.rot ?? 0), { color: d => d.color });
  }

  // ---------- Grúas pórtico del muelle (con carro animado) ----------
  {
    const xs = [62, 96, 130];
    const zq = MUELLE_Z + 9;
    const est = new Malla();
    const colores = ['#d1372f', '#e9b44c', '#2471a3'];
    xs.forEach((x, k) => {
      const c = colores[k];
      for (const dx of [-5, 5]) for (const dz of [-5, 5]) est.caja(x + dx, 0.12, zq + dz, 0.9, 26, 0.9, c);
      for (const dz of [-5, 5]) est.caja(x, 24, zq + dz, 11, 1.2, 1.0, c);
      for (const dx of [-5, 5]) { est.caja(x + dx, 12, zq, 0.6, 0.6, 10, c); est.caja(x + dx, 0.12, zq, 1.2, 1.0, 11.5, '#3a3f45'); }
      // pluma sobre el agua y contrapluma
      est.caja(x, 26, zq - 21, 3.0, 1.6, 50, c);
      est.caja(x, 27.6, zq - 4, 2.2, 6, 2.2, '#f4f4f4');
      est.caja(x, 33.6, zq - 4, 0.5, 0.5, 0.5, '#f4f4f4');
      est.caja(x, 24.6, zq + 5, 4.6, 2.2, 3.6, '#f4f4f4');
      const t1 = new THREE.CylinderGeometry(0.12, 0.12, 22, 5).rotateX(Math.PI / 2 - 0.42).translate(x, 30.5, zq - 14);
      est.geo(t1, null, '#cfd3d8');
    });
    est.malla(M.metal, grupo);
    // carros con spreader y cable
    xs.forEach((x, k) => {
      const carro = new THREE.Group();
      const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.4, 3.0), new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.5 }));
      cuerpo.castShadow = true;
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 4).translate(0, -0.5, 0), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      const spreader = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 6.4), new THREE.MeshStandardMaterial({ color: 0xe9b44c, roughness: 0.6 }));
      spreader.castShadow = true;
      carro.add(cuerpo, cable, spreader);
      grupo.add(carro);
      const fase = k * 2.1;
      animar.push((t) => {
        const ciclo = (Math.sin(t * 0.18 + fase) + 1) / 2;            // 0 muelle, 1 barco
        const z = zq + 1 - ciclo * 25;
        const bajada = Math.max(0, Math.sin(t * 0.36 + fase * 2)) * 14;
        carro.position.set(x, 25.2, z);
        cable.scale.y = 2 + bajada; spreader.position.y = -2.4 - bajada;
      });
    });
  }

  // ---------- Buque portacontenedores atracado ----------
  {
    const barco = new THREE.Group();
    const casco = new Malla();
    const L = 120, B = 20;
    const forma = new THREE.Shape();
    forma.moveTo(-L / 2, -B / 2); forma.lineTo(L / 2 - 12, -B / 2); forma.quadraticCurveTo(L / 2 + 4, 0, L / 2 - 12, B / 2); forma.lineTo(-L / 2, B / 2); forma.lineTo(-L / 2, -B / 2);
    const gCasco = new THREE.ExtrudeGeometry(forma, { depth: 9, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -4, 0);
    casco.geo(gCasco, null, '#1f3550');
    const gQuilla = new THREE.ExtrudeGeometry(forma, { depth: 2.2, bevelEnabled: false }).rotateX(-Math.PI / 2).scale(1.002, 1, 1.01).translate(0, -4.6, 0);
    casco.geo(gQuilla, null, '#9b2c2c');
    // superestructura
    casco.caja(-L / 2 + 9, 5, 0, 10, 13, 18, '#f2f2f2');
    casco.caja(-L / 2 + 9, 18, 0, 12, 1, 21, '#f2f2f2');
    casco.caja(-L / 2 + 9, 15.5, 9.05, 9, 1.4, 0.1, '#1d2a38');
    casco.geo(new THREE.CylinderGeometry(1.2, 1.4, 6, 10).translate(-L / 2 + 4, 19, 0), null, '#d1495b');
    casco.malla(M.solido, barco);
    // pilas de contenedores en cubierta
    const c = new Malla();
    const a2 = crearAzar(17);
    const cols = ['#c0392b', '#2471a3', '#d68910', '#1e8449', '#7d3c98', '#5d6d7e', '#ca6f1e', '#117a65'];
    for (let x = -L / 2 + 18; x < L / 2 - 16; x += 6.3) for (let z = -7.3; z <= 7.4; z += 2.45) {
      const h = a2.entero(1, 4);
      for (let k = 0; k < h; k++) c.caja(x, 5 + k * 2.6, z, 6.06, 2.59, 2.44, a2.elegir(cols), { escala: 3 });
    }
    c.malla(M.corrugado, barco);
    barco.position.set(100, NIVEL_MAR, MUELLE_Z - 14);
    barco.rotation.y = Math.PI;
    grupo.add(barco);
    animar.push(t => { barco.position.y = NIVEL_MAR + Math.sin(t * 0.5) * 0.12; barco.rotation.z = Math.sin(t * 0.37) * 0.006; });
  }

  // ---------- Botes en la bahía ----------
  {
    const bote = (colorCasco, velero) => {
      const g = new THREE.Group();
      const m = new Malla();
      const f = new THREE.Shape();
      f.moveTo(-3, -1.1); f.lineTo(2, -1.1); f.quadraticCurveTo(3.8, 0, 2, 1.1); f.lineTo(-3, 1.1); f.lineTo(-3, -1.1);
      m.geo(new THREE.ExtrudeGeometry(f, { depth: 1.1, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -0.4, 0), null, colorCasco);
      m.caja(-0.6, 0.7, 0, 2.2, 1.1, 1.6, '#f4f4f4');
      if (velero) {
        m.geo(new THREE.CylinderGeometry(0.06, 0.06, 8, 5).translate(0.4, 4.7, 0), null, '#ddd');
        const vela = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.45, 1.2, 0), new THREE.Vector3(0.45, 8.4, 0), new THREE.Vector3(-2.6, 1.3, 0)]);
        vela.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 0, 1, 1, 0], 2)); vela.computeVertexNormals();
        m.geo(vela, null, '#fbfbf5');
      }
      const me = m.malla(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide }), g);
      me.matrixAutoUpdate = true;
      return g;
    };
    const rutas = [
      { cx: -190, cz: -20, r: 30, v: 0.05, velero: true, c: '#ffffff' },
      { cx: -200, cz: 80, r: 40, v: -0.035, velero: true, c: '#2a9d8f' },
      { cx: -60, cz: -190, r: 35, v: 0.045, velero: false, c: '#d1495b' },
      { cx: -170, cz: -160, r: 22, v: -0.06, velero: false, c: '#f2c230' },
      { cx: 20, cz: -200, r: 30, v: 0.04, velero: true, c: '#ffffff' },
      { cx: -175, cz: 160, r: 25, v: 0.05, velero: false, c: '#4ea8de' }
    ];
    // botes fondeados frente a la playa y junto al muelle: se mecen sobre su ancla
    const fondeados = [[-163, -60, 0.4, '#ffffff', true], [-172, -20, 1.1, '#e63946', false], [-168, 30, 2.3, '#2a9d8f', true], [-176, 70, 0.8, '#f2c230', false], [-165, 115, 1.9, '#ffffff', true], [-150, -165, 0.2, '#4ea8de', false], [-120, -170, 1.4, '#d1495b', true], [-60, -166, 2.0, '#ffffff', false]];
    for (const [fx, fz, giro, color, velero] of fondeados) {
      const b = bote(color, velero);
      grupo.add(b);
      const f0 = az() * 6;
      animar.push(t => {
        b.position.set(fx + Math.sin(t * 0.21 + f0) * 0.8, NIVEL_MAR + 0.12 + Math.sin(t * 1.3 + f0) * 0.1, fz + Math.cos(t * 0.17 + f0) * 0.8);
        b.rotation.set(Math.sin(t * 0.9 + f0) * 0.04, giro + Math.sin(t * 0.25 + f0) * 0.25, Math.sin(t * 1.15 + f0 * 2) * 0.08);
      });
    }
    // pirogas de pesca cerca de la orilla: pequeñas, a la deriva suave
    const pirogas = [[-152, -100], [-155, -40], [-158, 10], [-154, 60], [-156, 100], [-150, 140], [-185, -50], [-190, 45]];
    pirogas.forEach(([px, pz], i) => {
      const b = bote(['#f2c230', '#e63946', '#2a9d8f', '#ffffff'][i % 4], false);
      b.scale.set(0.55, 0.55, 0.55); grupo.add(b);
      const f0 = az() * 6, giro = az() * 6.28;
      animar.push(t => {
        b.position.set(px + Math.sin(t * 0.3 + f0) * 1.5, NIVEL_MAR + 0.06 + Math.sin(t * 1.5 + f0) * 0.07, pz + Math.cos(t * 0.25 + f0) * 1.5);
        b.rotation.set(Math.sin(t * 1.0 + f0) * 0.05, giro + Math.sin(t * 0.2 + f0) * 0.3, Math.sin(t * 1.3 + f0) * 0.09);
      });
    });
    // lancha en marcha con estela
    {
      const lancha = bote('#ffffff', false); grupo.add(lancha);
      const tri = new THREE.Shape(); tri.moveTo(-3, 0); tri.lineTo(-20, 3.2); tri.lineTo(-20, -3.2); tri.lineTo(-3, 0);
      const estela = new THREE.Mesh(new THREE.ShapeGeometry(tri).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
      estela.position.y = 0.15; lancha.add(estela);
      animar.push(t => {
        const a = 1.0 + t * 0.12;
        lancha.position.set(-205 + Math.cos(a) * 55, NIVEL_MAR + 0.1 + Math.sin(t * 6) * 0.04, 20 + Math.sin(a) * 85);
        lancha.rotation.set(0, -a - Math.PI / 2 + Math.PI, -0.05);
        estela.material.opacity = 0.28 + Math.sin(t * 5) * 0.07;
      });
    }
    // boyas de señalización con luz intermitente
    {
      const luzBoya = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.4, 0.3) });
      const matBoya = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.5 });
      const geoCuerpo = new THREE.SphereGeometry(0.7, 10, 8);
      const geoLuz = new THREE.SphereGeometry(0.2, 8, 6);
      const boyas = [[-180, -120], [-182, -60], [-185, 0], [-183, 60], [-181, 120], [-178, 170], [-110, -175], [-30, -176], [40, -178], [140, -178]];
      boyas.forEach(([bx, bz], i) => {
        const g = new THREE.Group();
        const c = new THREE.Mesh(geoCuerpo, matBoya); c.scale.y = 1.3; c.castShadow = true;
        const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 5), new THREE.MeshStandardMaterial({ color: 0x333333 })); poste.position.y = 1.2;
        const l = new THREE.Mesh(geoLuz, luzBoya); l.position.y = 1.9; sinAO.push(l);
        g.add(c, poste, l); grupo.add(g);
        const f0 = i * 1.7;
        animar.push(t => { g.position.set(bx, NIVEL_MAR + 0.25 + Math.sin(t * 1.2 + f0) * 0.12, bz); g.rotation.z = Math.sin(t * 0.9 + f0) * 0.08; });
      });
      animar.push(t => { const on = (t % 2) < 0.7; luzBoya.color.setRGB(on ? 5 : 0.3, on ? 0.5 : 0.05, on ? 0.35 : 0.04); });
    }
    for (const R of rutas) {
      const b = bote(R.c, R.velero);
      grupo.add(b);
      const f0 = az() * 6;
      animar.push(t => {
        const a = f0 + t * R.v;
        b.position.set(R.cx + Math.cos(a) * R.r, NIVEL_MAR + 0.1 + Math.sin(t * 1.4 + f0) * 0.12, R.cz + Math.sin(a) * R.r);
        b.rotation.y = -a - (R.v > 0 ? Math.PI / 2 : -Math.PI / 2) + Math.PI;
        b.rotation.z = Math.sin(t * 1.1 + f0) * 0.05;
      });
    }
  }

  // ---------- Faro en el espolón ----------
  {
    const fx = MALECON_X0 - 26, fz = MUELLE_Z + 1, y0 = 0.4;
    const m = new Malla();
    m.geo(new THREE.CylinderGeometry(2.6, 3.0, 1.2, 16).translate(fx, y0 - 0.6, fz), null, '#bfb6a5');
    for (let k = 0; k < 5; k++) m.geo(new THREE.CylinderGeometry(1.7 - k * 0.12 - 0.12, 1.7 - k * 0.12, 3, 16).translate(fx, y0 + 1.5 + k * 3, fz), null, k % 2 ? '#d1372f' : '#f6f6f2');
    m.geo(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 16).translate(fx, y0 + 15.1, fz), null, '#2b2f35');
    m.geo(new THREE.ConeGeometry(1.25, 1.4, 16).translate(fx, y0 + 18.2, fz), null, '#d1372f');
    m.malla(M.solido, grupo);
    const lampara = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.3, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 4.2, 2.6) }));
    lampara.position.set(fx, y0 + 16.4, fz); grupo.add(lampara); sinAO.push(lampara);
    const haz = new THREE.Mesh(new THREE.ConeGeometry(4, 60, 24, 1, true).translate(0, -30, 0).rotateZ(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.0, 0.7), transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const pivote = new THREE.Group(); pivote.position.copy(lampara.position); pivote.add(haz); grupo.add(pivote); sinAO.push(haz);
    animar.push(t => { pivote.rotation.y = t * 0.6; });
  }

  // ---------- Gaviotas ----------
  {
    const n = 44;
    const ala = new THREE.BufferGeometry();
    ala.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.3, -0.9, 0.25, -0.1, 0, 0, -0.3, 0, 0, 0.3, 0, 0, -0.3, 0.9, 0.25, -0.1], 3));
    ala.computeVertexNormals();
    const im = new THREE.InstancedMesh(ala, new THREE.MeshStandardMaterial({ color: 0xf4f4f0, side: THREE.DoubleSide, roughness: 0.8 }), n);
    im.frustumCulled = false;
    grupo.add(im);
    const aves = Array.from({ length: n }, (_, i) => ({ cx: az.rango(-175, -80), cz: az.rango(-185, 60), r: az.rango(10, 30), h: az.rango(14, 30), v: az.rango(0.25, 0.5) * (i % 2 ? 1 : -1), f: az() * 6 }));
    const q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
    animar.push(t => {
      aves.forEach((a, i) => {
        const ang = a.f + t * a.v;
        p.set(a.cx + Math.cos(ang) * a.r, a.h + Math.sin(t * 0.7 + a.f) * 2, a.cz + Math.sin(ang) * a.r);
        e.set(0, -ang + (a.v > 0 ? 0 : Math.PI), Math.sin(t * 0.8 + a.f) * 0.3);
        q.setFromEuler(e);
        const aleteo = 0.6 + 0.6 * Math.abs(Math.sin(t * 6 + a.f * 3));
        s.set(1, aleteo, 1);
        _m.compose(p, q, s);
        im.setMatrixAt(i, _m);
      });
      im.instanceMatrix.needsUpdate = true;
    });
  }

  return {
    grupo, sinAO, semaforos, pequenos: PEQUENOS,
    actualizar(t) { uT.value = t; for (const f of animar) f(t); }
  };
}
