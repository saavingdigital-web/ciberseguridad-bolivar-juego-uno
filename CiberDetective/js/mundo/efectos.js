// Efectos de juego: balizas de alerta, escudo de "asegurado", emblema, firewall de la ciudad y resaltado.
import * as THREE from 'three';
import { iconoAlerta, iconoEscudo, iconoEmblema } from './texturas.js';

const VERT = 'varying vec2 vUv; varying vec3 vP; void main(){ vUv = uv; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';

function matColumna(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uT: { value: 0 }, uI: { value: 1 }, uVel: { value: 1 } },
    vertexShader: VERT,
    fragmentShader: `
      uniform vec3 uColor; uniform float uT; uniform float uI; uniform float uVel; varying vec2 vUv;
      void main(){
        float y = vUv.y;
        float base = pow(1.0 - y, 1.6);
        float bandas = 0.55 + 0.45 * sin(y * 46.0 - uT * 7.0 * uVel);
        float pulso = 0.7 + 0.3 * sin(uT * 5.0 * uVel);
        float borde = pow(abs(sin(vUv.x * 3.14159 * 8.0 + uT)), 8.0) * 0.4;
        float a = base * (bandas * 0.7 + 0.3 + borde) * pulso;
        gl_FragColor = vec4(uColor * a * uI * 1.8, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
}

function matOnda(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uT: { value: 0 }, uI: { value: 1 }, uVel: { value: 1 } },
    vertexShader: VERT,
    fragmentShader: `
      uniform vec3 uColor; uniform float uT; uniform float uI; uniform float uVel; varying vec2 vUv;
      void main(){
        float r = length(vUv * 2.0 - 1.0);
        if (r > 1.0) discard;
        float o = fract(r * 2.0 - uT * 0.9 * uVel);
        float anillo = smoothstep(0.0, 0.08, o) * (1.0 - smoothstep(0.08, 0.22, o));
        float borde = smoothstep(0.9, 0.96, r) * (1.0 - smoothstep(0.97, 1.0, r));
        float a = (anillo * 0.9 + borde * 1.4) * (1.0 - r * 0.6);
        gl_FragColor = vec4(uColor * a * uI * 2.0, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
}

function matCupula(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uT: { value: 0 }, uA: { value: 1 }, uCobertura: { value: 1 }, uI: { value: 1 }, uEsc: { value: new THREE.Vector2(40, 14) } },
    vertexShader: `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; uniform float uT; uniform float uA; uniform float uCobertura; uniform float uI; uniform vec2 uEsc;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      // distancia al borde de una celda hexagonal
      float hex(vec2 p){
        p.x *= 1.1547; p.y += mod(floor(p.x), 2.0) * 0.5;
        p = abs(fract(p) - 0.5);
        return abs(max(p.x * 1.5 + p.y, p.y * 2.0) - 1.0);
      }
      float azar(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        float y = vUv.y;
        if (y > uCobertura) discard;
        vec2 p = vec2(vUv.x * uEsc.x, y * uEsc.y);
        float lineas = 1.0 - smoothstep(0.0, 0.065, hex(p));
        vec2 celda = floor(vec2(p.x * 1.1547, p.y + mod(floor(p.x * 1.1547), 2.0) * 0.5));
        float chispa = step(0.972, azar(celda + floor(uT * 1.5))) * 0.45;
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.8);
        float frente = smoothstep(uCobertura - 0.05, uCobertura, y) * (1.0 - smoothstep(uCobertura - 0.008, uCobertura, y)) * 0.9;
        // Se desvanece suavemente cerca del suelo/mar (y -> 0) para no cortar el océano ni la playa con un arco duro
        float desvaneceBase = smoothstep(0.02, 0.18, y);
        float barrido = smoothstep(0.47, 0.5, abs(fract(y - uT * 0.1) - 0.5)) * 0.35;
        float a = (lineas * (0.12 + f * 0.65) + chispa * 0.3 + frente + barrido * lineas + f * 0.05) * desvaneceBase * uA * uI;
        gl_FragColor = vec4(uColor * a, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
}

export function crearEfectos(escena, camara) {
  const grupo = new THREE.Group(); grupo.name = 'efectos';
  escena.add(grupo);
  const sinAO = [grupo];
  const alertas = new Map();
  const seguros = new Map();
  const ondas = [];

  // ---------- Balizas de alerta ----------
  function ponerAlerta(e, { nivel = 'alta', color } = {}) {
    quitarAlerta(e.id, true);
    const col = color ?? (nivel === 'alta' ? '#ff3b30' : '#ffb020');
    const g = new THREE.Group();
    g.position.set(e.posicion.x, 0, e.posicion.z);
    const alto = Math.max(16, e.alto + 26);
    const radio = Math.max(3, Math.min(9, Math.max(e.ancho, e.fondo) * 0.28));
    const mc = matColumna(col);
    const col1 = new THREE.Mesh(new THREE.CylinderGeometry(radio, radio * 1.1, alto, 40, 1, true).translate(0, alto / 2, 0), mc);
    const mc2 = matColumna(col); mc2.uniforms.uI.value = 1.6;
    const col2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, alto * 1.15, 12, 1, true).translate(0, alto * 0.575, 0), mc2);
    const mo = matOnda(col);
    const onda = new THREE.Mesh(new THREE.PlaneGeometry(radio * 4, radio * 4).rotateX(-Math.PI / 2), mo);
    onda.position.y = 0.3;
    const icono = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconoAlerta(col), depthTest: false, depthWrite: false, transparent: true }));
    icono.renderOrder = 20;
    const yIcono = e.alto + 9;
    icono.position.y = yIcono;
    g.add(col1, col2, onda, icono);
    grupo.add(g);
    const vel = nivel === 'alta' ? 1.5 : 1;
    for (const m of [mc, mc2, mo]) m.uniforms.uVel.value = vel;
    alertas.set(e.id, { g, mats: [mc, mc2, mo], icono, yIcono, t0: performance.now() / 1000, vel, color: col, e });
    const s = seguros.get(e.id); if (s) s.emblema.visible = false;
  }
  function quitarAlerta(id, silencioso = false) {
    const a = alertas.get(id);
    if (!a) return;
    if (!silencioso) {
      // pequeño desvanecimiento
      a.saliendo = 1;
      return;
    }
    grupo.remove(a.g);
    a.g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    alertas.delete(id);
  }

  // ---------- Asegurado: escudo que se expande y emblema ----------
  function marcarSeguro(e) {
    const g = new THREE.Group();
    g.position.set(e.posicion.x, 0, e.posicion.z);
    const R = Math.max(8, Math.max(e.ancho, e.fondo) * 0.75, e.alto * 0.7);
    const mat = matCupula('#3dff8a');
    mat.uniforms.uEsc.value.set(24, 8);
    const domo = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    const mo = matOnda('#3dff8a');
    const onda = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), mo);
    onda.position.y = 0.3;
    g.add(domo, onda);
    grupo.add(g);
    ondas.push({ g, domo, onda, mat, mo, R, t: 0, dur: 2.6 });
    let s = seguros.get(e.id);
    if (!s) {
      const emblema = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconoEscudo(), depthTest: false, depthWrite: false, transparent: true }));
      emblema.renderOrder = 19;
      emblema.position.set(e.posicion.x, e.alto + 5, e.posicion.z);
      grupo.add(emblema);
      s = { emblema, y: e.alto + 5, t0: 0 };
      seguros.set(e.id, s);
    }
    s.emblema.visible = true;
    s.t0 = performance.now() / 1000;
  }

  // ---------- Emblemas de edificios jugables (estandarte flotante + calco tenue en el suelo) ----------
  const emblemas = new Map();
  function marcarCatalogo(lista) {
    for (const e of lista) {
      if (emblemas.has(e.id)) continue;
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconoEmblema(e.tipo, e.color ?? '#d4a94c'), depthTest: false, depthWrite: false, transparent: true, opacity: 0.75 }));
      sprite.renderOrder = 18;
      const y = Math.min(e.alto, 40) + 3;
      sprite.position.set(e.posicion.x, y, e.posicion.z);
      const r = Math.max(e.ancho, e.fondo) * 0.55 + 1.5;
      const calco = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.35, 72).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(e.color ?? '#d4a94c'), transparent: true, opacity: 0.22, depthWrite: false, fog: false }));
      calco.position.set(e.posicion.x, 0.22, e.posicion.z);
      calco.renderOrder = 3;
      grupo.add(sprite, calco);
      emblemas.set(e.id, { sprite, calco, y });
    }
  }

  // ---------- Firewall de la ciudad ----------
  const fwMat = matCupula('#3fe0ff');
  fwMat.uniforms.uEsc.value.set(160, 24);
  const firewall = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 40, 0, Math.PI * 2, 0, Math.PI / 2), fwMat);
  firewall.scale.set(255, 72, 240);
  firewall.position.set(-10, -4, -18);
  firewall.renderOrder = 2;
  grupo.add(firewall);
  const NIVELES = [
    { c: 0.0, i: 0.0 },
    { c: 0.22, i: 0.11 },
    { c: 0.48, i: 0.16 },
    { c: 0.76, i: 0.20 },
    { c: 1.0, i: 0.25 }
  ];
  let fwObj = NIVELES[0], fwC = 0, fwI = 0, fwFlash = 0;
  function nivelFirewall(era) {
    const n = NIVELES[Math.max(0, Math.min(4, Math.round(era)))];
    if (n !== fwObj) fwFlash = 1;
    fwObj = n;
  }

  // ---------- Resaltado (borde de luz aditivo) ----------
  const matResalte = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color('#ffd27f') }, uT: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uT; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); float p = 0.85 + 0.15 * sin(uT * 6.0);
        gl_FragColor = vec4(uColor * (0.12 + f * 1.1) * p, 1.0); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
  });
  const capas = new Map(); // id → grupo de superposición
  function capaResalte(e) {
    if (capas.has(e.id)) return capas.get(e.id);
    const capa = new THREE.Group();
    e.grupo.updateMatrixWorld(true);
    e.grupo.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.userData.sinResalte || (o.material && o.material.blending === THREE.AdditiveBlending)) return;
      if (o.material && o.material.isShaderMaterial) return;
      const m = new THREE.Mesh(o.geometry, matResalte);
      m.matrixAutoUpdate = false;
      m.matrix.copy(o.matrixWorld);
      m.renderOrder = 3;
      capa.add(m);
    });
    // anillo en el suelo
    const r = Math.max(e.ancho, e.fondo) * 0.62 + 2;
    const anillo = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.5, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd27f').multiplyScalar(1.6), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    anillo.position.set(e.posicion.x, 0.25, e.posicion.z);
    anillo.matrixAutoUpdate = true;
    capa.add(anillo);
    capa.visible = false;
    grupo.add(capa);
    capas.set(e.id, capa);
    return capa;
  }
  let resaltado = null;
  function resaltar(e) {
    if (resaltado && (!e || resaltado !== e.id)) { const c = capas.get(resaltado); if (c) c.visible = false; resaltado = null; }
    if (e) { capaResalte(e).visible = true; resaltado = e.id; }
  }

  // ---------- Actualización ----------
  const _v = new THREE.Vector3();
  function actualizar(dt, t) {
    matResalte.uniforms.uT.value = t;
    for (const [id, a] of alertas) {
      const k = a.saliendo !== undefined ? (a.saliendo = Math.max(0, a.saliendo - dt * 1.5)) : Math.min(1, (performance.now() / 1000 - a.t0) * 2);
      for (const m of a.mats) { m.uniforms.uT.value = t; m.uniforms.uI.value = (m === a.mats[1] ? 1.6 : 1) * k; }
      const d = camara.position.distanceTo(_v.set(a.g.position.x, a.yIcono, a.g.position.z));
      const esc = Math.min(9.2, Math.max(4.2, d * 0.042)) * (1 + Math.sin(t * 4 * a.vel) * 0.06) * (0.4 + 0.6 * k);
      a.icono.scale.set(esc, esc, 1);
      a.icono.position.y = a.yIcono + Math.sin(t * 2.2) * 0.8 + esc * 0.35;
      a.icono.material.opacity = k;
      if (a.saliendo !== undefined && a.saliendo <= 0) quitarAlerta(id, true);
    }
    for (let i = ondas.length - 1; i >= 0; i--) {
      const o = ondas[i];
      o.t += dt;
      const u = Math.min(1, o.t / o.dur);
      const crece = 1 - Math.pow(1 - Math.min(1, u * 1.8), 3);
      o.domo.scale.set(o.R * crece, o.R * 0.8 * crece, o.R * crece);
      o.mat.uniforms.uT.value = t; o.mat.uniforms.uA.value = (1 - u) * 1.6;
      o.onda.scale.setScalar(o.R * 1.6 * crece);
      o.mo.uniforms.uT.value = t; o.mo.uniforms.uI.value = (1 - u);
      if (u >= 1) { grupo.remove(o.g); o.domo.geometry.dispose(); o.onda.geometry.dispose(); o.mat.dispose(); o.mo.dispose(); ondas.splice(i, 1); }
    }
    for (const s of seguros.values()) {
      if (!s.emblema.visible) continue;
      const d = camara.position.distanceTo(s.emblema.position);
      const pop = Math.min(1, (performance.now() / 1000 - s.t0) * 1.5);
      const esc = Math.min(6.8, Math.max(2.5, d * 0.028)) * (0.2 + 0.8 * pop);
      s.emblema.scale.set(esc, esc, 1);
      s.emblema.position.y = s.y + Math.sin(t * 1.4 + s.y) * 0.4 + esc * 0.3;
      s.emblema.material.opacity = 0.9;
    }
    // emblemas del catálogo: tamaño constante, se apartan ante alertas y escudos
    for (const [id, m] of emblemas) {
      const ocupado = alertas.has(id) || (seguros.get(id)?.emblema.visible ?? false);
      m.sprite.visible = !ocupado;
      if (ocupado) continue;
      const d = camara.position.distanceTo(m.sprite.position);
      const activo = resaltado === id;
      const esc = Math.min(4.8, Math.max(1.6, d * 0.017)) * (activo ? 1.25 : 1);
      m.sprite.scale.set(esc, esc, 1);
      m.sprite.position.y = m.y + esc * 0.5;
      m.sprite.material.opacity = activo ? 1 : 0.75;
      m.calco.material.opacity = activo ? 0.5 : 0.22;
    }
    // firewall
    fwC += (fwObj.c - fwC) * Math.min(1, dt * 0.8);
    fwI += (fwObj.i - fwI) * Math.min(1, dt * 1.2);
    fwFlash = Math.max(0, fwFlash - dt * 0.6);
    fwMat.uniforms.uT.value = t;
    fwMat.uniforms.uCobertura.value = Math.max(0.001, fwC);
    fwMat.uniforms.uI.value = fwI * (1 + fwFlash * 1.5) * 0.5;
    firewall.visible = fwI > 0.01;
  }

  return { grupo, sinAO, ponerAlerta, quitarAlerta: id => quitarAlerta(id, false), marcarSeguro, marcarCatalogo, nivelFirewall, resaltar, actualizar, alertas, seguros };
}
