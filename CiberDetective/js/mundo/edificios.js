// Edificios del catálogo (ids fijos del contrato). Cada uno es un grupo propio para poder resaltarlo.
import * as THREE from 'three';
import { Malla, matriz } from './util.js';
import { casa, torre, hilera, perimetro, crearContexto, rellenarAzotea, pretilConMoldura, PALETA_MODERNA, PALETA_COLONIAL } from './construccion.js';
import { materialHolo } from './materiales.js';
import { texturaReloj, texturaCancha, texturaHolograma } from './texturas.js';
import { CALLES_X, CALLES_Z, OFF_ACERA, ALTO_ANDEN, rectManzana, MURALLA } from './plano.js';

const NOMBRES_CASAS = ['Pérez Arrieta', 'Martínez Barrios', 'Gómez Pacheco', 'Herrera Castro', 'Julio Simancas', 'Padilla Torres', 'Caraballo Díaz', 'Mendoza Olivares'];

// Pieza: acumula mallas por material y las convierte en hijos del grupo del edificio
class Pieza {
  constructor(M, az, global) {
    this.M = M;
    this.grupo = new THREE.Group();
    this.ctx = crearContexto(az);
    this.ctx.inst = global.inst;      // las instancias (balcones, AC...) van al conjunto global
    this.ctx.cajas = [];
    this.az = az;
    this.animables = [];
    this.holos = [];
  }
  m(nombre) { return this.ctx.malla(nombre, Malla); }
  agregarMalla(geo, material, { sombra = true } = {}) {
    const me = new THREE.Mesh(geo, material);
    me.castShadow = sombra; me.receiveShadow = true;
    this.grupo.add(me);
    return me;
  }
  cerrar() {
    for (const [nombre, malla] of Object.entries(this.ctx.m)) {
      const mat = this.M[nombre];
      if (!mat) { console.warn('Material ausente', nombre); continue; }
      const me = malla.malla(mat, this.grupo, { sombra: nombre !== 'luces' });
      if (me && nombre === 'luces') me.userData.sinResalte = true;
    }
    return this.grupo;
  }
}

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const entradaSur = (x, j) => v3(x, ALTO_ANDEN, CALLES_Z[j + 1] - OFF_ACERA);

export function crearEdificiosCatalogo(M, az, global, letreros) {
  const lista = [];
  const reg = (id, tipo, nombre, pieza, datos) => {
    pieza.cerrar();
    pieza.grupo.name = id;
    // caja de selección: solo la arquitectura (sin hologramas animados)
    const caja = new THREE.Box3();
    const fuera = new Set(pieza.holos);
    pieza.grupo.updateMatrixWorld(true);
    pieza.grupo.traverse(o => {
      if (!o.isMesh || fuera.has(o)) return;
      let p = o.parent, holo = false;
      while (p) { if (fuera.has(p)) { holo = true; break; } p = p.parent; }
      if (!holo) caja.expandByObject(o);
    });
    const posicion = datos.posicion ?? v3((caja.min.x + caja.max.x) / 2, 0, (caja.min.z + caja.max.z) / 2);
    lista.push({
      id, tipo, nombre, grupo: pieza.grupo, caja, posicion, entrada: datos.entrada,
      ancho: caja.max.x - caja.min.x, fondo: caja.max.z - caja.min.z, alto: caja.max.y,
      color: datos.color, animables: pieza.animables, holos: pieza.holos
    });
  };

  // ======================= CENTRAL DE CIBERPOLICÍA =======================
  {
    const p = new Pieza(M, az, global);
    const r = rectManzana(3, 2);
    const cx = r.cx, cz = r.cz - 2;
    const sol = p.m('solido'), ofi = p.m('oficinas'), lu = p.m('luces'), met = p.m('metal');
    const b = ALTO_ANDEN;
    // cuerpo principal con piel de oficinas y aletas verticales
    const W = 23, D = 14, H = 13.5;
    const x0 = cx - W / 2, x1 = cx + W / 2, z0 = cz - D / 2 - 3, z1 = cz + D / 2 - 3;
    const uv = (s0, s1) => [s0 / 12, 0, s1 / 12, H / 14];
    ofi.quad([x0, b, z1], [x1, b, z1], [x1, b + H, z1], [x0, b + H, z1], uv(0, W), '#dfe8f2');
    ofi.quad([x1, b, z1], [x1, b, z0], [x1, b + H, z0], [x1, b + H, z1], uv(0, D), '#dfe8f2');
    ofi.quad([x1, b, z0], [x0, b, z0], [x0, b + H, z0], [x1, b + H, z0], uv(0, W), '#dfe8f2');
    ofi.quad([x0, b, z0], [x0, b, z1], [x0, b + H, z1], [x0, b + H, z0], uv(0, D), '#dfe8f2');
    for (let x = x0; x <= x1 + 0.01; x += W / 8) met.caja(x, b, z1 + 0.25, 0.35, H + 0.6, 0.5, '#1d2c44');
    sol.caja(cx, b + H, cz - 3, W + 1.2, 0.9, D + 1.2, '#1c2a40');
    p.m('techo').quad([x0, b + H + 0.9, z1], [x1, b + H + 0.9, z1], [x1, b + H + 0.9, z0], [x0, b + H + 0.9, z0], [0, 0, W / 4, D / 4], '#ffffff');
    // franja azul institucional y LED cian
    sol.caja(cx, b + 4.2, z1 + 0.55, W + 0.4, 0.7, 0.3, '#14315c');
    lu.caja(cx, b + H + 0.95, z1 + 0.62, W + 1.2, 0.14, 0.14, new THREE.Color('#5ff3ff').multiplyScalar(3));
    lu.caja(cx, b + H + 0.95, z0 - 0.62, W + 1.2, 0.14, 0.14, new THREE.Color('#5ff3ff').multiplyScalar(3));
    lu.caja(x1 + 0.62, b + H + 0.95, cz - 3, 0.14, 0.14, D + 1.2, new THREE.Color('#5ff3ff').multiplyScalar(3));
    // atrio cilíndrico de vidrio
    const atrio = new THREE.CylinderGeometry(4.6, 4.6, 15.5, 32, 1, true).translate(cx, b + 7.75, z1 + 1.2);
    p.agregarMalla(atrio, M.cristal);
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; met.caja(cx + Math.cos(a) * 4.65, b, z1 + 1.2 + Math.sin(a) * 4.65, 0.12, 15.5, 0.12, '#8f98a3'); }
    for (const y of [3.7, 7.4, 11.1]) {
      met.geo(new THREE.TorusGeometry(4.75, 0.14, 5, 40).rotateX(Math.PI / 2).translate(cx, b + y, z1 + 1.2), null, '#8f98a3');
      lu.geo(new THREE.TorusGeometry(4.6, 0.05, 4, 40).rotateX(Math.PI / 2).translate(cx, b + y + 0.9, z1 + 1.2), null, new THREE.Color('#ffd9a0').multiplyScalar(1.6));
    }
    sol.geo(new THREE.CylinderGeometry(5, 5, 0.8, 32).translate(cx, b + 15.8, z1 + 1.2), null, '#1c2a40');
    lu.geo(new THREE.TorusGeometry(5.05, 0.09, 6, 48).rotateX(Math.PI / 2).translate(cx, b + 15.4, z1 + 1.2), null, new THREE.Color('#5ff3ff').multiplyScalar(3.5));
    lu.geo(new THREE.TorusGeometry(4.7, 0.07, 6, 48).rotateX(Math.PI / 2).translate(cx, b + 0.4, z1 + 1.2), null, new THREE.Color('#5ff3ff').multiplyScalar(2.5));
    // marquesina de acceso
    sol.caja(cx, b + 3.8, z1 + 6.4, 7, 0.35, 3, '#1c2a40');
    for (const sx of [-1, 1]) met.caja(cx + sx * 3.2, b, z1 + 7.6, 0.25, 3.8, 0.25, '#c9d2dc');
    // mástil de antenas y parabólicas
    const ax = x0 + 4, az0 = z0 + 4, yT = b + H + 0.9;
    rellenarAzotea(p.ctx, x0 + 11, x1 - 0.8, z0 + 0.8, z1 - 0.8, yT, { densidad: 1.4, escalera: false });
    global.inst.tanque.push({ x: x0 + 3, y: yT, z: z1 - 3, esc: 1.5 });
    for (let k = 0; k < 4; k++) {
      const [dx, dz] = [[-0.7, -0.7], [0.7, -0.7], [0.7, 0.7], [-0.7, 0.7]][k];
      met.caja(ax + dx, yT, az0 + dz, 0.16, 20, 0.16, '#c8ced6');
    }
    for (let y = yT + 1; y < yT + 20; y += 2) met.caja(ax, y, az0, 1.6, 0.1, 1.6, '#c8ced6');
    met.caja(ax, yT + 20, az0, 0.12, 6, 0.12, '#e0e4ea');
    global.inst.luzRoja = global.inst.luzRoja ?? [];
    global.inst.luzRoja.push({ x: ax, y: yT + 26.2, z: az0 }, { x: ax, y: yT + 12, z: az0 + 0.9 });
    for (const [dx, dz, ry] of [[6, 2, 0.6], [10, 3, -0.4]]) {
      const plato = new THREE.SphereGeometry(1.9, 20, 8, 0, Math.PI * 2, 0, Math.PI / 3.2).rotateX(-Math.PI / 2.4);
      met.geo(plato, matriz(x0 + dx, yT + 2.4, z0 + dz, ry), '#e9edf2');
      met.caja(x0 + dx, yT, z0 + dz, 0.3, 2.2, 0.3, '#9aa3ad');
    }
    // holograma: globo de datos con anillos y escudo
    const holo = new THREE.Group();
    holo.position.set(cx, b + 23.5, z1 + 1.2);
    const mGlobo = materialHolo('#5ff3ff', { intensidad: 1.4, fresnel: 1.6, base: 0.12 });
    const globo = new THREE.Mesh(new THREE.IcosahedronGeometry(3.4, 2), mGlobo);
    const alambre = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.45, 1)), new THREE.LineBasicMaterial({ color: new THREE.Color('#7ff6ff'), transparent: true, opacity: 0.3, depthWrite: false }));
    const anillo1 = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.08, 6, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd27f').multiplyScalar(2.5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    anillo1.rotation.x = Math.PI / 2.3;
    const anillo2 = anillo1.clone(); anillo2.rotation.set(Math.PI / 1.8, 0.6, 0);
    const escudoT = texturaHolograma('escudo');
    const escudo = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ map: escudoT, color: new THREE.Color('#7ff6ff').multiplyScalar(2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    escudo.position.y = 0;
    holo.add(globo, alambre, anillo1, anillo2, escudo);
    p.grupo.add(holo);
    p.holos.push(globo, alambre, anillo1, anillo2, escudo);
    p.animables.push(t => {
      globo.rotation.y = t * 0.4; alambre.rotation.y = -t * 0.25;
      anillo1.rotation.z = t * 0.8; anillo2.rotation.z = -t * 0.6;
      escudo.rotation.y = t * 0.9;
      holo.position.y = b + 23.5 + Math.sin(t * 1.3) * 0.4;
      mGlobo.uniforms.uT.value = t;
    });
    // pantallas holográficas laterales
    const tDatos = texturaHolograma('datos'), tMapa = texturaHolograma('mapa');
    [[-7, tDatos], [7, tMapa]].forEach(([dx, tx], k) => {
      const pan = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.6), new THREE.MeshBasicMaterial({ map: tx, color: new THREE.Color('#5ff3ff').multiplyScalar(1.8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      pan.position.set(cx + dx, b + 3.2, z1 + 6.5);
      p.grupo.add(pan); p.holos.push(pan);
      p.animables.push(t => { pan.position.y = b + 3.2 + Math.sin(t * 1.7 + k) * 0.15; });
    });
    // plaza frontal con astas y bolardos
    p.m('anden').caja(cx, b, z1 + 6, 24, 0.05, 9, '#c7d3df', { escala: 2 });
    for (const dx of [-9, -7.5, 7.5, 9]) {
      met.caja(cx + dx, b, z1 + 8.5, 0.12, 9, 0.12, '#dfe3e8');
      sol.caja(cx + dx + 0.75, b + 7.6, z1 + 8.5, 1.5, 1.0, 0.05, dx < 0 ? '#1d4e89' : '#f2c230');
    }
    for (let x = -10; x <= 10; x += 2.5) if (Math.abs(x) > 3) lu.geo(new THREE.CylinderGeometry(0.12, 0.14, 0.9, 8).translate(cx + x, b + 0.45, z1 + 10.6), null, new THREE.Color('#5ff3ff').multiplyScalar(1.6));
    letreros.push({ clave: 'ciberpolicia', x: cx, y: b + 9.3, z: z1 + 0.7, rot: 0, alto: 1.6 });
    reg('central', 'central', 'Central de Ciberpolicía', p, { entrada: entradaSur(cx, 2), color: '#3aa0ff', posicion: v3(cx, 0, cz) });
  }

  // ======================= LABORATORIO FORENSE =======================
  {
    const p = new Pieza(M, az, global);
    const r = rectManzana(3, 3);
    const cx = r.cx, cz = r.cz + 1;
    const sol = p.m('solido'), lu = p.m('luces'), met = p.m('metal'), vid = p.m('vidrio');
    const b = ALTO_ANDEN;
    const W = 24, D = 18, H = 8.5;
    sol.caja(cx, b, cz, W, H, D, '#dcd9d2');
    // franja de vidrio continua
    const x0 = cx - W / 2, x1 = cx + W / 2, z0 = cz - D / 2, z1 = cz + D / 2;
    const yv0 = b + 2.5, yv1 = b + 6.6;
    const uv = (a, c) => [a / 24, 0.2, c / 24, 0.35];
    vid.quad([x0, yv0, z1 + 0.05], [x1, yv0, z1 + 0.05], [x1, yv1, z1 + 0.05], [x0, yv1, z1 + 0.05], uv(0, W), '#bfefff');
    vid.quad([x1 + 0.05, yv0, z1], [x1 + 0.05, yv0, z0], [x1 + 0.05, yv1, z0], [x1 + 0.05, yv1, z1], uv(0, D), '#bfefff');
    vid.quad([x0 - 0.05, yv0, z0], [x0 - 0.05, yv0, z1], [x0 - 0.05, yv1, z1], [x0 - 0.05, yv1, z0], uv(0, D), '#bfefff');
    lu.caja(cx, b + 0.6, z1 + 0.1, W, 0.1, 0.1, new THREE.Color('#7fffd4').multiplyScalar(2.5));
    lu.caja(cx, b + H - 0.3, z1 + 0.1, W, 0.1, 0.1, new THREE.Color('#7fffd4').multiplyScalar(2.5));
    // domo geodésico
    const domo = new THREE.SphereGeometry(7.2, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2).translate(cx - 3, b + H, cz - 1);
    p.agregarMalla(domo, new THREE.MeshStandardMaterial({ color: 0xe8f4ff, roughness: 0.15, metalness: 0.85, envMapIntensity: 1.6 }));
    // nervaduras estructurales sólidas: 12 meridianos y 4 paralelos de 0.08 m (sin alambres)
    {
      const cxD = cx - 3, czD = cz - 1, yD = b + H, rr = 7.3, colN = '#9fb4c4';
      for (let k = 0; k < 12; k++) sol.geo(new THREE.TorusGeometry(rr, 0.08, 5, 28, Math.PI).rotateY(k * Math.PI / 12 * 2).translate(cxD, yD, czD), null, colN);
      for (const el of [0.35, 0.7, 1.0, 1.28]) sol.geo(new THREE.TorusGeometry(rr * Math.cos(el), 0.08, 5, 56).rotateX(Math.PI / 2).translate(cxD, yD + rr * Math.sin(el), czD), null, colN);
    }
    // ranura del observatorio: un gajo delgado que sigue la curva del domo
    sol.geo(new THREE.SphereGeometry(7.26, 6, 12, -0.07, 0.14, 0, Math.PI / 2).translate(cx - 3, b + H, cz - 1), null, '#1b2430');
    // anillo base del domo
    sol.geo(new THREE.CylinderGeometry(7.6, 7.8, 0.8, 40).translate(cx - 3, b + H + 0.4, cz - 1), null, '#cfd6dd');
    lu.geo(new THREE.TorusGeometry(7.7, 0.08, 6, 64).rotateX(Math.PI / 2).translate(cx - 3, b + H + 0.85, cz - 1), null, new THREE.Color('#7fffd4').multiplyScalar(3));
    // chimeneas de extracción y equipos
    for (const dx of [7, 9.5]) { met.geo(new THREE.CylinderGeometry(0.5, 0.6, 4, 12).translate(cx + dx, b + H + 2, cz - 5), null, '#b9c0c8'); }
    global.inst.ac.push({ x: cx + 8, y: b + H, z: cz + 3, rot: 0, esc: 1.6 }, { x: cx + 5, y: b + H, z: cz + 5.5, rot: 0, esc: 1.6 });
    global.inst.solar.push({ x: cx + 7, y: b + H + 0.3, z: cz + 1, rot: 0, esc: 1.2 });
    rellenarAzotea(p.ctx, cx + 4.5, cx + W / 2 - 0.8, cz - D / 2 + 0.8, cz + D / 2 - 0.8, b + H, { densidad: 1.6, escalera: false });
    rellenarAzotea(p.ctx, cx - W / 2 + 0.8, cx - 11, cz - D / 2 + 0.8, cz + D / 2 - 0.8, b + H, { densidad: 0.8, escalera: true });
    pretilConMoldura(p.ctx, cx, cz, W, D, b + H, '#c9c4b8');
    global.inst.tanque.push({ x: cx + 9.5, y: b + H, z: cz + 6.5, esc: 1.4 }, { x: cx + 7.2, y: b + H, z: cz - 7, esc: 1.2 });
    // acceso
    sol.caja(cx + 4, b + 3.4, z1 + 2, 8, 0.3, 4, '#2a3340');
    p.agregarMalla(new THREE.BoxGeometry(5, 3.2, 0.2).translate(cx + 4, b + 1.6, z1 + 0.1), M.cristal);
    letreros.push({ clave: 'lab', x: cx - 4, y: b + 7.6, z: z1 + 0.2, rot: 0, alto: 1.2 });
    reg('laboratorio', 'laboratorio', 'Laboratorio Forense', p, { entrada: entradaSur(cx + 4, 3), color: '#7fffd4', posicion: v3(cx, 0, cz) });
  }

  // ======================= BANCO DEL PUERTO =======================
  {
    const p = new Pieza(M, az, global);
    const r = rectManzana(1, 1);
    const cx = r.cx, b = ALTO_ANDEN;
    const sol = p.m('solido'), fach = p.m('fachada');
    const W = 21, D = 12, zf = r.iz1 - 2.2, H = 10.5;
    const z0 = zf - D;
    // basamento y escalinata
    sol.caja(cx, b, zf - D / 2, W + 1, 1.2, D + 1, '#e9e1cf');
    for (let k = 0; k < 4; k++) sol.caja(cx, b, zf + 1.6 - k * 0.4, 14 - k * 0.4, 0.3 * (k + 1), 0.8, '#efe8d8');
    // cuerpo con fachada colonial clara
    casa(p.ctx, { O: [cx - W / 2, zf - 2.6], t: [1, 0], n: [0, 1], ancho: W, fondo: D - 2.6, pisos: 2, estilo: 'colonial', color: '#f3e3b8', techo: 'plano', base: b + 1.2, probBalcon: 0, probFlores: 0, altoPiso: H / 2, tanque: false });
    // pórtico con seis columnas, entablamento y frontón
    const yC = b + 1.2;
    for (let k = 0; k < 6; k++) {
      const x = cx - 7.5 + k * 3;
      sol.geo(new THREE.CylinderGeometry(0.5, 0.58, 8.2, 16).translate(x, yC + 4.1 + 0.4, zf - 0.6), null, '#f7f2e6');
      sol.caja(x, yC, zf - 0.6, 1.4, 0.4, 1.4, '#e6dcc6');
      sol.caja(x, yC + 8.6, zf - 0.6, 1.3, 0.4, 1.3, '#e6dcc6');
    }
    sol.caja(cx, yC + 9.0, zf - 1.3, 18, 1.2, 3.0, '#f1ead9');
    sol.caja(cx, yC + 10.2, zf - 1.3, 18.6, 0.3, 3.2, '#e2d6bd');
    const fr = new THREE.Shape(); fr.moveTo(-9.3, 0); fr.lineTo(9.3, 0); fr.lineTo(0, 3); fr.lineTo(-9.3, 0);
    const gF = new THREE.ExtrudeGeometry(fr, { depth: 3.0, bevelEnabled: false });
    sol.geo(gF, matriz(cx, yC + 10.5, zf - 2.8, 0), '#f4eee0');
    // puerta de bronce
    sol.caja(cx, yC, zf - 2.55, 3, 5, 0.12, '#6b4a1f');
    letreros.push({ clave: 'banco', x: cx, y: yC + 9.6, z: zf + 0.3, rot: 0, alto: 0.9 });
    // casas coloniales al norte de la manzana (dentro de la muralla)
    const zN = MURALLA.z0 + MURALLA.grosor / 2 + 0.5;
    hilera(globalCtx(), [r.ix1, z0 - 1.5], [r.ix1, zN], [1, 0], { fondo: 8 });
    hilera(globalCtx(), [r.ix0, zN], [r.ix0, z0 - 1.5], [-1, 0], { fondo: 8 });
    reg('banco', 'banco', 'Banco del Puerto', p, { entrada: entradaSur(cx, 1), color: '#f2c230', posicion: v3(cx, 0, zf - D / 2) });
  }

  // ======================= ALCALDÍA DE PUERTO NEXO =======================
  {
    const p = new Pieza(M, az, global);
    const r = rectManzana(1, 2);
    const cx = r.cx, b = ALTO_ANDEN;
    const sol = p.m('solido');
    const zf = r.iz0 + 13.5, W = r.ix1 - r.ix0;
    // cuerpo colonial de dos pisos (fachada al sur hacia la plaza)
    casa(p.ctx, { O: [r.ix0, zf], t: [1, 0], n: [0, 1], ancho: W, fondo: 13, pisos: 2, estilo: 'colonial', color: '#f6f0e1', techo: 'teja', probBalcon: 0.9, probFlores: 0.6, pendiente: 0.2 });
    // portales (arcada) en planta baja
    const nA = 9, paso = W / nA;
    for (let k = 0; k <= nA; k++) sol.caja(r.ix0 + k * paso, b, zf + 2.4, 0.7, 4.0, 0.7, '#f3ecdc');
    sol.caja(cx, b + 4.0, zf + 1.2, W + 0.6, 0.9, 3.1, '#efe6d2');
    for (let k = 0; k < nA; k++) {
      const arc = new THREE.TorusGeometry(paso / 2 - 0.35, 0.18, 4, 12, Math.PI).translate(r.ix0 + (k + 0.5) * paso, b + 3.0, zf + 2.6);
      sol.geo(arc, null, '#e6dcc6');
    }
    // torre del reloj
    const tx = cx, tz = zf - 2.5, hT = 25;
    sol.caja(tx, b, tz, 5.6, hT - 6, 5.6, '#f2e4c2');
    sol.caja(tx, b + hT - 6, tz, 6.2, 0.6, 6.2, '#e6d6b0');
    // campanario con arcos
    for (const [dx, dz] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) sol.caja(tx + dx, b + hT - 5.4, tz + dz, 1, 3.6, 1, '#f2e4c2');
    sol.caja(tx, b + hT - 1.8, tz, 5.8, 0.7, 5.8, '#e6d6b0');
    sol.geo(new THREE.SphereGeometry(2.6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2).translate(tx, b + hT - 1.1, tz), null, '#d98c3f');
    sol.geo(new THREE.CylinderGeometry(0.15, 0.15, 3, 6).translate(tx, b + hT + 2.6, tz), null, '#3a3a3a');
    sol.caja(tx + 0.85, b + hT + 3.0, tz, 1.6, 1, 0.05, '#2b9348');
    // campana
    sol.geo(new THREE.CylinderGeometry(0.4, 0.9, 1.2, 12).translate(tx, b + hT - 4.6, tz), null, '#8a6a2a');
    // esferas del reloj (4 caras) y manecillas animadas
    const tr = texturaReloj();
    const mR = new THREE.MeshStandardMaterial({ map: tr, roughness: 0.6, emissive: 0xffe2a8, emissiveMap: tr, emissiveIntensity: 0.6 });
    const agujas = [];
    for (let k = 0; k < 4; k++) {
      const ang = k * Math.PI / 2;
      const g = new THREE.Group();
      g.position.set(tx, b + hT - 9, tz); g.rotation.y = ang;
      const cara = new THREE.Mesh(new THREE.CircleGeometry(1.9, 32), mR);
      cara.position.z = 2.85; g.add(cara);
      const hora = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.0, 0.05).translate(0, 0.45, 0), new THREE.MeshStandardMaterial({ color: 0x1a140c }));
      const min = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.05).translate(0, 0.7, 0), hora.material);
      hora.position.z = 2.9; min.position.z = 2.93;
      g.add(hora, min); agujas.push([hora, min]);
      p.grupo.add(g);
    }
    p.animables.push(() => {
      const d = new Date();
      const h = (d.getHours() % 12 + d.getMinutes() / 60) / 12 * Math.PI * 2, mi = (d.getMinutes() + d.getSeconds() / 60) / 60 * Math.PI * 2;
      for (const [a, c] of agujas) { a.rotation.z = -h; c.rotation.z = -mi; }
    });
    // plaza: piso, fuente, árboles y bancas
    const pz0 = zf + 3.2, pz1 = r.iz1;
    p.m('adoquin').caja(cx, b, (pz0 + pz1) / 2, W, 0.04, pz1 - pz0, '#f4ead8', { escala: 4 });
    const fz = (pz0 + pz1) / 2 + 0.5;
    sol.geo(new THREE.CylinderGeometry(3.2, 3.4, 0.7, 24).translate(cx, b + 0.35, fz), null, '#e9dfcb');
    p.agregarMalla(new THREE.CylinderGeometry(2.9, 2.9, 0.1, 24).translate(cx, b + 0.62, fz), new THREE.MeshStandardMaterial({ color: 0x3fb5c0, roughness: 0.05, metalness: 0.3 }));
    sol.geo(new THREE.CylinderGeometry(0.35, 0.5, 2.2, 12).translate(cx, b + 1.4, fz), null, '#e9dfcb');
    sol.geo(new THREE.CylinderGeometry(1.1, 0.4, 0.4, 16).translate(cx, b + 2.4, fz), null, '#e9dfcb');
    const chorro = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 16, 1, true).translate(0, 0.8, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bff6ff').multiplyScalar(1.2), transparent: true, opacity: 0.5, depthWrite: false }));
    chorro.position.set(cx, b + 2.5, fz); p.grupo.add(chorro);
    p.animables.push(t => { chorro.scale.y = 1 + Math.sin(t * 6) * 0.08; });
    for (const [dx, dz] of [[-9, -2], [9, -2], [-9, 4], [9, 4]]) global.inst.arbol.push({ x: cx + dx, y: b, z: fz + dz, esc: 1.15, tipo: 1 });
    for (const [dx, dz, ry] of [[-5, -3, 0], [5, -3, 0], [-5, 4, Math.PI], [5, 4, Math.PI]]) global.inst.banca.push({ x: cx + dx, y: b, z: fz + dz, rot: ry });
    for (const dx of [-11.5, 11.5]) for (const dz of [-3, 3]) global.inst.farolColonial.push({ x: cx + dx, y: b, z: fz + dz });
    letreros.push({ clave: 'alcaldia', x: cx - 7, y: b + 5.0, z: zf + 2.75, rot: 0, alto: 0.7 });
    reg('alcaldia', 'alcaldia', 'Alcaldía de Puerto Nexo', p, { entrada: entradaSur(cx, 2), color: '#f6f0e1', posicion: v3(cx, 0, zf - 4) });
  }

  // ======================= COLEGIO LA MURALLA =======================
  {
    const p = new Pieza(M, az, global);
    const r = rectManzana(1, 4);
    const b = ALTO_ANDEN;
    const sol = p.m('solido'), met = p.m('metal');
    // ala norte (3 pisos) mirando al sur, ala oeste (2 pisos) mirando al este
    casa(p.ctx, { O: [r.ix0, r.iz0 + 9.5], t: [1, 0], n: [0, 1], ancho: r.ix1 - r.ix0, fondo: 9.5, pisos: 3, estilo: 'moderno', color: '#f6d55c', techo: 'plano', tanque: false });
    casa(p.ctx, { O: [r.ix0 + 9, r.iz1 - 2], t: [0, -1], n: [1, 0], ancho: r.iz1 - 2 - (r.iz0 + 9.5), fondo: 9, pisos: 2, estilo: 'moderno', color: '#f6d55c', techo: 'plano', tanque: false });
    // franjas azules
    sol.caja((r.ix0 + r.ix1) / 2, b + 3.1, r.iz0 + 9.6, r.ix1 - r.ix0, 0.35, 0.25, '#2d6fb7');
    sol.caja((r.ix0 + r.ix1) / 2, b + 6.3, r.iz0 + 9.6, r.ix1 - r.ix0, 0.35, 0.25, '#2d6fb7');
    // cancha múltiple
    const cx0 = r.ix0 + 11, cx1 = r.ix1 - 0.5, cz0 = r.iz0 + 12, cz1 = r.iz1 - 1;
    const ccx = (cx0 + cx1) / 2, ccz = (cz0 + cz1) / 2;
    const cancha = new THREE.Mesh(new THREE.PlaneGeometry(cx1 - cx0, cz1 - cz0).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: texturaCancha(), roughness: 0.8 }));
    cancha.position.set(ccx, b + 0.03, ccz); cancha.receiveShadow = true; p.grupo.add(cancha);
    // aros y arcos
    for (const s of [-1, 1]) {
      const x = ccx + s * ((cx1 - cx0) / 2 - 1.2);
      met.caja(x, b, ccz, 0.2, 3.4, 0.2, '#e8e8e8');
      sol.caja(x - s * 0.3, b + 3.0, ccz, 0.1, 1.1, 1.8, '#ffffff');
      sol.geo(new THREE.TorusGeometry(0.25, 0.03, 4, 12).rotateX(Math.PI / 2).translate(x - s * 0.65, b + 3.05, ccz), null, '#ff6a2a');
    }
    // malla perimetral
    for (let x = cx0; x <= cx1 + 0.01; x += 2.4) { met.caja(x, b, cz1 + 0.6, 0.06, 2.4, 0.06, '#9aa3ad'); }
    p.agregarMalla(new THREE.PlaneGeometry(cx1 - cx0, 2.4).translate(ccx, b + 1.2, cz1 + 0.6), new THREE.MeshStandardMaterial({ color: 0x9aa3ad, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), { sombra: false });
    // asta con bandera y árboles
    met.caja(r.ix0 + 4, b, r.iz1 - 1, 0.12, 8, 0.12, '#dfe3e8');
    sol.caja(r.ix0 + 4.8, b + 6.6, r.iz1 - 1, 1.6, 1.0, 0.05, '#2d6fb7');
    global.inst.arbol.push({ x: r.ix0 + 4, y: b, z: r.iz0 + 14, esc: 1.0, tipo: 0 });
    letreros.push({ clave: 'colegio', x: (r.ix0 + r.ix1) / 2 + 3, y: b + 8.9, z: r.iz0 + 9.65, rot: 0, alto: 1.0 });
    reg('colegio', 'colegio', 'Colegio La Muralla', p, { entrada: entradaSur(ccx - 4, 4), color: '#f6d55c', posicion: v3(r.cx, 0, r.cz) });
  }

  // ======================= CIBERCAFÉ PIXEL =======================
  {
    const p = new Pieza(M, az, global);
    const r = rectManzana(2, 4);
    const b = ALTO_ANDEN;
    const sol = p.m('solido'), lu = p.m('luces');
    const x0 = r.ix1 - 13, x1 = r.ix1, z0 = r.iz1 - 12, z1 = r.iz1;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 7.6;
    sol.caja(cx, b, cz, x1 - x0, H, z1 - z0, '#23232e');
    sol.caja(cx, b + H, cz, x1 - x0 + 0.4, 0.6, z1 - z0 + 0.4, '#15151c');
    // vitrina con pantallas encendidas
    p.agregarMalla(new THREE.BoxGeometry(x1 - x0 - 2, 3.0, 0.1).translate(cx, b + 1.7, z1 + 0.06), M.cristal);
    const pant = new THREE.MeshBasicMaterial({ vertexColors: true });
    const mp = new Malla();
    for (let k = 0; k < 6; k++) {
      const c = new THREE.Color(k % 2 ? '#7b5cff' : '#28e0ff').multiplyScalar(1.8);
      mp.caja(x0 + 1.8 + k * 1.75, b + 1.1, z1 - 0.6, 1.2, 0.8, 0.05, c);
      mp.caja(x1 - 0.7, b + 1.1, z0 + 1.8 + k * 1.5, 0.05, 0.8, 1.0, c);
    }
    mp.malla(pant, p.grupo, { sombra: false });
    p.agregarMalla(new THREE.BoxGeometry(0.1, 3.0, z1 - z0 - 2).translate(x1 + 0.06, b + 1.7, cz), M.cristal);
    // tiras de neón RGB en aristas
    const mag = new THREE.Color('#ff2bd6').multiplyScalar(3.2), cian = new THREE.Color('#2bf3ff').multiplyScalar(3.2);
    lu.caja(cx, b + H + 0.62, z1 + 0.22, x1 - x0 + 0.4, 0.12, 0.12, mag);
    lu.caja(x1 + 0.22, b + H + 0.62, cz, 0.12, 0.12, z1 - z0 + 0.4, cian);
    lu.caja(x1 + 0.15, b, z1 + 0.15, 0.14, H + 0.6, 0.14, cian);
    lu.caja(x0, b + 3.3, z1 + 0.15, 0.12, 0.12, 0.1, mag);
    lu.caja(cx, b + 3.35, z1 + 0.16, x1 - x0, 0.1, 0.1, cian);
    // control de videojuego pixelado en la fachada lateral
    const px = [[0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [3, 1], [3, 2], [4, 1], [4, 2], [5, 0], [5, 1], [5, 2], [5, 3], [6, 1], [6, 2]];
    for (const [i, j] of px) lu.caja(x1 + 0.2, b + 4.4 + j * 0.42, z0 + 2.2 + i * 0.42, 0.06, 0.38, 0.38, (i + j) % 3 ? mag : cian);
    // antena wifi y ac
    global.inst.ac.push({ x: cx - 3, y: b + H + 0.6, z: cz, rot: 0, esc: 1.3 });
    global.inst.antena.push({ x: cx + 3, y: b + H + 0.6, z: cz - 2, alto: 5 });
    letreros.push({ clave: 'pixel', x: cx - 0.5, y: b + 5.6, z: z1 + 0.25, rot: 0, alto: 1.5 });
    letreros.push({ clave: 'gamer', x: x1 + 0.3, y: b + 2.6, z: cz - 3.5, rot: Math.PI / 2, alto: 0.7 });
    // resto de la manzana: viviendas
    perimetroParcial(globalCtx(), r, x0, z0);
    reg('cibercafe', 'cibercafe', 'Cibercafé Pixel', p, { entrada: entradaSur(cx, 4), color: '#ff2bd6', posicion: v3(cx, 0, cz) });
  }

  // ======================= CAFÉ DEL MALECÓN =======================
  {
    const p = new Pieza(M, az, global);
    const b = 0.35;
    const sol = p.m('solido'), lu = p.m('luces');
    const cz = -10, xK0 = -127.5, xK1 = -120.5;
    // quiosco blanco con remates turquesa
    sol.caja((xK0 + xK1) / 2, b, cz, xK1 - xK0, 3.6, 9, '#fbf7ef');
    sol.caja((xK0 + xK1) / 2, b + 3.6, cz, xK1 - xK0 + 1.2, 0.35, 10.2, '#2a9d8f');
    p.agregarMalla(new THREE.BoxGeometry(0.1, 2.0, 6).translate(xK1 + 0.06, b + 1.6, cz), M.cristal);
    p.m('tejas').geo(new THREE.ConeGeometry(7.2, 2.4, 4, 1).rotateY(Math.PI / 4).scale(0.75, 1, 1.05).translate((xK0 + xK1) / 2, b + 5.15, cz), null, '#ffffff', { escalaUV: 3 });
    // terraza de madera sobre la playa
    const tx0 = -141, tx1 = -127.5;
    sol.caja((tx0 + tx1) / 2, b - 0.25, cz, tx1 - tx0, 0.25, 15, '#a0754a');
    for (let x = tx0 + 0.5; x < tx1; x += 3) for (const dz of [-7, 7]) sol.caja(x, -1.6, cz + dz, 0.3, 2.0, 0.3, '#6b4a2b');
    for (let x = tx0; x <= tx1; x += 1.6) { sol.caja(x, b, cz - 7.4, 0.08, 1, 0.08, '#e9e3d6'); sol.caja(x, b, cz + 7.4, 0.08, 1, 0.08, '#e9e3d6'); }
    sol.caja((tx0 + tx1) / 2, b + 0.95, cz - 7.4, tx1 - tx0, 0.08, 0.12, '#e9e3d6');
    sol.caja((tx0 + tx1) / 2, b + 0.95, cz + 7.4, tx1 - tx0, 0.08, 0.12, '#e9e3d6');
    // sombrillas, mesas y sillas
    const colores = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#f28482', '#48cae4'];
    let k = 0;
    for (let x = tx0 + 2.5; x < tx1 - 1; x += 4.4) for (const dz of [-3.8, 1.2, 5.2]) {
      global.inst.sombrilla.push({ x, y: b, z: cz + dz - 1, color: colores[k++ % colores.length] });
      sol.geo(new THREE.CylinderGeometry(0.6, 0.6, 0.06, 14).translate(x + 0.6, b + 0.75, cz + dz - 1), null, '#f4f1ea');
      sol.caja(x + 0.6, b, cz + dz - 1, 0.12, 0.75, 0.12, '#444');
      for (const [ox, oz] of [[1.4, 0], [-0.2, 0], [0.6, 0.8], [0.6, -0.8]]) sol.caja(x + ox, b, cz + dz - 1 + oz, 0.45, 0.45, 0.45, '#d8c3a5');
    }
    // guirnalda de bombillos
    const mp = new Malla();
    for (const dz of [-6.8, 6.8]) for (let x = tx0; x <= tx1; x += 0.9) {
      const caida = Math.sin((x - tx0) / (tx1 - tx0) * Math.PI * 3) * 0.25;
      mp.geo(new THREE.SphereGeometry(0.09, 6, 4).translate(x, b + 3.0 - Math.abs(caida), cz + dz), null, new THREE.Color('#ffd27f').multiplyScalar(4));
    }
    for (const x of [tx0, tx1]) for (const dz of [-6.8, 6.8]) sol.caja(x, b, cz + dz, 0.12, 3.1, 0.12, '#5a4632');
    mp.malla(M.luces, p.grupo, { sombra: false });
    letreros.push({ clave: 'cafe', x: xK1 + 0.15, y: b + 2.95, z: cz, rot: Math.PI / 2, alto: 0.9 });
    letreros.push({ clave: 'wifi', x: xK1 + 0.15, y: b + 4.8, z: cz + 3.2, rot: Math.PI / 2, alto: 0.9 });
    reg('cafe-malecon', 'cafe', 'Café del Malecón', p, { entrada: v3(-118.6, 0.35, cz), color: '#2a9d8f', posicion: v3(-129, 0, cz) });
  }

  // ======================= TECNOSTORE =======================
  {
    const p = new Pieza(M, az, global);
    const r = rectManzana(4, 2);
    const b = ALTO_ANDEN;
    const sol = p.m('solido'), lu = p.m('luces');
    const cx = r.cx, x0 = cx - 10, x1 = cx + 10, z1 = r.iz1, z0 = z1 - 11, H = 9;
    sol.caja(cx, b, (z0 + z1) / 2, 20, H, 11, '#dedbd4');
    sol.caja(cx, b + H - 1.6, z1 + 0.4, 20.6, 1.6, 0.8, '#f7f8fa');
    // gran vitrina
    p.agregarMalla(new THREE.BoxGeometry(18, 6.6, 0.12).translate(cx, b + 3.5, z1 + 0.05), M.cristal);
    const mp = new Malla();
    for (let k = 0; k < 5; k++) {
      const x = x0 + 2.8 + k * 3.6;
      mp.caja(x, b, z1 - 1.5, 2.2, 1.0, 1.0, '#f0f0f0');
      mp.caja(x, b + 1.0, z1 - 1.5, 0.5, 0.95, 0.06, new THREE.Color('#9ad7ff').multiplyScalar(2.2));
      mp.caja(x + 0.7, b + 1.0, z1 - 1.5, 0.45, 0.85, 0.06, new THREE.Color('#ffb4f0').multiplyScalar(2.0));
    }
    mp.caja(cx, b + 6.9, z1 - 0.4, 18, 0.12, 0.12, new THREE.Color('#ffffff').multiplyScalar(2.5));
    mp.malla(M.luces, p.grupo, { sombra: false });
    lu.caja(cx, b + H + 0.02, z1 + 0.82, 20.6, 0.12, 0.1, new THREE.Color('#2bf3ff').multiplyScalar(3));
    // teléfono holográfico gigante en la azotea
    const tel = new THREE.Group();
    const marcoT = new THREE.Mesh(new THREE.BoxGeometry(3.2, 6.2, 0.3), materialHolo('#2bf3ff', { intensidad: 1.3, base: 0.3 }));
    const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 5.4), new THREE.MeshBasicMaterial({ map: texturaHolograma('datos'), color: new THREE.Color('#9af7ff').multiplyScalar(1.8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    pantalla.position.z = 0.2;
    tel.add(marcoT, pantalla);
    tel.position.set(cx + 5, b + H + 4.4, (z0 + z1) / 2);
    p.grupo.add(tel); p.holos.push(marcoT, pantalla);
    p.animables.push(t => { tel.rotation.y = Math.sin(t * 0.6) * 0.6; tel.position.y = b + H + 4.4 + Math.sin(t * 1.4) * 0.25; marcoT.material.uniforms.uT.value = t; });
    sol.caja(cx + 5, b + H, (z0 + z1) / 2, 2, 0.4, 2, '#2a2f38');
    rellenarAzotea(p.ctx, x0 + 0.8, cx + 3, z0 + 0.8, z1 - 1.2, b + H, { densidad: 1.5, escalera: true });
    rellenarAzotea(p.ctx, cx + 7, x1 - 0.8, z0 + 0.8, z1 - 1.2, b + H, { densidad: 0.7, escalera: false });
    pretilConMoldura(p.ctx, cx, (z0 + z1) / 2, 20, 11, b + H, '#cfcac0', 's');
    letreros.push({ clave: 'tecnostore', x: cx - 1, y: b + H - 0.8, z: z1 + 0.85, rot: 0, alto: 1.3 });
    // torre detrás (decorativa)
    torre(globalCtx(), { cx, cz: r.iz0 + 7, ancho: 16, fondo: 11, alto: 22, estilo: 'vidrio', color: '#cfe8ff', podio: false });
    reg('tecnostore', 'tienda', 'TecnoStore', p, { entrada: entradaSur(cx, 2), color: '#2bf3ff', posicion: v3(cx, 0, (z0 + z1) / 2) });
  }

  // ======================= TORRE DE TELECOMUNICACIONES =======================
  {
    const p = new Pieza(M, az, global);
    const r = rectManzana(4, 1);
    const b = ALTO_ANDEN, cx = r.cx, cz = r.cz;
    const sol = p.m('solido'), met = p.m('metal'), lu = p.m('luces'), vid = p.m('vidrio');
    // basamento
    sol.caja(cx, b, cz, 20, 7, 20, '#e4e7eb');
    const uvb = (a, c) => [a / 24, 0.1, c / 24, 0.35];
    vid.quad([cx - 10, b + 1, cz + 10.05], [cx + 10, b + 1, cz + 10.05], [cx + 10, b + 6, cz + 10.05], [cx - 10, b + 6, cz + 10.05], uvb(0, 20), '#d9f0ff');
    vid.quad([cx + 10.05, b + 1, cz + 10], [cx + 10.05, b + 1, cz - 10], [cx + 10.05, b + 6, cz - 10], [cx + 10.05, b + 6, cz + 10], uvb(0, 20), '#d9f0ff');
    // fuste cónico
    sol.geo(new THREE.CylinderGeometry(2.6, 3.8, 72, 24).translate(cx, b + 7 + 36, cz), null, '#c9cdd2');
    for (let k = 0; k < 14; k++) {
      const y = 9 + k * 4.4, f = (y - 7) / 72, rr = 3.8 - 1.2 * f;
      sol.geo(new THREE.CylinderGeometry(rr * 0.99 + 0.04, rr + 0.05, 1.7, 24).translate(cx, b + y + 1.0, cz), null, '#3b4a5c');
      sol.geo(new THREE.CylinderGeometry(rr + 0.45, rr + 0.45, 0.22, 24).translate(cx, b + y + 2.05, cz), null, '#8f98a3');
      if (k % 3 === 1) lu.geo(new THREE.CylinderGeometry(rr * 0.99 + 0.07, rr + 0.08, 0.9, 24).translate(cx, b + y + 1.0, cz), null, new THREE.Color('#ffd9a0').multiplyScalar(1.4));
    }
    // franjas rojas y blancas en la parte alta (balizaje)
    for (let k = 0; k < 4; k++) sol.geo(new THREE.CylinderGeometry(2.72 - k * 0.0, 2.75, 2.2, 24).translate(cx, b + 62 + k * 4.4, cz), null, k % 2 ? '#d9dcdf' : '#b8322b');
    // cápsulas con anillos de luz
    for (const [y, rr] of [[b + 50, 7.5], [b + 66, 6]]) {
      sol.geo(new THREE.CylinderGeometry(rr, rr * 0.75, 2.5, 32).translate(cx, y, cz), null, '#b7bcc3');
      p.agregarMalla(new THREE.CylinderGeometry(rr * 1.01, rr * 1.01, 1.4, 32, 1, true).translate(cx, y + 2.0, cz), M.cristal);
      sol.geo(new THREE.CylinderGeometry(rr * 0.8, rr, 1.0, 32).translate(cx, y + 3.2, cz), null, '#b7bcc3');
      lu.geo(new THREE.TorusGeometry(rr * 1.02, 0.12, 6, 64).rotateX(Math.PI / 2).translate(cx, y + 1.25, cz), null, new THREE.Color('#5ff3ff').multiplyScalar(3.2));
      lu.geo(new THREE.TorusGeometry(rr * 1.02, 0.1, 6, 64).rotateX(Math.PI / 2).translate(cx, y + 2.75, cz), null, new THREE.Color('#ffffff').multiplyScalar(1.2));
    }
    // antenas sectoriales y parabólicas
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2;
      met.cajaRot(cx + Math.cos(a) * 3.2, b + 74, cz + Math.sin(a) * 3.2, 0.5, 2.6, 0.25, -a, '#f2f2f2');
    }
    for (let k = 0; k < 3; k++) {
      const a = k / 3 * Math.PI * 2 + 0.5;
      met.geo(new THREE.SphereGeometry(1.2, 16, 6, 0, Math.PI * 2, 0, Math.PI / 3).rotateX(-Math.PI / 2), matriz(cx + Math.cos(a) * 3.0, b + 58, cz + Math.sin(a) * 3.0, -a + Math.PI / 2), '#f2f2f2');
    }
    // mástil
    met.geo(new THREE.CylinderGeometry(0.25, 0.6, 24, 8).translate(cx, b + 79 + 12, cz), null, '#d0d4da');
    for (const y of [b + 72, b + 86, b + 103]) global.inst.luzRoja.push({ x: cx, y, z: cz + (y > b + 100 ? 0 : 2.7) });
    global.inst.luzRoja.push({ x: cx + 2.7, y: b + 72, z: cz }, { x: cx - 2.7, y: b + 72, z: cz });
    // anillo de energía animado
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.1, 6, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color('#5ff3ff').multiplyScalar(3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    anillo.rotation.x = Math.PI / 2; p.grupo.add(anillo); p.holos.push(anillo);
    p.animables.push(t => {
      const f = (t * 0.25) % 1;
      anillo.position.set(cx, b + 8 + f * 70, cz);
      const s = 1 - f * 0.3; anillo.scale.set(s, s, s);
      anillo.material.opacity = Math.sin(f * Math.PI);
    });
    letreros.push({ clave: 'nexo', x: cx, y: b + 5.4, z: cz + 10.1, rot: 0, alto: 1.1 });
    reg('torre-telecom', 'torre', 'Torre de Telecomunicaciones', p, { entrada: entradaSur(cx, 1), color: '#5ff3ff', posicion: v3(cx, 0, cz) });
  }

  // ======================= TERMINAL PORTUARIA =======================
  {
    const p = new Pieza(M, az, global);
    const b = 0.12;
    const sol = p.m('solido'), vid = p.m('vidrio'), lu = p.m('luces');
    const cx = 24, cz = -129, W = 22, D = 16, H = 12;
    sol.caja(cx, b, cz, W, H, D, '#e8edf2');
    const uv = (a, c) => [a / 24, 0, c / 24, 0.4];
    for (const y0 of [1.2, 5.2, 9.0]) {
      vid.quad([cx - W / 2, b + y0, cz + D / 2 + 0.05], [cx + W / 2, b + y0, cz + D / 2 + 0.05], [cx + W / 2, b + y0 + 2.4, cz + D / 2 + 0.05], [cx - W / 2, b + y0 + 2.4, cz + D / 2 + 0.05], uv(0, W), '#7fb7e6');
      vid.quad([cx + W / 2 + 0.05, b + y0, cz + D / 2], [cx + W / 2 + 0.05, b + y0, cz - D / 2], [cx + W / 2 + 0.05, b + y0 + 2.4, cz - D / 2], [cx + W / 2 + 0.05, b + y0 + 2.4, cz + D / 2], uv(0, D), '#7fb7e6');
    }
    sol.caja(cx, b + H, cz, W + 0.6, 0.6, D + 0.6, '#1f4e79');
    // torre de control con cabina
    const tx = cx + W / 2 - 3, tz = cz - D / 2 + 3;
    sol.caja(tx, b + H, tz, 4, 9, 4, '#e8edf2');
    p.agregarMalla(new THREE.CylinderGeometry(3.6, 3.0, 3.2, 8).translate(tx, b + H + 10.6, tz), M.cristal);
    sol.geo(new THREE.CylinderGeometry(4.0, 4.0, 0.5, 8).translate(tx, b + H + 12.4, tz), null, '#1f4e79');
    sol.geo(new THREE.CylinderGeometry(3.2, 3.2, 0.5, 8).translate(tx, b + H + 8.9, tz), null, '#1f4e79');
    lu.geo(new THREE.TorusGeometry(3.5, 0.08, 6, 32).rotateX(Math.PI / 2).translate(tx, b + H + 9.3, tz), null, new THREE.Color('#ffd27f').multiplyScalar(3));
    global.inst.antena.push({ x: tx, y: b + H + 12.6, z: tz, alto: 6 });
    letreros.push({ clave: 'terminal', x: cx - 2, y: b + 4.0, z: cz + D / 2 + 0.15, rot: 0, alto: 1.1 });
    reg('puerto', 'puerto', 'Terminal Portuaria', p, { entrada: v3(cx, ALTO_ANDEN, CALLES_Z[0] - OFF_ACERA), color: '#1f4e79', posicion: v3(cx, 0, cz) });
  }

  // ======================= VIVIENDAS DEL CATÁLOGO (casa-1 … casa-8) =======================
  const lotes = [[0, 4], [0, 5], [2, 5], [3, 4], [3, 5], [4, 5], [5, 4], [5, 5]];
  const estilos = [
    { estilo: 'colonial', color: '#3fa7a3', techo: 'teja', pisos: 2 },
    { estilo: 'moderno', color: '#ff8fab', techo: 'plano', pisos: 2 },
    { estilo: 'colonial', color: '#f4a261', techo: 'plano', pisos: 2 },
    { estilo: 'moderno', color: '#8ecae6', techo: 'plano', pisos: 3 },
    { estilo: 'moderno', color: '#b5e48c', techo: 'teja', pisos: 2 },
    { estilo: 'colonial', color: '#c77dff', techo: 'teja', pisos: 2 },
    { estilo: 'moderno', color: '#ffd166', techo: 'plano', pisos: 2 },
    { estilo: 'colonial', color: '#ef476f', techo: 'teja', pisos: 2 }
  ];
  lotes.forEach(([i, j], k) => {
    const id = `casa-${k + 1}`;
    const p = new Pieza(M, az, global);
    const r = rectManzana(i, j);
    const e = estilos[k];
    const W = 11, D = 10.5;
    const x0 = r.cx - W / 2;
    const zf = r.iz1 - 3.2; // antejardín de 3 m
    casa(p.ctx, { O: [x0, zf], t: [1, 0], n: [0, 1], ancho: W, fondo: D, pisos: e.pisos, estilo: e.estilo, color: e.color, techo: e.techo, probBalcon: 1, probFlores: 1 });
    const sol = p.m('solido');
    // antejardín con reja baja, puerta y matera
    const b = ALTO_ANDEN;
    p.m('cesped').caja(r.cx, b, zf + 1.6, W, 0.06, 3.0, '#ffffff', { escala: 4 });
    for (let x = x0; x <= x0 + W + 0.01; x += 0.5) if (Math.abs(x - r.cx) > 0.8) sol.caja(x, b, r.iz1 - 0.1, 0.06, 1.1, 0.06, '#2b2b2b');
    sol.caja(r.cx, b + 1.05, r.iz1 - 0.1, W, 0.08, 0.08, '#2b2b2b');
    sol.caja(r.cx, b, zf + 1.6, 1.4, 0.04, 3.0, '#d9cfc0');
    global.inst.flores.push({ x: x0 + 1.2, y: b + 0.1, z: zf + 1.6, rot: 0, esc: 1.1, tipo: 0 }, { x: x0 + W - 1.2, y: b + 0.1, z: zf + 1.6, rot: 1, esc: 1.0, tipo: 2 });
    if (k % 2 === 0) global.inst.arbol.push({ x: x0 + W - 1.5, y: b, z: zf + 1.5, esc: 0.7, tipo: 1 });
    // placa luminosa con número
    p.m('luces').caja(r.cx + 1.6, b + 2.6, zf + 0.06, 0.5, 0.35, 0.05, new THREE.Color('#ffd27f').multiplyScalar(2.2));
    // resto de la manzana: viviendas decorativas
    const gctx = globalCtx();
    const lado = { fondo: 9, estilo: k % 3 === 0 ? 'colonial' : 'moderno', paleta: k % 3 === 0 ? PALETA_COLONIAL : PALETA_MODERNA, pisos: [1, 2, 2, 3], tiendas: 0.25, techo: () => az.prob(0.3) ? 'teja' : 'plano' };
    hilera(gctx, [r.ix0, r.iz1], [x0 - 1.0, r.iz1], [0, 1], lado);
    hilera(gctx, [x0 + W + 1.0, r.iz1], [r.ix1, r.iz1], [0, 1], lado);
    hilera(gctx, [r.ix1, r.iz0], [r.ix0, r.iz0], [0, -1], lado);
    hilera(gctx, [r.ix1, r.iz1 - 9.5], [r.ix1, r.iz0 + 9], [1, 0], { ...lado, fondo: 7 });
    hilera(gctx, [r.ix0, r.iz0 + 9], [r.ix0, r.iz1 - 9.5], [-1, 0], { ...lado, fondo: 7 });
    reg(id, 'casa', `Vivienda de la familia ${NOMBRES_CASAS[k]}`, p, { entrada: entradaSur(r.cx, j), color: e.color, posicion: v3(r.cx, 0, zf - D / 2) });
  });

  return lista;
}

// El contexto global de decorado (para rellenar el resto de las manzanas del catálogo)
let _ctxGlobal = null;
export function fijarContextoGlobal(ctx) { _ctxGlobal = ctx; }
function globalCtx() { return _ctxGlobal; }

// Rellena una manzana residencial dejando libre la esquina sureste (x>=xL, z>=zL)
function perimetroParcial(ctx, r, xL, zL) {
  const o = { fondo: 9, estilo: 'moderno', paleta: PALETA_MODERNA, pisos: [1, 2, 2], tiendas: 0.3, techo: 'plano' };
  hilera(ctx, [r.ix0, r.iz1], [xL - 0.5, r.iz1], [0, 1], o);
  hilera(ctx, [r.ix1, r.iz0], [r.ix0, r.iz0], [0, -1], o);
  hilera(ctx, [r.ix1, zL - 0.5], [r.ix1, r.iz0 + 9], [1, 0], o);
  hilera(ctx, [r.ix0, r.iz0 + 9], [r.ix0, r.iz1 - 9], [-1, 0], o);
}
// evitar advertencias de importación sin uso
void perimetro; void CALLES_X;
