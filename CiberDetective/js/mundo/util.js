// Utilidades del MUNDO: azar con semilla, constructor de mallas fusionadas y ayudas de geometría
import * as THREE from 'three';

// ---------- Azar determinista (mulberry32) ----------
export function crearAzar(semilla = 1234) {
  let a = semilla >>> 0;
  const f = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.rango = (x, y) => x + (y - x) * f();
  f.entero = (x, y) => Math.floor(x + (y - x + 1) * f());
  f.elegir = arr => arr[Math.floor(f() * arr.length) % arr.length];
  f.prob = p => f() < p;
  return f;
}

export const pausa = (ms = 0) => new Promise(r => setTimeout(r, ms));
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const suave = t => t * t * (3 - 2 * t);

const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _m3 = new THREE.Matrix3();

// ---------- Constructor de mallas fusionadas ----------
// Acumula triángulos con posición, normal, uv y color por vértice. Un solo draw call por material.
export class Malla {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; }

  get vacia() { return this.p.length === 0; }

  _col(col) {
    if (col && col.isColor) return col;
    return new THREE.Color(col ?? 0xffffff);
  }

  // Triángulo con normal plana
  tri(a, b, c, ua, ub, uc, col) {
    const k = this._col(col);
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let nx = e1[1] * e2[2] - e1[2] * e2[1];
    let ny = e1[2] * e2[0] - e1[0] * e2[2];
    let nz = e1[0] * e2[1] - e1[1] * e2[0];
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    for (const [p, uv] of [[a, ua], [b, ub], [c, uc]]) {
      this.p.push(p[0], p[1], p[2]);
      this.n.push(nx, ny, nz);
      this.u.push(uv[0], uv[1]);
      this.c.push(k.r, k.g, k.b);
    }
  }

  // Cuadrilátero a-b-c-d en sentido antihorario visto desde el frente.
  // uv = [u0, v0, u1, v1]: a=(u0,v0) b=(u1,v0) c=(u1,v1) d=(u0,v1)
  quad(a, b, c, d, uv = [0, 0, 1, 1], col) {
    const [u0, v0, u1, v1] = uv;
    this.tri(a, b, c, [u0, v0], [u1, v0], [u1, v1], col);
    this.tri(a, c, d, [u0, v0], [u1, v1], [u0, v1], col);
  }

  // Caja alineada a ejes con UV en metros (escala = metros por repetición)
  caja(cx, cy, cz, sx, sy, sz, col, { escala = 4, sinBase = true, sinTapa = false } = {}) {
    const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy, y1 = cy + sy, z0 = cz - sz / 2, z1 = cz + sz / 2;
    const e = escala;
    // +z
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0 / e, y0 / e, x1 / e, y1 / e], col);
    // -z
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [-x1 / e, y0 / e, -x0 / e, y1 / e], col);
    // +x
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [-z1 / e, y0 / e, -z0 / e, y1 / e], col);
    // -x
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [z0 / e, y0 / e, z1 / e, y1 / e], col);
    if (!sinTapa) this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [x0 / e, -z1 / e, x1 / e, -z0 / e], col);
    if (!sinBase) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0 / e, z0 / e, x1 / e, z1 / e], col);
  }

  // Caja orientada: centro de la base (cx, cy, cz), rotación en Y
  cajaRot(cx, cy, cz, sx, sy, sz, rotY, col, opciones) {
    const m = new THREE.Matrix4().makeRotationY(rotY).setPosition(cx, cy, cz);
    const g = new THREE.BoxGeometry(sx, sy, sz).translate(0, sy / 2, 0);
    this.geo(g, m, col, opciones);
    g.dispose();
  }

  // Agrega cualquier BufferGeometry (con o sin índices) transformada
  geo(g, matriz, col, { escalaUV = 1 } = {}) {
    const k = this._col(col);
    const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
    const idx = g.index ? g.index.array : null;
    const n = idx ? idx.length : pos.count;
    if (matriz) _m3.getNormalMatrix(matriz);
    for (let i = 0; i < n; i++) {
      const j = idx ? idx[i] : i;
      _v.fromBufferAttribute(pos, j);
      if (matriz) _v.applyMatrix4(matriz);
      this.p.push(_v.x, _v.y, _v.z);
      if (nor) { _n.fromBufferAttribute(nor, j); if (matriz) _n.applyMatrix3(_m3).normalize(); this.n.push(_n.x, _n.y, _n.z); }
      else this.n.push(0, 1, 0);
      if (uv) this.u.push(uv.getX(j) * escalaUV, uv.getY(j) * escalaUV); else this.u.push(0, 0);
      this.c.push(k.r, k.g, k.b);
    }
  }

  construir() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }

  // Crea la malla con el material dado y la agrega a `padre`
  malla(material, padre, { sombra = true, recibe = true } = {}) {
    if (this.vacia) return null;
    const m = new THREE.Mesh(this.construir(), material);
    m.castShadow = sombra; m.receiveShadow = recibe;
    m.matrixAutoUpdate = false; m.updateMatrix();
    if (padre) padre.add(m);
    return m;
  }
}

// Geometría con color por vértice (para fusionar piezas de instancias)
export function fusionarConColor(partes) {
  // partes: [{ geo, matriz?, color }]
  const m = new Malla();
  for (const p of partes) m.geo(p.geo, p.matriz, p.color);
  return m.construir();
}

// Matriz de traslación + rotación Y + escala
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _s = new THREE.Vector3();
const _p = new THREE.Vector3();
export function matriz(x, y, z, rotY = 0, esc = 1, rotX = 0, rotZ = 0) {
  _e.set(rotX, rotY, rotZ, 'YXZ');
  _q.setFromEuler(_e);
  if (typeof esc === 'number') _s.set(esc, esc, esc); else _s.set(esc[0], esc[1], esc[2]);
  return new THREE.Matrix4().compose(_p.set(x, y, z), _q, _s);
}

// Inyecta código en un material estándar sin romper la caché de programas
export function parchear(material, clave, fn) {
  material.onBeforeCompile = fn;
  material.customProgramCacheKey = () => clave;
  return material;
}
