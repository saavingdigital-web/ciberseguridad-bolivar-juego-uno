// Detective Valeria Ríos: modelo procedural con gabardina, sombrero y tablet holográfica,
// animación de marcha procedural, anillo de selección y rutas por las aceras (A*).
import * as THREE from 'three';
import { grafoPeatonal, TODAS_X, TODAS_Z, MEDIA_CALZADA, MALECON_X0, CALLES_X } from './plano.js';
import { texturaHolograma, texturaRadial, iconoDetective } from './texturas.js';

const ESCALA = 3.6;   // escala de juego (x1.5 sobre la ronda 1): legible a distancia RTS
const VELOCIDAD = 9.5; // m/s (carrera ágil a escala de juego: cruzar la ciudad en ~15 s)

// Altura del piso donde pisa la detective
export function alturaPiso(x, z) {
  if (x < CALLES_X[0] - MEDIA_CALZADA && x > MALECON_X0) return 0.35;
  let enCalle = false;
  for (const sx of TODAS_X) if (Math.abs(x - sx) < MEDIA_CALZADA) { enCalle = true; break; }
  if (!enCalle) for (const sz of TODAS_Z) if (Math.abs(z - sz) < MEDIA_CALZADA) { enCalle = true; break; }
  return enCalle ? 0.04 : 0.15;
}

function mat(color, opciones = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...opciones }); }

function construirModelo() {
  const raiz = new THREE.Group();
  const cuerpo = new THREE.Group();       // se balancea al caminar
  raiz.add(cuerpo);
  const gabardina = mat('#c8963e', { roughness: 0.75 });
  const gabOscura = mat('#9a6f2e', { roughness: 0.8 });
  const pantalon = mat('#2b2d3a');
  const botas = mat('#2a1d14', { roughness: 0.5 });
  const piel = mat('#c68a5e', { roughness: 0.6 });
  const pelo = mat('#2a1810', { roughness: 0.55 });
  const sombrero = mat('#2e2f3a', { roughness: 0.6 });
  const cinta = mat('#5a3a22');
  const bufanda = new THREE.MeshStandardMaterial({ color: '#21c7d6', roughness: 0.5, emissive: '#19d8ea', emissiveIntensity: 1.4 });
  const m = (geo, material, x = 0, y = 0, z = 0) => { const me = new THREE.Mesh(geo, material); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; return me; };

  // Piernas con rodilla
  const piernas = [];
  for (const sx of [-1, 1]) {
    const cadera = new THREE.Group(); cadera.position.set(sx * 0.1, 0.95, 0);
    cadera.add(m(new THREE.CylinderGeometry(0.085, 0.075, 0.46, 10).translate(0, -0.23, 0), pantalon));
    const rodilla = new THREE.Group(); rodilla.position.y = -0.46;
    rodilla.add(m(new THREE.CylinderGeometry(0.07, 0.06, 0.42, 10).translate(0, -0.21, 0), pantalon));
    rodilla.add(m(new THREE.BoxGeometry(0.13, 0.12, 0.26).translate(0, -0.44, 0.04), botas));
    rodilla.add(m(new THREE.CylinderGeometry(0.075, 0.07, 0.18, 10).translate(0, -0.33, 0), botas));
    cadera.add(rodilla);
    cuerpo.add(cadera);
    piernas.push({ cadera, rodilla });
  }
  // Falda de la gabardina (abierta adelante con dos paneles)
  const falda = new THREE.Group(); falda.position.y = 1.02;
  const perfilFalda = [new THREE.Vector2(0.31, -0.6), new THREE.Vector2(0.27, -0.42), new THREE.Vector2(0.22, -0.18), new THREE.Vector2(0.19, 0)];
  const gFalda = new THREE.LatheGeometry(perfilFalda, 20, Math.PI * 0.12, Math.PI * 1.76);
  const mf = m(gFalda, gabardina); mf.material = gabardina.clone(); mf.material.side = THREE.DoubleSide;
  falda.add(mf);
  cuerpo.add(falda);
  // Torso
  const perfilTorso = [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.19, 0.0), new THREE.Vector2(0.2, 0.12), new THREE.Vector2(0.22, 0.3), new THREE.Vector2(0.2, 0.42), new THREE.Vector2(0.12, 0.49), new THREE.Vector2(0.0, 0.5)];
  const torso = m(new THREE.LatheGeometry(perfilTorso, 20), gabardina, 0, 1.0, 0);
  torso.scale.set(1, 1, 0.78);
  cuerpo.add(torso);
  cuerpo.add(m(new THREE.TorusGeometry(0.195, 0.03, 6, 20).rotateX(Math.PI / 2).scale(1, 1, 0.8), cinta, 0, 1.04, 0));
  cuerpo.add(m(new THREE.BoxGeometry(0.06, 0.05, 0.02), mat('#c9a24a', { metalness: 0.8, roughness: 0.3 }), 0, 1.04, 0.165));
  // Solapas y cuello levantado
  cuerpo.add(m(new THREE.CylinderGeometry(0.1, 0.16, 0.14, 12, 1, true), gabOscura, 0, 1.53, -0.01));
  for (const sx of [-1, 1]) {
    const sol = m(new THREE.BoxGeometry(0.09, 0.26, 0.02), gabOscura, sx * 0.07, 1.33, 0.165);
    sol.rotation.z = sx * 0.35; sol.rotation.x = -0.15; cuerpo.add(sol);
  }
  // Bufanda cian (acento de identidad)
  cuerpo.add(m(new THREE.TorusGeometry(0.1, 0.045, 8, 16).rotateX(Math.PI / 2), bufanda, 0, 1.5, 0.01));
  cuerpo.add(m(new THREE.BoxGeometry(0.07, 0.24, 0.03), bufanda, 0.05, 1.36, 0.14));
  // Cabeza
  const cabeza = new THREE.Group(); cabeza.position.y = 1.56; cuerpo.add(cabeza);
  cabeza.add(m(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 8), piel, 0, 0.02, 0));
  cabeza.add(m(new THREE.SphereGeometry(0.115, 16, 12).scale(0.92, 1.08, 1), piel, 0, 0.14, 0.01));
  cabeza.add(m(new THREE.SphereGeometry(0.125, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62).scale(0.98, 1.05, 1.05), pelo, 0, 0.15, -0.012));
  cabeza.add(m(new THREE.SphereGeometry(0.1, 12, 10).scale(0.85, 1.2, 0.7), pelo, 0, 0.07, -0.08));
  const coleta = m(new THREE.CapsuleGeometry(0.045, 0.16, 4, 8), pelo, 0, 0.02, -0.14); coleta.rotation.x = 0.5; cabeza.add(coleta);
  // Sombrero fedora
  cabeza.add(m(new THREE.CylinderGeometry(0.22, 0.23, 0.018, 24), sombrero, 0, 0.235, 0));
  cabeza.add(m(new THREE.CylinderGeometry(0.115, 0.13, 0.13, 20), sombrero, 0, 0.305, 0));
  cabeza.add(m(new THREE.CylinderGeometry(0.132, 0.132, 0.035, 20), cinta, 0, 0.26, 0));
  // Brazos
  const brazos = [];
  for (const sx of [-1, 1]) {
    const hombro = new THREE.Group(); hombro.position.set(sx * 0.25, 1.44, 0);
    hombro.add(m(new THREE.SphereGeometry(0.075, 10, 8), gabardina));
    hombro.add(m(new THREE.CylinderGeometry(0.068, 0.062, 0.3, 10).translate(0, -0.15, 0), gabardina));
    const codo = new THREE.Group(); codo.position.y = -0.3;
    codo.add(m(new THREE.CylinderGeometry(0.06, 0.07, 0.27, 10).translate(0, -0.135, 0), gabardina));
    codo.add(m(new THREE.SphereGeometry(0.048, 10, 8), piel, 0, -0.3, 0));
    hombro.add(codo);
    hombro.rotation.z = sx * 0.08;
    cuerpo.add(hombro);
    brazos.push({ hombro, codo });
  }
  // Tablet holográfica en la mano izquierda
  const tablet = new THREE.Group();
  tablet.add(m(new THREE.BoxGeometry(0.2, 0.012, 0.15), mat('#15181f', { metalness: 0.6, roughness: 0.3 })));
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.13).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#5ff3ff').multiplyScalar(2.2) }));
  pantalla.position.y = 0.008; tablet.add(pantalla);
  const holo = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.26), new THREE.MeshBasicMaterial({ map: texturaHolograma('mapa'), color: new THREE.Color('#7ff6ff').multiplyScalar(2.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  holo.position.set(0, 0.2, -0.02); holo.rotation.x = -0.25;
  tablet.add(holo);
  const conoHolo = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.2, 4, 1, true).rotateX(Math.PI).translate(0, 0.1, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color('#5ff3ff').multiplyScalar(0.8), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  tablet.add(conoHolo);
  tablet.position.set(0, -0.28, 0.06);
  tablet.rotation.x = 1.2;
  brazos[0].codo.add(tablet);

  raiz.scale.setScalar(ESCALA);
  raiz.position.y = 0.03;
  return { raiz, cuerpo, piernas, brazos, falda, cabeza, holo, conoHolo };
}

// Anillo de selección dorado y cian
function crearAnillo() {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uSel: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      uniform float uT; uniform float uSel; varying vec2 vUv;
      void main(){
        vec2 p = vUv * 2.0 - 1.0; float r = length(p); float a = atan(p.y, p.x);
        if (r > 1.0) discard;
        float pulso = 0.35 + 0.35 * (0.5 + 0.5 * sin(uT * 3.2));
        // disco de selección (radio ~2.2 m a escala del juego) con pulso 0.35 a 0.7
        float disco = (1.0 - smoothstep(0.0, 0.62, r)) * pulso * 0.55 + smoothstep(0.55, 0.6, r) * (1.0 - smoothstep(0.6, 0.66, r)) * pulso;
        // contorno dorado grueso con trazos que giran
        float oro = smoothstep(0.80, 0.84, r) * (1.0 - smoothstep(0.93, 0.97, r));
        oro *= 0.55 + 0.45 * step(0.22, fract(a / 6.2832 * 12.0 + uT * 0.35));
        // onda que se expande desde el centro
        float onda = (1.0 - smoothstep(0.0, 0.05, abs(r - fract(uT * 0.5) * 0.98))) * (1.0 - fract(uT * 0.5)) * 0.8;
        vec3 c = vec3(0.25, 0.95, 1.0) * (disco * 2.2 + onda * 1.8) + vec3(1.0, 0.76, 0.28) * oro * 2.8;
        gl_FragColor = vec4(c * uSel, 1.0);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const me = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 8.4).rotateX(-Math.PI / 2), mat);
  me.renderOrder = 5;
  return me;
}

// ---------- Rutas ----------
function crearRuteador() {
  const { nodos, aristas } = grafoPeatonal();
  function proyectar(p) {
    let mejor = null;
    for (const [a, b] of aristas) {
      const A = nodos[a], B = nodos[b];
      const dx = B.x - A.x, dz = B.z - A.z;
      const l2 = dx * dx + dz * dz || 1;
      const u = Math.max(0, Math.min(1, ((p.x - A.x) * dx + (p.z - A.z) * dz) / l2));
      const x = A.x + dx * u, z = A.z + dz * u;
      const d = Math.hypot(p.x - x, p.z - z);
      if (!mejor || d < mejor.d) mejor = { a, b, u, x, z, d };
    }
    return mejor;
  }
  function ruta(desde, hasta) {
    const pa = proyectar(desde), pb = proyectar(hasta);
    const N = nodos.length, S = N, G = N + 1;
    const pos = i => i === S ? pa : i === G ? pb : nodos[i];
    const vecinos = i => {
      if (i === S) return [pa.a, pa.b, ...((pa.a === pb.a && pa.b === pb.b) || (pa.a === pb.b && pa.b === pb.a) ? [G] : [])];
      const base = i === G ? [pb.a, pb.b] : [...nodos[i].vecinos];
      if (i === pb.a || i === pb.b) base.push(G);
      if (i === pa.a || i === pa.b) base.push(S);
      return base;
    };
    const dist = new Map([[S, 0]]), prev = new Map(), abiertos = new Set([S]);
    const h = i => Math.hypot(pos(i).x - pb.x, pos(i).z - pb.z);
    while (abiertos.size) {
      let cur = null, f = Infinity;
      for (const i of abiertos) { const v = dist.get(i) + h(i); if (v < f) { f = v; cur = i; } }
      if (cur === G) break;
      abiertos.delete(cur);
      for (const nb of vecinos(cur)) {
        const c = dist.get(cur) + Math.hypot(pos(cur).x - pos(nb).x, pos(cur).z - pos(nb).z);
        if (c < (dist.get(nb) ?? Infinity)) { dist.set(nb, c); prev.set(nb, cur); abiertos.add(nb); }
      }
    }
    const camino = [];
    let k = G;
    if (!prev.has(G)) return [new THREE.Vector3(hasta.x, 0, hasta.z)];
    while (k !== undefined) { const q = pos(k); camino.unshift(new THREE.Vector3(q.x, 0, q.z)); k = prev.get(k); }
    camino.unshift(new THREE.Vector3(desde.x, 0, desde.z));
    camino.push(new THREE.Vector3(hasta.x, 0, hasta.z));
    // limpiar puntos repetidos
    return camino.filter((p, i) => i === 0 || p.distanceTo(camino[i - 1]) > 0.05);
  }
  return { ruta };
}

export function crearDetective(escena, { alLlegar, camara } = {}) {
  const modelo = construirModelo();
  // Silueta cian cuando un edificio la tapa: se dibuja ANTES que la detective (renderOrder 1 contra 2),
  // dentro de la lista opaca y solo donde algo ya pintado está más cerca (GreaterDepth): sin autoocultación.
  const matSilueta = new THREE.MeshBasicMaterial({ color: new THREE.Color('#3fe0ff').multiplyScalar(0.9), blending: THREE.AdditiveBlending, transparent: false, depthWrite: false, depthFunc: THREE.GreaterDepth, fog: false });
  const piezas = [];
  modelo.raiz.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial) piezas.push(o); });
  for (const o of piezas) {
    const s = new THREE.Mesh(o.geometry, matSilueta);
    s.position.copy(o.position); s.quaternion.copy(o.quaternion); s.scale.copy(o.scale);
    s.renderOrder = 1; s.castShadow = false; s.receiveShadow = false;
    s.userData.silueta = true;
    o.parent.add(s);
    o.renderOrder = 2;
  }
  // Marcador flotante con tamaño constante en pantalla
  const marcador = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconoDetective(), depthTest: false, depthWrite: false, transparent: true }));
  marcador.renderOrder = 21;
  const grupo = new THREE.Group(); grupo.name = 'detective';
  grupo.add(modelo.raiz);
  escena.add(grupo);
  const anillo = crearAnillo();
  grupo.add(anillo);
  grupo.add(marcador);
  anillo.position.y = 0.06;
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: texturaRadial('rgba(0,0,0,0.6)', 'rgba(0,0,0,0)'), transparent: true, depthWrite: false }));
  sombra.position.y = 0.04; grupo.add(sombra);

  // marcas de ruta (chevrones)
  const MAXM = 260;
  const chevron = new THREE.Shape();
  chevron.moveTo(-0.45, -0.3); chevron.lineTo(0, 0.25); chevron.lineTo(0.45, -0.3); chevron.lineTo(0.3, -0.38); chevron.lineTo(0, -0.05); chevron.lineTo(-0.3, -0.38); chevron.lineTo(-0.45, -0.3);
  const gChev = new THREE.ShapeGeometry(chevron).rotateX(-Math.PI / 2);
  // tras rotar, la punta mira hacia -z; la orientamos con rotY = atan2(dx,dz) + PI
  const matChev = new THREE.MeshBasicMaterial({ color: new THREE.Color('#4ff0ff').multiplyScalar(1.6), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const marcas = new THREE.InstancedMesh(gChev, matChev, MAXM);
  marcas.count = 0; marcas.frustumCulled = false; marcas.renderOrder = 4;
  escena.add(marcas);
  const destino = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.95, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffc94d').multiplyScalar(2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  destino.visible = false; escena.add(destino);

  const ruteador = crearRuteador();
  const posicion = new THREE.Vector3();
  let camino = null, idx = 0, objetivoId = null, mirar = null;
  let resolver = [];
  let rumbo = 0, rumboObj = 0;
  let fase = 0, mezcla = 0; // mezcla 0 quieto → 1 caminando
  let seleccionado = false, sel = 0;

  function colocar(p) {
    posicion.set(p.x, alturaPiso(p.x, p.z), p.z);
    grupo.position.copy(posicion);
  }

  function moverA(entrada, haciaPunto, id) {
    return new Promise(res => {
      resolver.push(res);
      objetivoId = id;
      mirar = haciaPunto ? haciaPunto.clone() : null;
      camino = ruteador.ruta(posicion, entrada);
      idx = 1;
      if (camino.length < 2 || posicion.distanceTo(new THREE.Vector3(entrada.x, posicion.y, entrada.z)) < 0.6) {
        camino = null;
        setTimeout(() => terminar(), 60);
      }
      dibujarMarcas();
    });
  }

  function terminar() {
    camino = null;
    marcas.count = 0; destino.visible = false;
    if (mirar) rumboObj = Math.atan2(mirar.x - posicion.x, mirar.z - posicion.z);
    const rs = resolver; resolver = [];
    alLlegar?.(objetivoId);
    rs.forEach(r => r());
  }

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3();
  function dibujarMarcas() {
    if (!camino) { marcas.count = 0; destino.visible = false; return; }
    let n = 0;
    let resto = 1.2;
    let previo = posicion.clone(); previo.y = 0;
    for (let i = idx; i < camino.length && n < MAXM; i++) {
      const p = camino[i];
      const seg = p.distanceTo(previo);
      const dx = (p.x - previo.x) / (seg || 1), dz = (p.z - previo.z) / (seg || 1);
      let d = resto;
      while (d < seg && n < MAXM) {
        _p.set(previo.x + dx * d, alturaPiso(previo.x + dx * d, previo.z + dz * d) + 0.07, previo.z + dz * d);
        _e.set(0, Math.atan2(dx, dz) + Math.PI, 0); _q.setFromEuler(_e);
        _m.compose(_p, _q, _s); marcas.setMatrixAt(n++, _m);
        d += 2.2;
      }
      resto = d - seg;
      previo = p;
    }
    marcas.count = n;
    marcas.instanceMatrix.needsUpdate = true;
    const f = camino[camino.length - 1];
    destino.position.set(f.x, alturaPiso(f.x, f.z) + 0.08, f.z);
    destino.visible = true;
  }

  function actualizar(dt, t, pausado) {
    sel += ((seleccionado ? 1 : 0) - sel) * Math.min(1, dt * 10);
    anillo.material.uniforms.uT.value = t;
    anillo.material.uniforms.uSel.value = 0.35 + 0.65 * sel;
    if (camara) {
      const d = camara.position.distanceTo(posicion);
      const esc = Math.max(2.2, d * 0.03) * (1 + sel * 0.15);
      marcador.scale.set(esc * 0.85, esc, 1);
      marcador.position.y = 8.6 + esc * 0.5 + Math.sin(t * 2.4) * 0.3;
    }
    let moviendo = false;
    if (camino && !pausado) {
      let paso = VELOCIDAD * dt;
      while (paso > 0 && camino) {
        const p = camino[idx];
        const dx = p.x - posicion.x, dz = p.z - posicion.z;
        const d = Math.hypot(dx, dz);
        if (d <= paso) {
          posicion.x = p.x; posicion.z = p.z; paso -= d; idx++;
          if (idx >= camino.length) { terminar(); break; }
        } else {
          posicion.x += dx / d * paso; posicion.z += dz / d * paso; paso = 0;
          rumboObj = Math.atan2(dx, dz);
        }
      }
      moviendo = !!camino;
      if (camino) dibujarMarcas();
    }
    // altura suave (bordillos)
    const yObj = alturaPiso(posicion.x, posicion.z);
    posicion.y += (yObj - posicion.y) * Math.min(1, dt * 12);
    grupo.position.copy(posicion);
    // giro suave
    let dr = rumboObj - rumbo;
    while (dr > Math.PI) dr -= Math.PI * 2;
    while (dr < -Math.PI) dr += Math.PI * 2;
    rumbo += dr * Math.min(1, dt * 10);
    modelo.raiz.rotation.y = rumbo;
    // animación
    if (!pausado) {
      mezcla += ((moviendo ? 1 : 0) - mezcla) * Math.min(1, dt * 8);
      fase += dt * (moviendo ? VELOCIDAD / (1.25 * ESCALA) * Math.PI : 2);
    }
    const s = Math.sin(fase), c = Math.cos(fase);
    const k = mezcla;
    modelo.piernas[0].cadera.rotation.x = s * 0.85 * k;
    modelo.piernas[1].cadera.rotation.x = -s * 0.85 * k;
    modelo.piernas[0].rodilla.rotation.x = Math.max(0, -c) * 1.1 * k + 0.05;
    modelo.piernas[1].rodilla.rotation.x = Math.max(0, c) * 1.1 * k + 0.05;
    // brazo izquierdo sostiene la tablet; el derecho balancea
    modelo.brazos[0].hombro.rotation.x = -0.45 - s * 0.12 * k;
    modelo.brazos[0].codo.rotation.x = -1.25;
    modelo.brazos[1].hombro.rotation.x = s * 0.75 * k + Math.sin(t * 1.5) * 0.04 * (1 - k);
    modelo.brazos[1].codo.rotation.x = -0.25 - Math.max(0, s) * 0.5 * k;
    modelo.cuerpo.position.y = Math.abs(c) * 0.06 * k + Math.sin(t * 2) * 0.006 * (1 - k);
    modelo.cuerpo.rotation.x = 0.12 * k;
    modelo.cuerpo.rotation.y = s * 0.08 * k;
    modelo.falda.rotation.x = -0.08 * k;
    modelo.falda.scale.set(1 + 0.05 * k, 1, 1 + Math.abs(s) * 0.12 * k);
    modelo.cabeza.rotation.y = -s * 0.06 * k + Math.sin(t * 0.7) * 0.15 * (1 - k);
    modelo.holo.rotation.y = Math.sin(t * 1.2) * 0.3;
    modelo.holo.material.opacity = 0.75 + Math.sin(t * 9) * 0.1;
    destino.scale.setScalar(1 + Math.sin(t * 5) * 0.12);
  }

  return {
    grupo,
    posicion,
    get ocupado() { return !!camino || resolver.length > 0; },
    colocar,
    moverA,
    seleccionar(v) { seleccionado = v; },
    actualizar,
    // esfera para los clics
    radio: 3.9, alto: 6.3
  };
}
