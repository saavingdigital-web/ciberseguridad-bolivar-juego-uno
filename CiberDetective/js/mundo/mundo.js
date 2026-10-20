// MUNDO de CiberDetective: Puerto Nexo. Entrada única del módulo (ver ARQUITECTURA.md §4).
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { pausa } from './util.js';
import { configurarTexturas } from './texturas.js';
import { crearMateriales } from './materiales.js';
import { crearTerreno } from './terreno.js';
import { crearCiudad } from './ciudad.js';
import { crearProps } from './props.js';
import { crearTrafico } from './trafico.js';
import { crearPeatones } from './peatones.js';
import { crearDetective } from './detective.js';
import { crearEfectos } from './efectos.js';
import { crearControlCamara } from './camara.js';
import { TODAS_X, TODAS_Z, CALLES_X, CALLES_Z, LIMITES_MINIMAPA, MUELLE_Z, lineaPlaya } from './plano.js';

const DIR_SOL = new THREE.Vector3(-0.62, 0.37, 0.66).normalize();   // sol más bajo: sombras largas de hora dorada
const COLOR_NIEBLA = new THREE.Color('#d6b393');

export async function crearMundo({ contenedor, alProgreso = () => {} }) {
  const progreso = async (p, txt) => { try { alProgreso(p, txt); } catch (e) { console.warn(e); } await pausa(16); };
  await progreso(0.02, 'Preparando el motor gráfico…');

  // ---------- Renderizador ----------
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', stencil: false });
  const pixelRatioBase = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(pixelRatioBase);
  const ancho = () => Math.max(1, contenedor.clientWidth || window.innerWidth);
  const alto = () => Math.max(1, contenedor.clientHeight || window.innerHeight);
  renderer.setSize(ancho(), alto());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  canvas.style.width = '100%'; canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.tabIndex = 0;
  contenedor.appendChild(canvas);
  configurarTexturas(renderer);

  const escena = new THREE.Scene();
  escena.background = COLOR_NIEBLA.clone();
  escena.fog = new THREE.FogExp2(COLOR_NIEBLA.clone(), 0.0011);
  const camara = new THREE.PerspectiveCamera(30, ancho() / alto(), 4, 2500);

  // ---------- Cielo de atardecer y entorno PMREM ----------
  const cielo = new Sky();
  cielo.scale.setScalar(10);
  const u = cielo.material.uniforms;
  u.turbidity.value = 7; u.rayleigh.value = 2.4; u.mieCoefficient.value = 0.007; u.mieDirectionalG.value = 0.86;
  u.sunPosition.value.copy(DIR_SOL);
  const escenaCielo = new THREE.Scene(); escenaCielo.add(cielo);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const entorno = pmrem.fromScene(escenaCielo, 0.02).texture;
  escena.environment = entorno;
  escena.environmentIntensity = 0.55;
  pmrem.dispose();

  // ---------- Luces ----------
  const sol = new THREE.DirectionalLight(new THREE.Color('#ffc58a'), 2.7);
  sol.castShadow = true;
  const tamSombra = renderer.capabilities.maxTextureSize >= 8192 ? 4096 : 2048;
  sol.shadow.mapSize.set(tamSombra, tamSombra);
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.05;
  sol.shadow.camera.near = 1; sol.shadow.camera.far = 900;
  escena.add(sol, sol.target);
  const hemi = new THREE.HemisphereLight(new THREE.Color('#9fc0ff'), new THREE.Color('#a98660'), 0.62);
  escena.add(hemi);

  await progreso(0.08, 'Pintando fachadas y tejas…');
  const M = crearMateriales();

  await progreso(0.16, 'Modelando la costa y las calles…');
  const terreno = crearTerreno(escena, M);

  await progreso(0.24, 'Trazando la ciudad amurallada…');
  const ciudad = crearCiudad(escena, M, (p, t) => alProgreso(p, t));

  await progreso(0.55, 'Sembrando palmeras y buganvilias…');
  const props = crearProps(escena, M, ciudad.inst);

  await progreso(0.66, 'Encendiendo el tráfico…');
  const trafico = crearTrafico(escena, M);

  await progreso(0.72, 'Llenando las aceras de gente…');
  const peatones = crearPeatones(escena);

  // ---------- Eventos ----------
  const oyentes = new Map();
  const emitir = (ev, datos) => (oyentes.get(ev) ?? []).forEach(fn => { try { fn(datos); } catch (e) { console.error(`[mundo:${ev}]`, e); } });

  // ---------- Edificios del catálogo ----------
  const internos = new Map(ciudad.catalogo.map(e => [e.id, e]));
  const edificios = new Map(ciudad.catalogo.map(e => [e.id, { id: e.id, tipo: e.tipo, nombre: e.nombre, posicion: e.posicion.clone(), entrada: e.entrada.clone() }]));

  await progreso(0.78, 'Presentando a la detective Valeria Ríos…');
  const detective = crearDetective(escena, { camara, alLlegar: id => emitir('detective-llego', { id }) });
  detective.colocar(internos.get('central').entrada);

  const efectos = crearEfectos(escena, camara);
  efectos.marcarCatalogo(ciudad.catalogo);
  const control = crearControlCamara(camara, canvas);

  // ---------- Postprocesado ----------
  await progreso(0.84, 'Ajustando luz, sombras y bloom…');
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(ancho(), alto());
  composer.addPass(new RenderPass(escena, camara));
  const w0 = ancho() * renderer.getPixelRatio(), h0 = alto() * renderer.getPixelRatio();
  let gtao = null;
  try {
    gtao = new GTAOPass(escena, camara, w0, h0);
    gtao.updateGtaoMaterial({ radius: 2.6, distanceExponent: 1.2, thickness: 2.5, scale: 1.0, samples: 12, distanceFallOff: 1.0 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    gtao.blendIntensity = 0.85;
    const sinAO = [efectos.grupo, terreno.agua.malla, ...props.sinAO, ...trafico.sinAO, detective.grupo.children.filter(o => o.material && o.material.transparent)];
    for (const e of ciudad.catalogo) sinAO.push(...e.holos);
    ciudad.grupo.traverse(o => { if (o.userData.sinAO) sinAO.push(o); });
    escena.traverse(o => { if ((o.isMesh || o.isSprite) && o.material && (o.material.blending === THREE.AdditiveBlending || o.material.isShaderMaterial)) sinAO.push(o); });
    const lista = sinAO.flat();
    const original = gtao.overrideVisibility.bind(gtao);
    gtao.overrideVisibility = () => { original(); for (const o of lista) o.visible = false; };
    composer.addPass(gtao);
  } catch (e) { console.warn('GTAO no disponible', e); gtao = null; }
  // umbral alto: solo brillan neones, balizas y hologramas (no los techos blancos al sol)
  const bloom = new UnrealBloomPass(new THREE.Vector2(w0 / 2, h0 / 2), 0.22, 0.4, 1.35);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  // Gradación final (en sRGB): contraste, saturación, sombras frías y viñeta suave
  const gradacion = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uContraste: { value: 1.12 }, uSaturacion: { value: 1.12 }, uVineta: { value: 0.11 },
      uSombra: { value: new THREE.Color('#3c4c5e') }, uLuz: { value: new THREE.Color('#fff1dc') }
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uContraste; uniform float uSaturacion; uniform float uVineta;
      uniform vec3 uSombra; uniform vec3 uLuz; varying vec2 vUv;
      void main(){
        vec4 c = texture2D(tDiffuse, vUv);
        vec3 col = c.rgb;
        float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(vec3(l), col, uSaturacion);
        col = (col - 0.5) * uContraste + 0.5;
        float ls = clamp(dot(col, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
        // virado: sombras hacia azul petróleo, luces hacia crema cálida
        col = mix(col, col * (uSombra * 2.2), (1.0 - smoothstep(0.0, 0.45, ls)) * 0.15);
        col = max(col, vec3(0.025, 0.03, 0.04)); // sin negros puros
        col = mix(col, col * uLuz, smoothstep(0.55, 1.0, ls) * 0.5);
        vec2 d = vUv - 0.5;
        float v = 1.0 - uVineta * smoothstep(0.25, 0.85, dot(d, d) * 2.2);
        gl_FragColor = vec4(clamp(col * v, 0.0, 1.0), c.a);
      }`
  });
  composer.addPass(gradacion);
  const smaa = new SMAAPass(w0, h0);
  composer.addPass(smaa);

  // ---------- Selección y hover ----------
  const cajasCatalogo = ciudad.catalogo.map(e => ({ id: e.id, caja: e.caja }));
  const cajasDecor = ciudad.cajas.map(c => new THREE.Box3(new THREE.Vector3(c.x0, 0, c.z0), new THREE.Vector3(c.x1, c.y1, c.z1)));
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const _p = new THREE.Vector3(), _esf = new THREE.Sphere();
  function elegir(cx, cy) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camara);
    // detective (prioridad, con radio generoso)
    _esf.center.copy(detective.posicion).y += 2.1; _esf.radius = detective.radio;
    if (ray.ray.intersectSphere(_esf, _p)) return { tipo: 'detective' };
    let mejor = null, dMejor = Infinity;
    for (const c of cajasCatalogo) {
      if (ray.ray.intersectBox(c.caja, _p)) { const d = _p.distanceToSquared(ray.ray.origin); if (d < dMejor) { dMejor = d; mejor = c.id; } }
    }
    let dDecor = Infinity;
    for (const b of cajasDecor) if (ray.ray.intersectBox(b, _p)) { const d = _p.distanceToSquared(ray.ray.origin); if (d < dDecor) dDecor = d; }
    if (mejor && dMejor <= dDecor + 4) return { tipo: 'edificio', id: mejor };
    if (ray.ray.intersectPlane(plano, _p)) return { tipo: 'suelo', x: _p.x, z: _p.z };
    return null;
  }

  canvas.addEventListener('contextmenu', e => e.preventDefault());
  const pulsado = { boton: -1, x: 0, y: 0 };
  canvas.addEventListener('pointerdown', e => {
    if (e.button === 0 || e.button === 2) { pulsado.boton = e.button; pulsado.x = e.clientX; pulsado.y = e.clientY; }
    canvas.focus({ preventScroll: true });
  });
  canvas.addEventListener('pointerup', e => {
    if (e.button !== pulsado.boton) return;
    pulsado.boton = -1;
    if (Math.hypot(e.clientX - pulsado.x, e.clientY - pulsado.y) > 8) return;
    const h = elegir(e.clientX, e.clientY);
    if (!h) return;
    if (h.tipo === 'detective') emitir('click-detective', {});
    else if (h.tipo === 'edificio') emitir('click-edificio', { id: h.id, boton: e.button });
    else emitir('click-suelo', { x: h.x, z: h.z, boton: e.button });
  });
  const hover = { x: 0, y: 0, sucio: false, dentro: false, actual: null };
  canvas.addEventListener('pointermove', e => { hover.x = e.clientX; hover.y = e.clientY; hover.sucio = true; hover.dentro = true; });
  canvas.addEventListener('pointerleave', () => { hover.dentro = false; hover.sucio = true; });
  function revisarHover() {
    let id = null, tipo = null;
    if (hover.dentro) {
      const h = elegir(hover.x, hover.y);
      if (h && h.tipo === 'detective') { id = 'detective'; tipo = 'detective'; }
      else if (h && h.tipo === 'edificio') { id = h.id; tipo = 'edificio'; }
    }
    const clave = tipo ? tipo + ':' + id : null;
    if (clave !== hover.actual) {
      hover.actual = clave;
      canvas.style.cursor = tipo ? 'pointer' : 'default';
      emitir('hover', { id: tipo === 'edificio' ? id : null, tipo });
    }
  }

  // ---------- Indicadores de alertas fuera de cámara (flechas en el borde) ----------
  const capaFlechas = document.createElement('div');
  capaFlechas.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1';
  if (getComputedStyle(contenedor).position === 'static') contenedor.style.position = 'relative';
  contenedor.appendChild(capaFlechas);
  const flechas = new Map();
  const MARGEN = { arriba: 76, abajo: 196, lados: 44 };
  const _ndc = new THREE.Vector3();
  let indicadores = [];
  function calcularIndicadores() {
    const w = canvas.clientWidth || ancho(), h = canvas.clientHeight || alto();
    const lista = [];
    for (const [id, a] of efectos.alertas) {
      if (a.saliendo !== undefined) continue;
      const e = a.e;
      _ndc.set(e.posicion.x, Math.min(e.alto, 30) * 0.5, e.posicion.z).project(camara);
      const detras = _ndc.z > 1;
      let nx = detras ? -_ndc.x : _ndc.x, ny = detras ? -_ndc.y : _ndc.y;
      const dentro = !detras && Math.abs(nx) <= 0.92 && Math.abs(ny) <= 0.88;
      let sx = (nx * 0.5 + 0.5) * w, sy = (-ny * 0.5 + 0.5) * h;
      const ang = Math.atan2(sy - h / 2, sx - w / 2);
      if (!dentro) {
        // llevar al borde del rectángulo útil siguiendo la dirección desde el centro
        const cx = w / 2, cy = h / 2;
        const dx = Math.cos(ang), dy = Math.sin(ang);
        const lx = (dx > 0 ? w - MARGEN.lados - cx : cx - MARGEN.lados) / Math.max(1e-4, Math.abs(dx));
        const ly = (dy > 0 ? h - MARGEN.abajo - cy : cy - MARGEN.arriba) / Math.max(1e-4, Math.abs(dy));
        const k = Math.min(lx, ly);
        sx = cx + dx * k; sy = cy + dy * k;
      }
      lista.push({ id, x: sx, y: sy, angulo: ang, fuera: !dentro, color: a.color });
    }
    return lista;
  }
  function dibujarFlechas(t) {
    indicadores = calcularIndicadores();
    const vivos = new Set();
    for (const ind of indicadores) {
      if (!ind.fuera) continue;
      vivos.add(ind.id);
      let el = flechas.get(ind.id);
      if (!el) {
        el = document.createElement('div');
        el.title = 'Ir al incidente';
        el.style.cssText = 'position:absolute;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;pointer-events:auto;cursor:pointer;';
        el.innerHTML = '<div style="position:absolute;inset:6px;clip-path:polygon(100% 50%,10% 6%,30% 50%,10% 94%);"></div>' +
          '<div style="position:absolute;left:13px;top:13px;width:20px;height:20px;border-radius:50%;background:#140606;border:2px solid #fff;color:#fff;font:900 13px/16px sans-serif;text-align:center;">!</div>';
        el.addEventListener('pointerdown', ev => { ev.stopPropagation(); const e = internos.get(ind.id); if (e) control.centrar(e.posicion.x, e.posicion.z, true); });
        capaFlechas.appendChild(el);
        flechas.set(ind.id, el);
      }
      const punta = el.firstChild;
      punta.style.background = ind.color;
      punta.style.filter = `drop-shadow(0 0 6px ${ind.color})`;
      punta.style.transform = `rotate(${ind.angulo}rad)`;
      const pulso = 1 + Math.sin(t * 6) * 0.08;
      el.style.transform = `translate(${ind.x}px, ${ind.y}px) scale(${pulso})`;
    }
    for (const [id, el] of flechas) if (!vivos.has(id)) { el.remove(); flechas.delete(id); }
  }

  // ---------- Minimapa ----------
  const minimapa = (() => {
    const zMax = TODAS_Z[TODAS_Z.length - 1], xMax = TODAS_X[TODAS_X.length - 1];
    const calles = [
      ...TODAS_X.map(x => [[x, CALLES_Z[0]], [x, zMax]]),
      ...TODAS_Z.map(z => [[CALLES_X[0], z], [xMax, z]])
    ];
    const L = LIMITES_MINIMAPA;
    const dentro = (x, z) => x >= L.minX && x <= L.maxX && z >= L.minZ && z <= L.maxZ;
    const eds = ciudad.catalogo.map(e => ({ id: e.id, x: e.posicion.x, z: e.posicion.z, w: Math.max(4, e.ancho), d: Math.max(4, e.fondo), tipo: e.tipo, color: e.color }));
    for (const c of ciudad.cajas) {
      const x = (c.x0 + c.x1) / 2, z = (c.z0 + c.z1) / 2;
      if (dentro(x, z)) eds.unshift({ id: null, x, z, w: c.x1 - c.x0, d: c.z1 - c.z0, tipo: 'decorativo', color: c.color });
    }
    const costa = [];
    for (let z = L.maxZ; z >= MUELLE_Z; z -= 10) costa.push([lineaPlaya(z), z]);
    const agua = [[[L.minX - 60, L.maxZ + 60], ...costa, [lineaPlaya(MUELLE_Z), MUELLE_Z], [L.maxX + 60, MUELLE_Z], [L.maxX + 60, L.minZ - 60], [L.minX - 60, L.minZ - 60]]];
    return { limites: { ...L }, calles, edificios: eds, agua };
  })();

  // ---------- Calidad adaptativa ----------
  const calidad = { nivel: 0, acum: 0, frames: 0, espera: 6 };
  function ajustarCalidad(dt) {
    if (calidad.espera > 0) { calidad.espera -= dt; return; }
    calidad.acum += dt; calidad.frames++;
    if (calidad.acum < 3) return;
    const prom = calidad.acum / calidad.frames;
    calidad.acum = 0; calidad.frames = 0;
    if (prom > 1 / 45 && calidad.nivel < 3) {
      calidad.nivel++;
      if (calidad.nivel === 1 && gtao) gtao.enabled = false;
      if (calidad.nivel === 2) { renderer.setPixelRatio(Math.max(0.75, pixelRatioBase * 0.8)); redimensionar(); }
      if (calidad.nivel === 3) { bloom.enabled = false; sol.shadow.mapSize.set(2048, 2048); if (sol.shadow.map) { sol.shadow.map.dispose(); sol.shadow.map = null; } }
      calidad.espera = 2;
    }
  }

  function redimensionar() {
    const w = ancho(), h = alto();
    camara.aspect = w / h; camara.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(w, h);
  }

  // ---------- Sombra que sigue la vista (con ajuste a texel para que no tiemble) ----------
  const ejeZ = DIR_SOL.clone(), ejeX = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), ejeZ).normalize(), ejeY = new THREE.Vector3().crossVectors(ejeZ, ejeX);
  let extSombra = 0;
  function actualizarSombra() {
    const ext = Math.round(THREE.MathUtils.clamp(control.distancia * 0.95, 70, 240) / 10) * 10;
    if (ext !== extSombra) {
      extSombra = ext;
      const c = sol.shadow.camera;
      c.left = -ext; c.right = ext; c.top = ext; c.bottom = -ext;
      c.updateProjectionMatrix();
    }
    const texel = (2 * extSombra) / sol.shadow.mapSize.x;
    const o = control.objetivo;
    const px = Math.round(o.dot(ejeX) / texel) * texel, py = Math.round(o.dot(ejeY) / texel) * texel, pz = o.dot(ejeZ);
    sol.target.position.copy(ejeX).multiplyScalar(px).addScaledVector(ejeY, py).addScaledVector(ejeZ, pz);
    sol.position.copy(sol.target.position).addScaledVector(ejeZ, 420);
    sol.target.updateMatrixWorld();
  }

  // ---------- Bucle ----------
  let pausado = false;
  let propsPequenosVisibles = true;
  let tSim = 0, tSemaforo = 0;
  function actualizar(dt, t) {
    dt = Math.min(Math.max(dt || 0, 0), 0.1);
    control.actualizar(dt);
    actualizarSombra();
    if (!pausado) {
      tSim += dt;
      trafico.actualizar(dt, tSim);
      peatones.actualizar(dt, tSim);
      tSemaforo -= dt;
      if (tSemaforo <= 0 && props.semaforos) { props.semaforos.actualizar(trafico.estado); tSemaforo = 0.25; }
    }
    detective.actualizar(dt, t, pausado);
    terreno.agua.actualizar(t);
    props.actualizar(t);
    { const ver = control.distancia < 165; if (ver !== propsPequenosVisibles) { propsPequenosVisibles = ver; for (const o of props.pequenos) o.visible = ver; } }
    efectos.actualizar(dt, t);
    for (const e of ciudad.catalogo) for (const f of e.animables) f(t);
    dibujarFlechas(t);
    if (hover.sucio || hover.dentro) { revisarHover(); hover.sucio = false; }
    ajustarCalidad(dt);
  }

  function renderizar() { composer.render(); }

  // Precompilar sombreadores para evitar tirones
  await progreso(0.92, 'Compilando sombreadores…');
  control.actualizar(0.016); actualizarSombra();
  try { if (renderer.compileAsync) await renderer.compileAsync(escena, camara); } catch (e) { console.warn(e); }
  renderizar();
  await progreso(1, 'Puerto Nexo está listo');

  const mundo = {
    edificios,
    detective: {
      posicion: detective.posicion,
      get ocupado() { return detective.ocupado; }
    },
    actualizar,
    renderizar,
    redimensionar,
    pausar(b) { pausado = !!b; },
    moverDetective(id) {
      const e = internos.get(id);
      if (!e) return Promise.resolve();
      return detective.moverA(e.entrada, e.posicion, id);
    },
    seleccionarDetective(b) { detective.seleccionar(!!b); },
    ponerAlerta(id, opciones = {}) { const e = internos.get(id); if (e) efectos.ponerAlerta(e, opciones); },
    quitarAlerta(id) { efectos.quitarAlerta(id); },
    marcarSeguro(id) { const e = internos.get(id); if (e) efectos.marcarSeguro(e); },
    resaltar(id) { efectos.resaltar(id ? internos.get(id) ?? null : null); },
    nivelFirewall(era) { efectos.nivelFirewall(era); },
    centrarCamara(x, z, suave = true) {
      // primer encuadre de la partida: la detective al centro y la Central en el tercio superior
      if (control.demo) { control.centrar(detective.posicion.x + 4, detective.posicion.z + 6, suave); return; }
      control.centrar(x, z, suave);
    },
    datosMinimapa() { return minimapa; },
    vistaCamara() { return control.vista(); },
    // EXTENSIÓN (no está en el contrato original): proyección de las alertas activas en píxeles CSS del canvas.
    // [{ id, x, y, angulo (rad, desde el centro de la pantalla), fuera: boolean, color }]
    // El MUNDO ya dibuja flechas en el borde para las que están fuera de cámara; la INTERFAZ puede usar esto si prefiere su propio estilo.
    indicadoresAlertas() { return indicadores; },
    al(evento, fn) {
      if (!oyentes.has(evento)) oyentes.set(evento, new Set());
      oyentes.get(evento).add(fn);
      return () => oyentes.get(evento).delete(fn);
    }
  };
  return mundo;
}
