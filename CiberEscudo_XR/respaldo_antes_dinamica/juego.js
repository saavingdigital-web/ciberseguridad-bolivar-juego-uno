/* CiberEscudo XR - Motor del juego
 * A-Frame se encarga de la sesión XR y los mandos; los objetos del juego se construyen con three.js.
 */
/* global AFRAME, CASOS_ESTAFA, MENSAJES_ACOSO, ACCIONES_ACOSO, LINEAS_AYUDA, Sonido */
(() => {
  const THREE = AFRAME.THREE;
  const V3 = THREE.Vector3;

  // ===== Ajustes de juego =====
  const CONFIG = {
    duracionFase1: 70,       // s de lluvia de estafas
    duracionAcoso: 28,       // s bloqueando mensajes de acoso
    duracionDecision: 30,    // s para elegir cómo ayudar
    integridadInicial: 100,
    danoEstafa: 20,          // % de firewall que quita una estafa que te alcanza
    puntosBloqueo: 100,
    bonusEscaneo: 50,
    puntosLegitimo: 100,
    penalLegitimo: 100,
    puntosAcoso: 100,
    puntosAccion: 150,
    penalAccion: 50,
    tiempoEscaneo: 0.6       // s apuntando para escanear un mensaje
  };

  const COL = {
    naranja: '#ff9d00', dorado: '#ffcc33', cian: '#00f7ff', verde: '#00ffaa',
    rojo: '#ff3b30', blanco: '#ffffff', gris: '#9fb3c8', fondo: 'rgba(5, 10, 22, 0.86)'
  };
  const F_TIT = 'Orbitron, "Segoe UI", sans-serif';
  const F_TXT = 'Rajdhani, "Segoe UI", Roboto, sans-serif';

  const RANGOS = [
    { min: 3000, nombre: 'ESCUDO LEGENDARIO' },
    { min: 2000, nombre: 'CIBERGUARDIÁN' },
    { min: 1000, nombre: 'AGENTE EN ENTRENAMIENTO' },
    { min: 0, nombre: 'RECLUTA DIGITAL' }
  ];

  // ===== Utilidades =====
  const azar = (a, b) => a + Math.random() * (b - a);
  const barajar = arr => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const sueve = k => 1 - Math.pow(1 - Math.min(Math.max(k, 0), 1), 3);
  const rebote = k => { const c1 = 1.70158, c3 = c1 + 1; k = Math.min(Math.max(k, 0), 1); return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const mmss = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  // ===== Dibujo en canvas (estilo HUD JARVIS) =====
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function lineas(ctx, texto, maxAncho) {
    const res = []; let l = '';
    for (const p of texto.split(' ')) {
      const prueba = l ? `${l} ${p}` : p;
      if (ctx.measureText(prueba).width > maxAncho && l) { res.push(l); l = p; } else l = prueba;
    }
    if (l) res.push(l);
    return res;
  }

  // Ajusta el tamaño de fuente para que el texto quepa en el ancho dado
  function fuenteAjustada(ctx, texto, peso, familia, tamMax, anchoMax) {
    let t = tamMax;
    do { ctx.font = `${peso} ${t}px ${familia}`; t -= 2; } while (ctx.measureText(texto).width > anchoMax && t > 12);
  }

  function marcoHUD(ctx, x, y, w, h, color, relleno = COL.fondo) {
    ctx.save();
    ctx.fillStyle = relleno; rr(ctx, x, y, w, h, 18); ctx.fill();
    // líneas de escaneo holográficas
    ctx.globalAlpha = 0.05; ctx.fillStyle = color;
    for (let yy = y + 4; yy < y + h; yy += 6) ctx.fillRect(x + 4, yy, w - 8, 1);
    ctx.globalAlpha = 0.45; ctx.strokeStyle = color; ctx.lineWidth = 3;
    rr(ctx, x, y, w, h, 18); ctx.stroke();
    // esquinas brillantes
    ctx.globalAlpha = 1; ctx.lineWidth = 7; ctx.shadowColor = color; ctx.shadowBlur = 16;
    const L = Math.min(56, w * 0.15, h * 0.32);
    ctx.beginPath();
    ctx.moveTo(x, y + L); ctx.lineTo(x, y); ctx.lineTo(x + L, y);
    ctx.moveTo(x + w - L, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + L);
    ctx.moveTo(x + w, y + h - L); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - L, y + h);
    ctx.moveTo(x + L, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - L);
    ctx.stroke();
    ctx.restore();
  }

  function texCanvas(canvas) {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  // Plano con textura de canvas que se puede redibujar
  class Panel {
    constructor(anchoM, altoM, px, py) {
      this.canvas = document.createElement('canvas');
      this.canvas.width = px; this.canvas.height = py;
      this.ctx = this.canvas.getContext('2d');
      this.tex = texCanvas(this.canvas);
      this.mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(anchoM, altoM),
        new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthWrite: false, side: THREE.DoubleSide })
      );
      this.mesh.renderOrder = 5;
    }
    dibujar(fn) {
      const { ctx, canvas } = this;
      ctx.save(); ctx.clearRect(0, 0, canvas.width, canvas.height);
      fn(ctx, canvas.width, canvas.height);
      ctx.restore();
      this.tex.needsUpdate = true;
    }
  }

  // Texturas compartidas (no se liberan)
  const compartidas = {};
  function texGlow() {
    if (!compartidas.glow) {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.6)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 128, 128);
      compartidas.glow = texCanvas(c); compartidas.glow.userData.compartida = true;
    }
    return compartidas.glow;
  }
  function texVortice() {
    if (!compartidas.vortice) {
      const c = document.createElement('canvas'); c.width = c.height = 512;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(256, 256, 0, 256, 256, 256);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, 'rgba(0,90,140,0.35)');
      g.addColorStop(0.85, 'rgba(0,247,255,0.9)'); g.addColorStop(1, 'rgba(0,247,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 512, 512);
      x.lineWidth = 5;
      for (let k = 0; k < 6; k++) {
        x.strokeStyle = k % 2 ? 'rgba(255,157,0,0.7)' : 'rgba(0,247,255,0.6)';
        x.beginPath();
        for (let r = 20; r < 240; r += 4) {
          const a = k * Math.PI / 3 + r * 0.025;
          const px = 256 + Math.cos(a) * r, py = 256 + Math.sin(a) * r;
          if (r === 20) x.moveTo(px, py); else x.lineTo(px, py);
        }
        x.stroke();
      }
      x.strokeStyle = 'rgba(255,204,51,0.35)'; x.lineWidth = 2;
      [80, 140, 200].forEach(r => { x.beginPath(); x.arc(256, 256, r, 0, Math.PI * 2); x.stroke(); });
      compartidas.vortice = texCanvas(c); compartidas.vortice.userData.compartida = true;
    }
    return compartidas.vortice;
  }

  function crearGlow(color, escala, opacidad = 1) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texGlow(), color, transparent: true, opacity: opacidad,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    s.scale.setScalar(escala);
    s.raycast = () => {}; // decorativo: el raycaster no debe tocarlo
    return s;
  }

  const matAditivo = (color, opacidad = 1, extra = {}) => new THREE.MeshBasicMaterial(Object.assign({
    color, transparent: true, opacity: opacidad, blending: THREE.AdditiveBlending, depthWrite: false
  }, extra));

  function liberar(obj) {
    obj.traverse(o => {
      // la geometría y los materiales de los modelos GLB se comparten entre clones: no se liberan
      if (o.geometry && !(o.geometry.userData && o.geometry.userData.compartida)) o.geometry.dispose();
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
          if (m.userData && m.userData.compartida) return;
          if (m.map && !m.map.userData.compartida) m.map.dispose();
          m.dispose();
        });
      }
    });
  }

  // ===== Modelos 3D (GLB hechos en Blender) =====
  // Se precargan al arrancar. Si alguno falla, Modelos.clonar() devuelve null y el juego usa la pieza procedural de siempre.
  const Modelos = (() => {
    const ARCHIVOS = {
      dron_mensaje: 'modelos/dron_mensaje.glb',
      portal_marco: 'modelos/portal_marco.glb',
      blaster_cian: 'modelos/blaster_cian.glb',
      blaster_naranja: 'modelos/blaster_naranja.glb',
      amigo_holo: 'modelos/amigo_holo.glb',
      burbuja_acoso: 'modelos/burbuja_acoso.glb',
      escudo_amigo: 'modelos/escudo_amigo.glb',
      accion_tarjeta: 'modelos/accion_tarjeta.glb',
      // kit sci-fi (Quaternius, CC0), convertido a GLB ligero
      alien_cyclop: 'modelos/scifi/alien_cyclop.glb',
      plataforma_mando: 'modelos/scifi/plataforma_mando.glb',
      sala_mando: 'modelos/scifi/sala_mando.glb'
    };
    const KIT = new Set(['alien_cyclop', 'plataforma_mando', 'sala_mando']); // materiales PBR: necesitan luz de entorno
    const proto = {};
    const clips = {};     // animaciones de cada GLB (el alien lleva Alien_Idle)
    const esperas = {};   // funciones a ejecutar cuando un GLB termine de cargar
    const matsKit = [];   // materiales PBR del kit (reciben el mapa de entorno)
    let entorno = null;
    const INTENSIDAD_EMISIVA = 1.6; // sin bloom en realidad mixta: los emisivos deben verse brillantes

    // Ajusta una sola vez los materiales del modelo original (los clones lo heredan)
    function aplicarEntorno(m) {
      if (!entorno || !m.isMeshStandardMaterial) return;
      m.envMap = entorno; m.envMapIntensity = 0.8; m.needsUpdate = true;
    }

    function preparar(raiz, kit = false) {
      raiz.traverse(o => {
        if (!o.isMesh) return;
        if (o.isSkinnedMesh) raiz.userData.esqueleto = true;
        if (o.geometry) o.geometry.userData.compartida = true;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
          m.userData.compartida = true;
          m.side = THREE.DoubleSide;
          const n = m.name || '';
          if (n.startsWith('emisivo')) { m.toneMapped = false; m.emissiveIntensity = INTENSIDAD_EMISIVA; }
          else if (n.startsWith('vidrio')) { m.transparent = true; m.depthWrite = false; }
          if (kit) {
            if (m.isMeshStandardMaterial && !matsKit.includes(m)) { matsKit.push(m); aplicarEntorno(m); }
            if (n === 'M_Alien_Eyes') { // el ojo del alien brilla en cian
              m.emissive.set('#00f7ff'); m.emissiveIntensity = INTENSIDAD_EMISIVA; m.toneMapped = false;
            } else if (m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0.01) {
              m.emissiveIntensity = INTENSIDAD_EMISIVA; m.toneMapped = false; // luces, decals y anillo de la plataforma
            }
          }
        });
      });
    }

    function cargar() {
      const Cargador = THREE.GLTFLoader;
      if (!Cargador) { console.warn('CiberEscudo: GLTFLoader no disponible; se usan las piezas procedurales.'); return; }
      const loader = new Cargador();
      Object.keys(ARCHIVOS).forEach(nombre => {
        try {
          loader.load(ARCHIVOS[nombre], gltf => {
            try {
              preparar(gltf.scene, KIT.has(nombre));
              if (gltf.animations && gltf.animations.length) clips[nombre] = gltf.animations;
              proto[nombre] = gltf.scene;
            } catch (e) { console.warn('CiberEscudo: modelo inválido', nombre, e); return; }
            (esperas[nombre] || []).forEach(f => { try { f(); } catch (e) { console.warn('CiberEscudo: error al montar', nombre, e); } });
          }, undefined, () => console.warn('CiberEscudo: no se pudo cargar el modelo', nombre));
        } catch (e) { console.warn('CiberEscudo: error al pedir el modelo', nombre, e); }
      });
    }

    // Devuelve un clon del grafo (comparte geometría). Con propios=true también clona los materiales
    // (para reteñirlos o cambiarles la opacidad); esos se liberan solos en liberar().
    // Clon de un grafo con esqueleto (equivale a SkeletonUtils.clone, que este A-Frame no incluye):
    // cada clon recibe sus propios huesos y su propio Skeleton, y comparte geometría y materiales.
    function clonarEsqueleto(origen) {
      const c = origen.clone(true);
      const fuentes = [], clones = [];
      origen.traverse(o => fuentes.push(o));
      c.traverse(o => clones.push(o));
      const mapa = new Map();
      fuentes.forEach((o, i) => mapa.set(o, clones[i]));
      fuentes.forEach((o, i) => {
        if (!o.isSkinnedMesh) return;
        const huesos = o.skeleton.bones.map(b => mapa.get(b));
        clones[i].bind(new THREE.Skeleton(huesos, o.skeleton.boneInverses), clones[i].bindMatrix);
      });
      return c;
    }

    // Mezclador de animación para un clon (arranca en un punto al azar del bucle). null si el GLB no trae animación.
    function animar(nombre, raiz, clip) {
      const lista = clips[nombre];
      if (!lista) return null;
      const c = lista.find(k => k.name === clip) || lista[0];
      const mixer = new THREE.AnimationMixer(raiz);
      const accion = mixer.clipAction(c);
      accion.play();
      accion.time = Math.random() * c.duration;
      return mixer;
    }

    // Ejecuta fn cuando el GLB esté listo (ya mismo si ya cargó). Si nunca carga, no se ejecuta.
    function cuando(nombre, fn) {
      if (proto[nombre]) fn(); else (esperas[nombre] = esperas[nombre] || []).push(fn);
    }

    // Mapa de entorno procedural (una sola vez, PMREM) solo para los materiales PBR del kit
    function prepararEntorno(renderer) {
      if (entorno || !renderer) return;
      const esc = new THREE.Scene();
      const geos = [], mats = [];
      const pieza = (geo, color, pos, rx = 0, ry = 0, lado = THREE.FrontSide) => {
        const mat = new THREE.MeshBasicMaterial({ color, side: lado });
        const m = new THREE.Mesh(geo, mat);
        m.position.set(pos[0], pos[1], pos[2]); m.rotation.set(rx, ry, 0);
        esc.add(m); geos.push(geo); mats.push(mat);
      };
      pieza(new THREE.BoxGeometry(12, 8, 12), '#3a4d75', [0, 0, 0], 0, 0, THREE.BackSide);
      pieza(new THREE.PlaneGeometry(12, 12), '#0e131d', [0, -3.9, 0], -Math.PI / 2);
      pieza(new THREE.PlaneGeometry(6, 6), new THREE.Color(5, 5, 5), [0, 3.9, 0], Math.PI / 2);
      pieza(new THREE.PlaneGeometry(8, 1.2), new THREE.Color(0, 2.6, 3), [0, 0.5, -5.9]);
      pieza(new THREE.PlaneGeometry(8, 1.2), new THREE.Color(3, 1.5, 0), [0, 0.5, 5.9], 0, Math.PI);
      const gen = new THREE.PMREMGenerator(renderer);
      try { entorno = gen.fromScene(esc, 0.04).texture; } finally { gen.dispose(); }
      geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose());
      matsKit.forEach(aplicarEntorno);
    }

    function clonar(nombre, propios = false) {
      const p = proto[nombre];
      if (!p) return null;
      const c = p.userData.esqueleto ? clonarEsqueleto(p) : p.clone(true);
      if (propios) {
        const mapa = new Map();
        const propio = m => {
          if (!mapa.has(m)) { const k = m.clone(); k.userData = { compartida: false }; mapa.set(m, k); }
          return mapa.get(m);
        };
        c.traverse(o => {
          if (!o.isMesh) return;
          o.material = Array.isArray(o.material) ? o.material.map(propio) : propio(o.material);
        });
      }
      return c;
    }

    // Materiales distintos de un clon con materiales propios
    function materiales(c) {
      const res = new Set();
      c.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => res.add(m)); });
      return [...res];
    }
    function nodo(c, nombre) { return c.getObjectByName(nombre) || null; }

    cargar();
    return { clonar, materiales, nodo, animar, cuando, prepararEntorno, listo: nombre => !!proto[nombre] };
  })();
  const INTENSIDAD_EMISIVA_AMIGO = 1.6;
  const BLANCO = new THREE.Color('#ffffff');

  // ===== Ranking (se guarda en el propio casco) =====
  const CLAVE_RANKING = 'ciberescudo_ranking';
  const CLAVE_AGENTES = 'ciberescudo_agentes';
  function leerJSON(clave, defecto) {
    try { const v = localStorage.getItem(clave); return v ? JSON.parse(v) : defecto; } catch (e) { return defecto; }
  }
  function guardarJSON(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
  }

  // =====================================================================
  AFRAME.registerComponent('juego', {
    init() {
      this.raiz = new THREE.Group();
      this.el.object3D.add(this.raiz);
      this.contenedor = document.getElementById('contenedor');
      this.manos = ['mano-izq', 'mano-der'].map(id => document.getElementById(id));

      this.objetivos = []; this.efectos = [];
      this.drones = []; this.portales = []; this.burbujas = []; this.acciones = []; this.botones = [];
      this.amigo = null; this.resultados = null;
      this.fase = 'menu'; this.tFase = 0;
      this.puntos = 0; this.combo = 0; this.integridad = CONFIG.integridadInicial;

      this.camPos = new V3(0, 1.6, 0); this.camDir = new V3(0, 0, -1);
      this.mouse = new THREE.Vector2(); this.mouseActivo = false;
      this.rayEscritorio = new THREE.Raycaster();

      this.crearVisor();
      this.crearVineta();
      this.crearEntornoVirtual();
      this.plataforma = null; this.sala = null;

      // Luz para los materiales PBR del kit: hemisférica barata, sin sombras, más un mapa de entorno solo para el kit
      this.el.object3D.add(new THREE.HemisphereLight('#9db8e0', '#1a2438', 0.55));
      const montarEntorno = () => {
        try { Modelos.prepararEntorno(this.el.renderer); } catch (e) { console.warn('CiberEscudo: sin mapa de entorno', e); }
      };
      if (this.el.renderer) montarEntorno(); else this.el.addEventListener('renderstart', montarEntorno, { once: true });
      Modelos.cuando('sala_mando', () => this.montarSala());
      Modelos.cuando('plataforma_mando', () => { if (this.fase !== 'menu') this.colocarEscenario(); });

      this.manos.forEach(m => {
        m.addEventListener('triggerdown', () => this.disparar(m));
        m.addEventListener('controllerconnected', () => {
          m.setAttribute('visible', true); // muestra la mano en primera persona
          setTimeout(() => this.montarBlaster(m), 100);
        });
      });

      this.el.addEventListener('renderstart', () => {
        const cv = this.el.canvas;
        cv.addEventListener('mousemove', e => this.leerMouse(e));
        cv.addEventListener('mousedown', e => { this.leerMouse(e); this.dispararEscritorio(); });
        cv.addEventListener('mouseleave', () => { this.mouseActivo = false; });
      });

      this.el.addEventListener('enter-vr', () => {
        if (this.esperandoXR) {
          this.esperandoXR = false;
          setTimeout(() => this.mostrarInicio(), 700); // espera a tener la pose real del casco
        }
      });
      this.el.addEventListener('exit-vr', () => {
        this.manos.forEach(m => m.setAttribute('visible', false));
        this.volverAlMenu();
      });

      if (document.fonts) {
        Promise.all([
          document.fonts.load(`900 40px Orbitron`),
          document.fonts.load(`600 40px Rajdhani`),
          document.fonts.load(`700 40px Rajdhani`)
        ]).then(() => this.dibujarHUD()).catch(() => {});
      }
      window.juego = this; // útil para depurar desde la consola
    },

    // ---------- Entrada desde el menú ----------
    activar(modo) {
      Sonido.iniciar();
      document.getElementById('menu').classList.add('oculto');
      this.modo = modo;
      if (modo === 'pantalla') this.mostrarInicio();
      else this.esperandoXR = true;
    },

    volverAlMenu() {
      this.limpiarTodo();
      this.fase = 'menu';
      this.visor.visible = false;
      if (this.plataforma) this.plataforma.visible = false;
      Sonido.musica.detener();
      document.getElementById('menu').classList.remove('oculto');
    },

    // ---------- Cámara y entrada ----------
    actualizarCamara() {
      const cam = this.el.camera;
      if (!cam) return;
      cam.getWorldPosition(this.camPos);
      cam.getWorldDirection(this.camDir);
    },
    frenteHorizontal() {
      const v = this.camDir.clone(); v.y = 0;
      if (v.lengthSq() < 1e-4) v.set(0, 0, -1);
      return v.normalize();
    },
    puntoFrente(dist, dy = 0, angulo = 0) {
      const f = this.frenteHorizontal().applyAxisAngle(new V3(0, 1, 0), angulo);
      return this.camPos.clone().addScaledVector(f, dist).add(new V3(0, dy, 0));
    },
    leerMouse(e) {
      const r = this.el.canvas.getBoundingClientRect();
      this.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.mouseActivo = true;
    },
    datosDe(obj) {
      while (obj) {
        if (obj.el && obj.el.datosJuego) return obj.el.datosJuego;
        obj = obj.parent;
      }
      return null;
    },
    vibrar(mano, fuerza = 0.5, ms = 50) {
      try {
        const tc = mano.components['tracked-controls'];
        const src = tc && tc.controller;
        const act = src && src.gamepad && src.gamepad.hapticActuators && src.gamepad.hapticActuators[0];
        if (act) act.pulse(fuerza, ms);
      } catch (e) { /* sin vibración */ }
    },
    vibrarAmbas(fuerza, ms) { this.manos.forEach(m => this.vibrar(m, fuerza, ms)); },

    // ---------- Blaster en cada mando ----------
    montarBlaster(mano) {
      if (mano.blaster) return;
      const rc = mano.components.raycaster;
      const dir = rc ? new V3(rc.data.direction.x, rc.data.direction.y, rc.data.direction.z).normalize() : new V3(0, 0, -1);
      const ori = rc ? rc.data.origin : { x: 0, y: 0, z: 0 };
      const acento = mano.id === 'mano-izq' ? COL.cian : COL.naranja;

      const g = new THREE.Group();
      const punta = new THREE.Object3D();
      const modelo = Modelos.clonar(mano.id === 'mano-izq' ? 'blaster_cian' : 'blaster_naranja');
      if (modelo) {
        // el GLB apunta el cañón a +Z; el juego lo apunta a -Z, así que se gira 180° en Y
        modelo.rotation.y = Math.PI;
        punta.position.z = -0.203;
        g.add(modelo, punta);
      } else {
        const metal = new THREE.MeshStandardMaterial({ color: '#2a3142', metalness: 0.7, roughness: 0.35 });
        const brillo = new THREE.MeshStandardMaterial({ color: acento, emissive: acento, emissiveIntensity: 1.4 });
        const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.046, 0.12), metal);
        cuerpo.position.z = -0.03;
        const canon = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.014, 0.12, 12), metal);
        canon.rotation.x = Math.PI / 2; canon.position.z = -0.14;
        const celda = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.07), brillo);
        celda.position.set(0, 0.028, -0.03);
        [-0.11, -0.17].forEach(z => {
          const aro = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.004, 6, 18), brillo);
          aro.position.z = z; g.add(aro);
        });
        punta.position.z = -0.21;
        g.add(cuerpo, canon, celda, punta);
      }
      const boca = crearGlow(acento, 0.001, 0);
      punta.add(boca);
      g.quaternion.setFromUnitVectors(new V3(0, 0, -1), dir);
      g.position.set(ori.x, ori.y, ori.z);
      g.punta = punta; g.boca = boca;
      mano.object3D.add(g);
      mano.blaster = g;
    },

    // ---------- Disparo ----------
    disparar(mano) {
      if (this.fase === 'menu') return;
      const rc = mano.components.raycaster;
      if (!rc || !rc.raycaster) return;
      const ray = rc.raycaster.ray;
      const inter = (rc.intersections || [])[0];
      const desde = new V3();
      if (mano.blaster) mano.blaster.punta.getWorldPosition(desde); else desde.copy(ray.origin);
      const hasta = inter ? inter.point.clone() : ray.origin.clone().addScaledVector(ray.direction, 12);
      const color = mano.id === 'mano-izq' ? COL.cian : COL.naranja;
      this.efectoRayo(desde, hasta, color);
      if (mano.blaster) this.fogonazo(mano.blaster.boca);
      Sonido.disparo();
      this.vibrar(mano, 0.35, 35);
      if (inter) this.impacto(this.datosDe(inter.object), inter.point.clone(), mano);
    },

    dispararEscritorio() {
      if (this.fase === 'menu' || this.el.is('vr-mode') || !this.el.camera) return;
      this.rayEscritorio.setFromCamera(this.mouse, this.el.camera);
      const hits = this.rayEscritorio.intersectObjects(this.objetivos.map(o => o.ent.object3D), true);
      const desde = this.camPos.clone().add(new V3(0, -0.22, 0)).addScaledVector(this.camDir, 0.35);
      const ray = this.rayEscritorio.ray;
      const hasta = hits[0] ? hits[0].point.clone() : ray.origin.clone().addScaledVector(ray.direction, 12);
      this.efectoRayo(desde, hasta, COL.naranja);
      Sonido.disparo();
      if (hits[0]) this.impacto(this.datosDe(hits[0].object), hits[0].point.clone(), null);
    },

    impacto(d, punto, mano) {
      if (!d || !d.vivo) return;
      if (d.tipo === 'boton') this.pulsarBoton(d);
      else if (d.tipo === 'drone') this.dispararDrone(d, mano);
      else if (d.tipo === 'burbuja') this.dispararBurbuja(d, mano);
      else if (d.tipo === 'accion') this.dispararAccion(d, mano);
    },

    // Qué está apuntando cada mando (para escanear y resaltar)
    actualizarApuntado(dt) {
      const apuntados = new Set();
      if (this.el.is('vr-mode')) {
        this.manos.forEach(m => {
          if (!m.blaster) return;
          const rc = m.components.raycaster;
          const i = rc && rc.intersections && rc.intersections[0];
          const d = i && this.datosDe(i.object);
          if (d && d.vivo) { apuntados.add(d); d.manoApuntando = m; }
        });
      } else if (this.mouseActivo && this.el.camera && this.objetivos.length) {
        this.rayEscritorio.setFromCamera(this.mouse, this.el.camera);
        const hits = this.rayEscritorio.intersectObjects(this.objetivos.map(o => o.ent.object3D), true);
        const d = hits[0] && this.datosDe(hits[0].object);
        if (d && d.vivo) { apuntados.add(d); d.manoApuntando = null; }
      }
      this.objetivos.forEach(d => { d.apuntado = apuntados.has(d); });

      apuntados.forEach(d => {
        if (d.tipo !== 'drone' || d.revelado) return;
        d.escaneo = Math.min(1, d.escaneo + dt / CONFIG.tiempoEscaneo);
        if (d.escaneo >= 1) {
          d.revelado = true;
          this.stats.escaneos++;
          Sonido.escaneo();
          if (d.manoApuntando) this.vibrar(d.manoApuntando, 0.2, 30);
          this.dibujarPanelDrone(d);
        } else if (d.escaneo - d.escaneoDibujado > 0.1) {
          this.dibujarPanelDrone(d);
        }
      });
    },

    // ---------- Objetivos (entidades que el raycaster puede tocar) ----------
    crearObjetivo(tipo, grupo, datos) {
      const ent = document.createElement('a-entity');
      ent.classList.add('disparable');
      ent.setObject3D('mesh', grupo);
      this.contenedor.appendChild(ent);
      const d = Object.assign({ tipo, ent, grupo, vivo: true, apuntado: false, t: 0 }, datos);
      ent.datosJuego = d;
      this.objetivos.push(d);
      return d;
    },
    desactivar(d) {
      d.vivo = false;
      const i = this.objetivos.indexOf(d);
      if (i >= 0) this.objetivos.splice(i, 1);
    },
    retirar(d) {
      this.desactivar(d);
      if (d.ent.parentNode) d.ent.parentNode.removeChild(d.ent);
      liberar(d.grupo);
    },
    zonaColision(ancho, alto, fondo) {
      return new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, fondo), new THREE.MeshBasicMaterial({ visible: false }));
    },

    // ---------- Visor HUD que sigue la mirada suavemente ----------
    crearVisor() {
      this.visor = new THREE.Group();
      this.visor.visible = false;
      this.raiz.add(this.visor);
      this.hud = new Panel(1.5, 0.15, 1400, 140);
      this.hud.mesh.position.set(0, 0.8, 0);
      this.banner = new Panel(1.6, 0.62, 1280, 496);
      this.banner.mesh.position.set(0, 0.24, 0);
      this.banner.mesh.visible = false;
      this.visor.add(this.hud.mesh, this.banner.mesh);
      this.hudTitulo = 'CIBERESCUDO XR'; this.hudObjetivo = ''; this.hudTiempo = null;
    },

    actualizarVisor(dt) {
      if (!this.visor.visible) return;
      const obj = this.puntoFrente(2.4, -0.15);
      if (!this.visorListo) { this.visor.position.copy(obj); this.visorListo = true; }
      else this.visor.position.lerp(obj, 1 - Math.exp(-dt * 2.2));
      this.visor.lookAt(this.camPos.x, this.visor.position.y, this.camPos.z);

      const b = this.banner.mesh;
      if (b.visible) {
        this.bannerT += dt;
        if (this.bannerDur > 0) {
          const quedan = this.bannerDur - this.bannerT;
          b.material.opacity = Math.max(0, Math.min(1, this.bannerT * 4, quedan * 2.5));
          if (quedan <= 0) b.visible = false;
        } else {
          b.material.opacity = Math.min(1, this.bannerT * 4);
        }
      }
    },

    mostrarBanner(titulo, sub, color = COL.naranja, dur = 3.5) {
      this.banner.dibujar((ctx, w, h) => {
        marcoHUD(ctx, 8, 8, w - 16, h - 16, color, 'rgba(4, 8, 18, 0.84)');
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = color; ctx.shadowBlur = 26; ctx.fillStyle = color;
        fuenteAjustada(ctx, titulo, 900, F_TIT, titulo.length <= 3 ? 190 : 84, w - 100);
        ctx.fillText(titulo, w / 2, sub ? 150 : h / 2);
        ctx.shadowBlur = 0;
        if (sub) {
          ctx.fillStyle = COL.blanco; ctx.font = `600 46px ${F_TXT}`;
          lineas(ctx, sub, w - 120).slice(0, 4).forEach((l, i) => ctx.fillText(l, w / 2, 280 + i * 54));
        }
      });
      this.banner.mesh.visible = true;
      this.banner.mesh.material.opacity = 0;
      this.bannerT = 0; this.bannerDur = dur;
    },
    ocultarBanner() { this.banner.mesh.visible = false; },

    marcarHUD() { this.hudSucio = true; },
    dibujarHUD() {
      this.hudSucio = false;
      this.hud.dibujar((ctx, w, h) => {
        marcoHUD(ctx, 4, 4, w - 8, h - 8, COL.naranja);
        ctx.textBaseline = 'middle';
        ctx.fillStyle = COL.naranja; fuenteAjustada(ctx, this.hudTitulo, 700, F_TIT, 30, 640);
        ctx.fillText(this.hudTitulo, 34, 46);
        ctx.fillStyle = COL.blanco; fuenteAjustada(ctx, this.hudObjetivo, 600, F_TXT, 32, 640);
        ctx.fillText(this.hudObjetivo, 34, 98);

        if (this.hudTiempo != null) {
          ctx.textAlign = 'center';
          ctx.fillStyle = this.hudTiempo <= 10 ? COL.rojo : COL.cian;
          ctx.font = `900 54px ${F_TIT}`;
          ctx.fillText(mmss(this.hudTiempo), 830, 62);
          if (this.combo > 1) {
            ctx.fillStyle = COL.dorado; ctx.font = `700 24px ${F_TIT}`;
            ctx.fillText(`COMBO x${this.combo}`, 830, 112);
          }
        }

        ctx.textAlign = 'left'; ctx.fillStyle = COL.gris; ctx.font = `700 26px ${F_TXT}`;
        ctx.fillText('PUNTOS', w - 330, 48);
        ctx.textAlign = 'right'; ctx.fillStyle = COL.dorado; ctx.font = `900 42px ${F_TIT}`;
        ctx.fillText(String(this.puntos), w - 34, 48);

        if (this.fase === 'fase1' || this.fase === 'cuenta') {
          const x0 = w - 330, ancho = 296, k = this.integridad / CONFIG.integridadInicial;
          ctx.textAlign = 'left'; ctx.fillStyle = COL.gris; ctx.font = `700 22px ${F_TXT}`;
          ctx.fillText('FIREWALL', x0 - 110, 100);
          ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x0, 90, ancho, 20);
          ctx.fillStyle = k > 0.4 ? COL.verde : COL.rojo;
          ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
          ctx.fillRect(x0, 90, ancho * k, 20);
        }
      });
    },

    // Viñeta roja pegada a la cámara cuando una estafa te alcanza
    crearVineta() {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(128, 128, 40, 128, 128, 128);
      g.addColorStop(0, 'rgba(255,0,0,0)'); g.addColorStop(1, 'rgba(255,30,30,0.95)');
      x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      this.vineta = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({
        map: texCanvas(c), transparent: true, opacity: 0, depthTest: false, depthWrite: false
      }));
      this.vineta.position.z = -0.3;
      this.vineta.renderOrder = 999;
      this.vinetaT = 0;
    },
    flashDano() { this.vinetaT = 1; },

    // Entorno para modo VR / pantalla (se oculta en realidad mixta)
    crearEntornoVirtual() {
      const ent = document.getElementById('entorno');
      if (!ent) return;
      const g = new THREE.Group();
      const piso = new THREE.Mesh(new THREE.PlaneGeometry(40, 40, 40, 40),
        new THREE.MeshBasicMaterial({ color: COL.cian, wireframe: true, transparent: true, opacity: 0.12 }));
      piso.rotation.x = -Math.PI / 2;
      const anillo = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.24, 64), matAditivo(COL.naranja, 0.6, { side: THREE.DoubleSide }));
      anillo.rotation.x = -Math.PI / 2; anillo.position.y = 0.01;
      const n = 600, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const v = new V3(azar(-1, 1), azar(0.05, 1), azar(-1, 1)).normalize().multiplyScalar(45);
        pos.set([v.x, v.y, v.z], i * 3);
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const estrellas = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#88ccff', size: 0.25, transparent: true, opacity: 0.7 }));
      g.add(piso, anillo, estrellas);
      this.entornoFondo = [piso];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 6, 0.08), matAditivo(i % 2 ? COL.cian : COL.naranja, 0.35));
        pilar.position.set(Math.cos(a) * 12, 3, Math.sin(a) * 12);
        g.add(pilar); this.entornoFondo.push(pilar);
      }
      ent.object3D.add(g);
    },

    // Sala de mando (solo VR y pantalla: cuelga de #entorno, que se oculta en realidad mixta).
    // Al montarla se retiran la cuadrícula y los pilares; si el GLB falla, el entorno de siempre se queda.
    montarSala() {
      const ent = document.getElementById('entorno');
      const sala = Modelos.clonar('sala_mando');
      if (!ent || !sala || this.sala) return;
      this.sala = sala;
      ent.object3D.add(sala);
      (this.entornoFondo || []).forEach(o => { if (o.parent) o.parent.remove(o); liberar(o); });
      this.entornoFondo = [];
      if (this.fase !== 'menu') this.colocarEscenario();
    },

    // Plataforma bajo el jugador (todos los modos) y sala centrada en el mismo punto (solo se ve fuera de AR)
    colocarEscenario() {
      const x = this.camPos.x, z = this.camPos.z;
      if (!this.plataforma) {
        const p = Modelos.clonar('plataforma_mando');
        if (p) { this.plataforma = p; this.raiz.add(p); }
      }
      if (this.plataforma) { this.plataforma.position.set(x, 0, z); this.plataforma.visible = true; }
      if (this.sala) {
        const f = this.frenteHorizontal();
        this.sala.position.set(x, 0, z);
        this.sala.rotation.y = Math.atan2(-f.x, -f.z); // la pared del logo (-Z del modelo) queda delante
      }
    },

    // ---------- Efectos visuales ----------
    agregarEfecto(obj, dur, actualizar, padre = this.raiz) {
      if (obj) padre.add(obj);
      this.efectos.push({ obj, dur, t: 0, actualizar, padre });
    },
    actualizarEfectos(dt) {
      for (let i = this.efectos.length - 1; i >= 0; i--) {
        const e = this.efectos[i];
        e.t += dt;
        const k = Math.min(1, e.t / e.dur);
        e.actualizar(k, dt);
        if (k >= 1) {
          if (e.obj) { e.padre.remove(e.obj); liberar(e.obj); }
          this.efectos.splice(i, 1);
        }
      }
    },

    efectoRayo(desde, hasta, color) {
      const dir = hasta.clone().sub(desde);
      const largo = Math.max(dir.length(), 0.01);
      const g = new THREE.Group();
      g.position.copy(desde);
      g.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.normalize());
      const geoN = new THREE.CylinderGeometry(0.006, 0.006, largo, 6, 1, true); geoN.translate(0, largo / 2, 0);
      const geoE = new THREE.CylinderGeometry(0.024, 0.024, largo, 8, 1, true); geoE.translate(0, largo / 2, 0);
      const nucleo = new THREE.Mesh(geoN, matAditivo('#ffffff', 1));
      const exterior = new THREE.Mesh(geoE, matAditivo(color, 0.55));
      g.add(nucleo, exterior);
      const chispa = crearGlow(color, 0.5);
      chispa.position.set(0, largo, 0);
      g.add(chispa);
      this.agregarEfecto(g, 0.2, k => {
        nucleo.material.opacity = 1 - k;
        exterior.material.opacity = 0.55 * (1 - k);
        exterior.scale.set(1 + k * 2, 1, 1 + k * 2);
        chispa.material.opacity = 1 - k;
      });
    },

    fogonazo(boca) {
      this.agregarEfecto(null, 0.12, k => {
        boca.material.opacity = 1 - k;
        boca.scale.setScalar(0.14 * (1 - k * 0.5));
      });
    },

    explosion(pos, color, n = 50, escombros = true) {
      const g = new THREE.Group();
      const posiciones = new Float32Array(n * 3), vel = [];
      for (let i = 0; i < n; i++) {
        posiciones.set([pos.x, pos.y, pos.z], i * 3);
        vel.push(new V3(azar(-1, 1), azar(-1, 1), azar(-1, 1)).normalize().multiplyScalar(azar(1.2, 3.6)));
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
      const matP = new THREE.PointsMaterial({
        color, size: 0.07, map: texGlow(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      });
      const puntos = new THREE.Points(geo, matP);
      const anillo = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.15, 40), matAditivo(color, 1, { side: THREE.DoubleSide }));
      anillo.position.copy(pos); anillo.lookAt(this.camPos);
      const flash = crearGlow('#ffffff', 1.0);
      flash.position.copy(pos);
      g.add(puntos, anillo, flash);

      // cerca de la cara la onda crece menos, para no tapar la vista
      const crecimiento = 7 * Math.min(1, pos.distanceTo(this.camPos) / 3);
      const piezas = [];
      if (escombros) {
        const matE = new THREE.MeshStandardMaterial({ color: '#1a2340', emissive: color, emissiveIntensity: 0.9, flatShading: true });
        for (let i = 0; i < 8; i++) {
          const p = new THREE.Mesh(new THREE.TetrahedronGeometry(azar(0.025, 0.05)), matE);
          p.position.copy(pos);
          p.userData.v = new V3(azar(-1, 1), azar(0, 1.5), azar(-1, 1)).multiplyScalar(azar(1, 2.2));
          p.userData.r = new V3(azar(-8, 8), azar(-8, 8), azar(-8, 8));
          piezas.push(p); g.add(p);
        }
      }
      this.agregarEfecto(g, 1.1, (k, dt) => {
        const arr = geo.attributes.position.array;
        for (let i = 0; i < n; i++) {
          vel[i].multiplyScalar(1 - dt * 2.6); vel[i].y -= 0.8 * dt;
          arr[i * 3] += vel[i].x * dt; arr[i * 3 + 1] += vel[i].y * dt; arr[i * 3 + 2] += vel[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        matP.opacity = 1 - k;
        anillo.scale.setScalar(1 + k * crecimiento); anillo.material.opacity = 1 - k;
        flash.material.opacity = Math.max(0, 1 - k * 4);
        piezas.forEach(p => {
          p.userData.v.y -= 3 * dt;
          p.position.addScaledVector(p.userData.v, dt);
          p.rotation.x += p.userData.r.x * dt; p.rotation.y += p.userData.r.y * dt;
          p.scale.setScalar(1 - k);
        });
      });
    },

    absorber(pos, color) {
      const g = new THREE.Group();
      const anillo = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.34, 40), matAditivo(color, 1, { side: THREE.DoubleSide }));
      anillo.position.copy(pos); anillo.lookAt(this.camPos);
      const brillo = crearGlow(color, 0.8); brillo.position.copy(pos);
      g.add(anillo, brillo);
      this.agregarEfecto(g, 0.6, k => {
        anillo.scale.setScalar(1 - k * 0.9); anillo.material.opacity = 1 - k;
        brillo.material.opacity = 1 - k; brillo.scale.setScalar(0.8 + k);
      });
    },

    textoFlotante(pos, titulo, detalle, color) {
      const p = new Panel(1.25, 0.34, 1000, 272);
      p.dibujar((ctx, w, h) => {
        ctx.fillStyle = 'rgba(4, 8, 18, 0.72)'; rr(ctx, 6, 6, w - 12, h - 12, 26); ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 4; rr(ctx, 6, 6, w - 12, h - 12, 26); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = color; ctx.shadowBlur = 22; ctx.fillStyle = color;
        fuenteAjustada(ctx, titulo, 900, F_TIT, 62, w - 60);
        ctx.fillText(titulo, w / 2, 76);
        ctx.shadowBlur = 0;
        if (detalle) {
          ctx.fillStyle = COL.blanco; ctx.font = `700 42px ${F_TXT}`;
          lineas(ctx, detalle, w - 70).slice(0, 2).forEach((l, i) => ctx.fillText(l, w / 2, 168 + i * 50));
        }
      });
      // No dejar el texto pegado a la cara
      const p0 = pos.clone();
      const dist = p0.distanceTo(this.camPos);
      if (dist < 1.7) p0.copy(this.camPos).addScaledVector(pos.clone().sub(this.camPos).normalize(), 1.7);
      p0.y += 0.15 + (this.textosActivos || 0) * 0.12;
      p.mesh.position.copy(p0);
      p.mesh.renderOrder = 10;
      this.textosActivos = (this.textosActivos || 0) + 1;
      let liberado = false;
      this.agregarEfecto(p.mesh, 3.2, (k, dt) => {
        p.mesh.position.y += dt * 0.07;
        p.mesh.lookAt(this.camPos);
        p.mesh.material.opacity = Math.min(1, k * 10, (1 - k) * 4);
        if (k >= 1 && !liberado) { liberado = true; this.textosActivos--; }
      });
    },

    sumar(n) { this.puntos = Math.max(0, this.puntos + n); this.marcarHUD(); },
    acertar() { this.combo++; this.marcarHUD(); return Math.min(this.combo - 1, 5) * 25; },
    fallar() { this.combo = 0; this.marcarHUD(); },

    // ---------- Botones holográficos ----------
    crearBoton(texto, pos, color, al) {
      const g = new THREE.Group();
      g.position.copy(pos);
      const p = new Panel(0.95, 0.25, 950, 250);
      p.dibujar((ctx, w, h) => {
        marcoHUD(ctx, 8, 8, w - 16, h - 16, color, 'rgba(8, 14, 28, 0.9)');
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = color; ctx.shadowBlur = 20; ctx.fillStyle = color;
        fuenteAjustada(ctx, texto, 900, F_TIT, 64, w - 80);
        ctx.fillText(texto, w / 2, h / 2 + 4);
      });
      const brillo = crearGlow(color, 1.5, 0.35);
      brillo.position.z = -0.05;
      const aro = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.006, 6, 64), matAditivo(color, 0.6));
      aro.scale.y = 0.32;
      g.add(brillo, aro, p.mesh, this.zonaColision(1.0, 0.3, 0.08));
      const d = this.crearObjetivo('boton', g, { al, base: pos.clone(), aro, panel: p });
      this.botones.push(d);
      return d;
    },
    pulsarBoton(d) {
      Sonido.clic();
      this.explosion(d.grupo.position.clone(), COL.cian, 40, false);
      this.retirarBotones();
      d.al();
    },
    retirarBotones() {
      this.botones.forEach(b => this.retirar(b));
      this.botones = [];
    },
    actualizarBotones(dt) {
      this.botones.forEach(b => {
        b.t += dt;
        b.grupo.position.copy(b.base).add(new V3(0, Math.sin(b.t * 2) * 0.03, 0));
        b.grupo.lookAt(this.camPos);
        const s = sueve(b.t / 0.5) * (b.apuntado ? 1.08 : 1);
        b.grupo.scale.setScalar(Math.max(0.001, s));
        b.aro.rotation.z += dt * (b.apuntado ? 3 : 1);
      });
    },

    // ---------- Portales en las paredes ----------
    detectarParedes() {
      const res = [];
      try {
        const frame = this.el.frame;
        const ref = this.el.renderer.xr.getReferenceSpace();
        if (!frame || !frame.detectedPlanes || !ref) return res;
        frame.detectedPlanes.forEach(plano => {
          if (plano.orientation !== 'vertical' || !plano.polygon || !plano.polygon.length) return;
          const pose = frame.getPose(plano.planeSpace, ref);
          if (!pose) return;
          const m = new THREE.Matrix4().fromArray(pose.transform.matrix);
          let cx = 0, cz = 0, minX = Infinity, maxX = -Infinity;
          plano.polygon.forEach(p => { cx += p.x; cz += p.z; minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); });
          cx /= plano.polygon.length; cz /= plano.polygon.length;
          const centro = new V3(cx, 0, cz).applyMatrix4(m);
          const normal = new V3(0, 1, 0).transformDirection(m);
          normal.y = 0; normal.normalize();
          const haciaCam = this.camPos.clone().sub(centro); haciaCam.y = 0;
          if (normal.dot(haciaCam) < 0) normal.negate();
          res.push({ centro, normal, ancho: maxX - minX, dist: haciaCam.length() });
        });
      } catch (e) { /* sin detección de planos */ }
      return res;
    },

    abrirPortales() {
      const fr = this.frenteHorizontal();
      const alto = Math.max(1.3, this.camPos.y + 0.1);
      const elegidos = [];
      const paredes = this.detectarParedes()
        .filter(p => p.dist > 1.5 && p.dist < 8 && p.ancho > 0.9)
        .map(p => {
          const dir = p.centro.clone().sub(this.camPos); dir.y = 0; dir.normalize();
          return Object.assign(p, { frente: dir.dot(fr) });
        })
        .filter(p => p.frente > -0.3)
        .sort((a, b) => b.frente - a.frente);
      paredes.forEach(p => {
        if (elegidos.length >= 3) return;
        if (elegidos.some(e => e.pos.distanceTo(p.centro) < 1.6)) return;
        const pos = p.centro.clone(); pos.y = alto;
        pos.addScaledVector(p.normal, 0.04);
        elegidos.push({ pos, normal: p.normal });
      });
      this.usandoParedes = elegidos.length >= 2;
      if (!this.usandoParedes) {
        elegidos.length = 0;
        [-0.9, 0, 0.9].forEach(a => {
          const dir = fr.clone().applyAxisAngle(new V3(0, 1, 0), a);
          const pos = this.camPos.clone().addScaledVector(dir, 3.8); pos.y = alto;
          elegidos.push({ pos, normal: dir.clone().negate() });
        });
      }
      elegidos.forEach(e => this.crearPortal(e.pos, e.normal));
      Sonido.portal();
    },

    crearPortal(pos, normal) {
      const g = new THREE.Group();
      g.position.copy(pos);
      g.lookAt(pos.clone().add(normal));
      const marco = Modelos.clonar('portal_marco');
      const rv = marco ? 0.4 : 0.5; // con el marco GLB el hueco libre es de 0.83 m de diámetro
      const hueco = new THREE.Mesh(new THREE.CircleGeometry(rv, 48), new THREE.MeshBasicMaterial({ color: '#02040a' }));
      const vortice = new THREE.Mesh(new THREE.CircleGeometry(rv, 48), new THREE.MeshBasicMaterial({
        map: texVortice(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      vortice.position.z = 0.005;
      let aro = marco && Modelos.nodo(marco, 'aro_exterior');
      let aro2 = marco && Modelos.nodo(marco, 'aro_interior');
      let marcas = marco && Modelos.nodo(marco, 'marcas');
      const brillo = crearGlow(COL.naranja, 2.2, 0.5);
      brillo.position.z = -0.02;
      if (aro && aro2 && marcas) {
        g.add(brillo, hueco, vortice, marco); // los tres nodos giran sobre su eje Z local
      } else {
        aro = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.026, 8, 64), new THREE.MeshBasicMaterial({ color: COL.naranja }));
        aro2 = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.008, 6, 64), matAditivo(COL.cian, 0.85));
        marcas = new THREE.Group();
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: COL.dorado }));
          m.position.set(Math.cos(a) * 0.7, Math.sin(a) * 0.7, 0); m.rotation.z = a;
          marcas.add(m);
        }
        g.add(brillo, hueco, vortice, aro, aro2, marcas);
      }
      g.scale.setScalar(0.001);
      this.raiz.add(g);
      this.portales.push({ grupo: g, normal: normal.clone(), aro, aro2, marcas, vortice, t: 0, pulso: 0, escala: 0, cerrando: false });
    },

    actualizarPortales(dt) {
      for (let i = this.portales.length - 1; i >= 0; i--) {
        const p = this.portales[i];
        p.t += dt;
        p.escala = p.cerrando ? Math.max(0, p.escala - dt * 2.5) : rebote(p.t / 0.9);
        p.pulso = Math.max(0, p.pulso - dt * 2.5);
        p.grupo.scale.setScalar(Math.max(0.001, p.escala * (1 + p.pulso * 0.18)));
        p.aro.rotation.z += dt * 0.6;
        p.aro2.rotation.z -= dt * 1.3;
        p.marcas.rotation.z += dt * 0.25;
        p.vortice.rotation.z += dt * (2 + p.pulso * 6);
        if (p.cerrando && p.escala <= 0) {
          this.raiz.remove(p.grupo); liberar(p.grupo);
          this.portales.splice(i, 1);
        }
      }
    },
    cerrarPortales() { this.portales.forEach(p => { p.cerrando = true; }); },

    // ---------- FASE 1: drones con mensajes ----------
    siguienteCaso() {
      if (!this.mazo || !this.mazo.length) {
        this.mazo = barajar(CASOS_ESTAFA);
        if (this.primerMazo) {
          // la primera amenaza siempre es una estafa clara, para aprender a disparar
          const i = this.mazo.findIndex(c => c.esEstafa);
          this.mazo.push(this.mazo.splice(i, 1)[0]);
          this.primerMazo = false;
        }
      }
      return this.mazo.pop();
    },

    lanzarDrone() {
      if (!this.portales.length) return;
      const caso = this.siguienteCaso();
      let idx = Math.floor(Math.random() * this.portales.length);
      if (idx === this.ultimoPortal && this.portales.length > 1) idx = (idx + 1) % this.portales.length;
      this.ultimoPortal = idx;
      const portal = this.portales[idx];
      portal.pulso = 1;

      const origen = portal.grupo.position.clone().addScaledVector(portal.normal, 0.2);
      const haciaJugador = this.camPos.clone().sub(origen); haciaJugador.y = 0; haciaJugador.normalize();
      const lateral = new V3(-haciaJugador.z, 0, haciaJugador.x).multiplyScalar(azar(-0.45, 0.45));
      const destino = this.camPos.clone().addScaledVector(haciaJugador, -1.05).add(lateral);
      destino.y = this.camPos.y + azar(-0.25, 0.05);
      const duracion = THREE.MathUtils.clamp(origen.distanceTo(destino) / 0.24, 9, 15);

      const g = new THREE.Group();
      g.position.copy(origen);
      const brillo = crearGlow(COL.naranja, 0.7, 0.8);
      const panel = new Panel(0.95, 0.56, 760, 448);
      panel.mesh.position.set(0, 0.46, 0);
      // dron GLB (el lente mira a +Z, que es hacia donde apunta lookAt); si no cargó, el dron procedural de siempre
      const modelo = Modelos.clonar('dron_mensaje');
      const anillo = modelo && Modelos.nodo(modelo, 'anillo');
      let nucleo = null, cascara = null, aro = null;
      if (modelo && anillo) {
        g.add(brillo, modelo, panel.mesh, this.zonaColision(0.5, 0.5, 0.4));
      } else {
        nucleo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), new THREE.MeshStandardMaterial({
          color: '#1a2340', emissive: COL.naranja, emissiveIntensity: 0.7, flatShading: true, metalness: 0.6, roughness: 0.3
        }));
        cascara = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1),
          new THREE.MeshBasicMaterial({ color: COL.cian, wireframe: true, transparent: true, opacity: 0.45 }));
        aro = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.007, 6, 40), new THREE.MeshBasicMaterial({ color: COL.naranja }));
        g.add(brillo, nucleo, cascara, aro, panel.mesh, this.zonaColision(0.5, 0.5, 0.4));
      }
      const hitPanel = this.zonaColision(0.95, 0.56, 0.02); hitPanel.position.copy(panel.mesh.position);
      g.add(hitPanel);

      const d = this.crearObjetivo('drone', g, {
        caso, panel, nucleo, cascara, aro, anillo: modelo ? anillo : null, origen, destino, duracion,
        escaneo: 0, escaneoDibujado: -1, revelado: false, fase: azar(0, 6)
      });
      if (caso.esEstafa) this.stats.estafasTotal++; else this.stats.legitTotal++;
      this.dibujarPanelDrone(d);
      this.drones.push(d);
      Sonido.aparicion();
    },

    dibujarPanelDrone(d) {
      const c = d.caso;
      d.escaneoDibujado = d.escaneo;
      d.panel.dibujar((ctx, w, h) => {
        marcoHUD(ctx, 6, 6, w - 12, h - 12, d.revelado ? COL.naranja : COL.cian);
        ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(0, 247, 255, 0.10)'; ctx.fillRect(20, 20, w - 40, 92);
        ctx.fillStyle = COL.cian; fuenteAjustada(ctx, c.app, 700, F_TXT, 42, w - 80);
        ctx.fillText(c.app, 36, 50);
        ctx.fillStyle = COL.gris; fuenteAjustada(ctx, `De: ${c.remitente}`, 600, F_TXT, 30, w - 80);
        ctx.fillText(`De: ${c.remitente}`, 36, 92);

        ctx.fillStyle = COL.blanco; ctx.font = `600 37px ${F_TXT}`;
        lineas(ctx, c.mensaje, w - 72).slice(0, 4).forEach((l, i) => ctx.fillText(l, 36, 152 + i * 42));

        const yz = 322;
        if (d.revelado) {
          ctx.fillStyle = 'rgba(255, 157, 0, 0.18)'; rr(ctx, 22, yz, w - 44, 104, 14); ctx.fill();
          ctx.strokeStyle = COL.naranja; ctx.lineWidth = 3; rr(ctx, 22, yz, w - 44, 104, 14); ctx.stroke();
          ctx.fillStyle = COL.dorado; ctx.font = `700 32px ${F_TXT}`;
          lineas(ctx, `🔍 ${c.pista}`, w - 80).slice(0, 2).forEach((l, i) => ctx.fillText(l, 40, yz + 32 + i * 40));
        } else {
          ctx.fillStyle = COL.cian; ctx.font = `700 28px ${F_TIT}`;
          ctx.fillText('◎ APUNTA PARA ESCANEAR', 36, yz + 34);
          ctx.fillStyle = 'rgba(0, 247, 255, 0.15)'; ctx.fillRect(36, yz + 66, w - 72, 16);
          ctx.fillStyle = COL.cian; ctx.shadowColor = COL.cian; ctx.shadowBlur = 10;
          ctx.fillRect(36, yz + 66, (w - 72) * d.escaneo, 16);
        }
      });
    },

    actualizarDrones(dt) {
      for (let i = this.drones.length - 1; i >= 0; i--) {
        const d = this.drones[i];
        d.t += dt;
        const k = Math.min(1, d.t / d.duracion);
        const pos = d.origen.clone().lerp(d.destino, k);
        pos.y += Math.sin(d.t * 1.7 + d.fase) * 0.06;
        pos.x += Math.sin(d.t * 1.1 + d.fase) * 0.04;
        d.grupo.position.copy(pos);
        d.grupo.lookAt(this.camPos);
        d.grupo.scale.setScalar(Math.max(0.001, rebote(d.t / 0.6)) * (d.apuntado ? 1.05 : 1));
        if (d.anillo) {
          d.anillo.rotation.y += dt * (d.apuntado ? 6 : 2); // el anillo gira sobre su eje vertical
        } else {
          d.cascara.rotation.x += dt * 0.7; d.cascara.rotation.y += dt * 0.9;
          d.aro.rotation.z += dt * (d.apuntado ? 6 : 2);
          d.aro.material.color.set(d.apuntado ? COL.cian : COL.naranja);
          d.nucleo.rotation.y -= dt * 1.5;
        }
        if (k >= 1) this.llegaDrone(d);
      }
    },

    quitarDrone(d) {
      const i = this.drones.indexOf(d);
      if (i >= 0) this.drones.splice(i, 1);
      this.retirar(d);
    },

    llegaDrone(d) {
      const pos = d.grupo.position.clone();
      if (d.caso.esEstafa) {
        this.integridad = Math.max(0, this.integridad - CONFIG.danoEstafa);
        this.fallar();
        this.stats.estafasRecibidas++;
        Sonido.dano();
        this.flashDano();
        this.vibrarAmbas(0.9, 220);
        this.explosion(pos, COL.rojo, 40);
        this.textoFlotante(pos, '⚠ ¡TE ALCANZÓ!', d.caso.retro, COL.rojo);
      } else {
        const bono = this.acertar();
        this.sumar(CONFIG.puntosLegitimo + bono);
        this.stats.legitRecibidos++;
        Sonido.acierto();
        this.absorber(pos, COL.verde);
        this.textoFlotante(pos, `✔ SEGURO +${CONFIG.puntosLegitimo + bono}`, d.caso.retro, COL.verde);
      }
      this.marcarHUD();
      this.quitarDrone(d);
    },

    dispararDrone(d, mano) {
      const pos = d.grupo.position.clone();
      if (d.caso.esEstafa) {
        const bono = this.acertar();
        const extra = d.revelado ? CONFIG.bonusEscaneo : 0;
        const total = CONFIG.puntosBloqueo + bono + extra;
        this.sumar(total);
        this.stats.estafasBloqueadas++;
        Sonido.explosion(); Sonido.acierto();
        this.explosion(pos, COL.naranja, 60);
        this.explosion(pos, COL.dorado, 25, false);
        const titulo = `+${total} BLOQUEADA` + (this.combo > 1 ? ` x${this.combo}` : '');
        this.textoFlotante(pos, titulo, d.caso.retro, COL.dorado);
      } else {
        this.fallar();
        this.sumar(-CONFIG.penalLegitimo);
        this.stats.legitDestruidos++;
        Sonido.explosion(); Sonido.error();
        this.explosion(pos, COL.cian, 40);
        this.textoFlotante(pos, `✖ −${CONFIG.penalLegitimo} · ERA SEGURO`, d.caso.retro, COL.rojo);
      }
      if (mano) this.vibrar(mano, 0.8, 90);
      this.quitarDrone(d);
    },

    // ---------- FASE 2: ciberacoso ----------
    crearAmigo() {
      const fr = this.frenteHorizontal();
      const base = this.camPos.clone().addScaledVector(fr, 2.7); base.y = 0;
      const g = new THREE.Group();
      g.position.copy(base);
      g.lookAt(this.camPos.x, 0, this.camPos.z);

      let cuerpo, cabeza = null, relleno = null, malla = null, base1 = null, mats = null;
      const modeloAmigo = Modelos.clonar('amigo_holo', true); // materiales propios: se retiñen según el ánimo
      if (modeloAmigo) {
        // figura GLB (visor hacia +Z, que es hacia donde apunta lookAt); es un solo mesh, así que el ánimo se muestra con color y con la inclinación del cuerpo
        cuerpo = new THREE.Group();
        cuerpo.add(modeloAmigo);
        g.add(cuerpo);
        mats = Modelos.materiales(modeloAmigo)
          .filter(m => /^(emisivo|emisivo_azul|emisivo_palido|vidrio_holo)$/.test(m.name))
          .map(m => ({ m, tipo: m.name }));
      } else {
        relleno = matAditivo(COL.cian, 0.3);
        malla = new THREE.MeshBasicMaterial({ color: COL.cian, wireframe: true, transparent: true, opacity: 0.75 });
        const parte = (geo, x, y, rotZ = 0) => {
          const p = new THREE.Group();
          p.add(new THREE.Mesh(geo, relleno), new THREE.Mesh(geo, malla));
          p.position.set(x, y, 0); p.rotation.z = rotZ;
          cuerpo.add(p);
          return p;
        };
        cuerpo = new THREE.Group();
        cabeza = parte(new THREE.IcosahedronGeometry(0.12, 1), 0, 1.56);
        parte(new THREE.CapsuleGeometry(0.17, 0.38, 4, 10), 0, 1.14);
        parte(new THREE.CapsuleGeometry(0.05, 0.42, 3, 8), -0.26, 1.12, 0.12);
        parte(new THREE.CapsuleGeometry(0.05, 0.42, 3, 8), 0.26, 1.12, -0.12);
        parte(new THREE.CapsuleGeometry(0.065, 0.58, 3, 8), -0.1, 0.44);
        parte(new THREE.CapsuleGeometry(0.065, 0.58, 3, 8), 0.1, 0.44);
        g.add(cuerpo);
        base1 = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.47, 48), matAditivo(COL.cian, 0.8, { side: THREE.DoubleSide }));
        base1.rotation.x = -Math.PI / 2; base1.position.y = 0.01;
        g.add(base1);
      }
      const luz = crearGlow(COL.cian, 1.6, 0.35); luz.position.y = 1.0;
      g.add(luz);

      // Escudo: cúpula GLB (alta como el amigo) o, si no cargó, la esfera de siempre
      let escudo = null, escudoRelleno = null, escudoMod = null, escudoMats = null;
      const domo = Modelos.clonar('escudo_amigo', true);
      if (domo) {
        domo.scale.set(1, 1.75, 1); // radio 1 m, pero alta para cubrir los 1.65 m del amigo
        domo.visible = false;
        escudoMats = Modelos.materiales(domo).map(m => {
          m.transparent = true; m.depthWrite = false;
          const op0 = /^vidrio/.test(m.name) ? 0.22 : 1;
          m.opacity = 0;
          return { m, op0 };
        });
        escudoMod = domo;
        g.add(domo);
      } else {
        escudo = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 2),
          new THREE.MeshBasicMaterial({ color: COL.dorado, wireframe: true, transparent: true, opacity: 0 }));
        escudoRelleno = new THREE.Mesh(new THREE.SphereGeometry(0.98, 32, 16), matAditivo(COL.dorado, 0));
        escudo.position.y = escudoRelleno.position.y = 1.0;
        g.add(escudo, escudoRelleno);
      }
      const etiqueta = new Panel(0.8, 0.2, 640, 160);
      etiqueta.mesh.position.y = 1.98;
      g.add(etiqueta.mesh);
      g.scale.set(1, 0.001, 1);
      this.raiz.add(g);

      this.amigo = {
        grupo: g, cuerpo, cabeza, relleno, malla, base1, luz, escudo, escudoRelleno, escudoMod, escudoMats, mats, etiqueta,
        opEscudo: 0, animo: 1, nivelEscudo: 0, t: 0, golpe: 0, protegido: false
      };
      this.dibujarEtiquetaAmigo();
    },

    dibujarEtiquetaAmigo() {
      const a = this.amigo;
      if (!a) return;
      a.etiqueta.dibujar((ctx, w, h) => {
        const color = a.protegido ? COL.dorado : (a.animo > 0.5 ? COL.cian : COL.rojo);
        marcoHUD(ctx, 4, 4, w - 8, h - 8, color);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color; ctx.font = `900 40px ${F_TIT}`;
        ctx.fillText(a.protegido ? '🛡️ PROTEGIDO' : 'TU AMIGO', w / 2, 52);
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(60, 100, w - 120, 22);
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10;
        ctx.fillRect(60, 100, (w - 120) * Math.max(0, a.animo), 22);
      });
    },

    actualizarAmigo(dt) {
      const a = this.amigo;
      if (!a) return;
      a.t += dt;
      a.golpe = Math.max(0, a.golpe - dt * 2);
      a.grupo.scale.y = Math.max(0.001, sueve(a.t / 1.2));
      const triste = 1 - a.animo;
      const color = new THREE.Color(COL.cian).lerp(new THREE.Color(COL.rojo), a.protegido ? 0 : triste);
      if (a.protegido) color.set(COL.dorado);
      a.luz.material.color.copy(color);
      if (a.mats) {
        // figura GLB: se retiñen los emisivos cian (rojo si está triste, dorado si está protegido)
        const intensidad = INTENSIDAD_EMISIVA_AMIGO * (1 + a.golpe * 0.8) + Math.sin(a.t * 14) * 0.03;
        a.mats.forEach(e => {
          const m = e.m;
          if (e.tipo === 'vidrio_holo') {
            m.emissive.copy(color).multiplyScalar(0.45);
            m.color.copy(color).multiplyScalar(0.12);
          } else {
            m.emissive.copy(color).multiplyScalar(e.tipo === 'emisivo_azul' ? 0.75 : 1);
            if (e.tipo === 'emisivo_palido') m.emissive.lerp(BLANCO, 0.5);
            m.emissiveIntensity = intensidad;
          }
        });
        a.cuerpo.rotation.x = a.protegido ? 0 : triste * 0.12; // se encorva hacia delante cuando está triste
      } else {
        a.relleno.color.copy(color); a.malla.color.copy(color); a.base1.material.color.copy(color);
        a.relleno.opacity = 0.3 + a.golpe * 0.4 + Math.sin(a.t * 14) * 0.03;
        a.cabeza.position.y = 1.56 - (a.protegido ? 0 : triste * 0.07);
        a.cabeza.rotation.x = a.protegido ? 0 : triste * 0.5;
      }
      a.cuerpo.position.x = Math.sin(a.t * 40) * 0.02 * a.golpe;
      a.cuerpo.scale.y = 1 + Math.sin(a.t * 2) * 0.01;
      const objetivo = a.protegido ? 0.55 : a.nivelEscudo * 0.12;
      a.opEscudo += (objetivo - a.opEscudo) * Math.min(1, dt * 4);
      if (a.escudoMod) {
        // la opacidad de la cúpula crece con el nivel, como la esfera de antes
        const k = Math.min(1, a.opEscudo / 0.55);
        a.escudoMod.visible = k > 0.01;
        a.escudoMats.forEach(e => { e.m.opacity = e.op0 * k; });
        a.escudoMod.rotation.y += dt * 0.4;
      } else {
        a.escudo.material.opacity = a.opEscudo;
        a.escudoRelleno.material.opacity = a.opEscudo * 0.18;
        a.escudo.rotation.y += dt * 0.4;
      }
      a.etiqueta.mesh.lookAt(this.camPos);
    },

    lanzarBurbuja() {
      if (!this.mazoAcoso || !this.mazoAcoso.length) this.mazoAcoso = barajar(MENSAJES_ACOSO);
      const texto = this.mazoAcoso.pop();
      const a = this.amigo.grupo.position;
      const lejos = a.clone().sub(this.camPos); lejos.y = 0; lejos.normalize();
      // llegan por los lados (no por detrás del amigo, donde no se verían)
      const ang = (Math.random() < 0.5 ? -1 : 1) * azar(1.0, 2.1);
      const dir = lejos.clone().applyAxisAngle(new V3(0, 1, 0), ang);
      const origen = a.clone().addScaledVector(dir, azar(1.6, 2.2)); origen.y = azar(1.0, 2.2);
      const destino = a.clone(); destino.y = 1.25;

      const g = new THREE.Group();
      g.position.copy(origen);
      const brillo = crearGlow(COL.rojo, 0.6, 0.7);
      // FASE 2: alien cíclope GLB (frente/ojo a +Z, hacia donde mira). Si no cargó, la burbuja GLB y, si tampoco, la esfera de siempre
      const alien = Modelos.clonar('alien_cyclop');
      const modeloB = alien ? null : Modelos.clonar('burbuja_acoso');
      let esfera = null, malla = null, mixer = null;
      if (!alien && !modeloB) {
        esfera = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), new THREE.MeshStandardMaterial({
          color: '#2a0a10', emissive: COL.rojo, emissiveIntensity: 0.9, flatShading: true
        }));
        malla = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 0),
          new THREE.MeshBasicMaterial({ color: COL.rojo, wireframe: true, transparent: true, opacity: 0.6 }));
      }
      const panel = new Panel(1.15, 0.28, 720, 176);
      panel.dibujar((ctx, w, h) => {
        ctx.fillStyle = 'rgba(40, 4, 10, 0.88)'; rr(ctx, 6, 6, w - 12, h - 12, 24); ctx.fill();
        ctx.strokeStyle = COL.rojo; ctx.lineWidth = 5; rr(ctx, 6, 6, w - 12, h - 12, 24); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = COL.blanco;
        fuenteAjustada(ctx, `💬 ${texto}`, 700, F_TXT, 46, w - 50);
        ctx.fillText(`💬 ${texto}`, w / 2, h / 2);
      });
      const altoPanel = alien ? 0.56 : 0.26; // sobre la cabeza del alien (cabeza a ≈0.36 m del centro)
      panel.mesh.position.y = altoPanel;
      const hit = this.zonaColision(1.15, 0.28, 0.02); hit.position.y = altoPanel;
      if (alien) {
        alien.scale.setScalar(0.35);            // ≈ 0.67 m de alto
        alien.position.y = -0.3;                // centra el cuerpo en la trayectoria
        alien.traverse(o => { if (o.isMesh) o.raycast = () => {}; }); // solo cuentan las hitboxes (el raycast de un SkinnedMesh es caro)
        mixer = Modelos.animar('alien_cyclop', alien, 'Alien_Idle');
        const cuerpo = new THREE.Group();       // gira hacia el compañero; el panel y las hitboxes no
        cuerpo.rotation.y = Math.atan2(destino.x - origen.x, destino.z - origen.z);
        cuerpo.add(alien);
        brillo.scale.setScalar(0.8);
        g.add(brillo, cuerpo, panel.mesh, this.zonaColision(0.5, 0.75, 0.5));
      } else if (modeloB) {
        g.add(brillo, modeloB, panel.mesh, this.zonaColision(0.4, 0.4, 0.4));
      } else {
        g.add(brillo, esfera, malla, panel.mesh, this.zonaColision(0.4, 0.4, 0.4));
      }
      g.add(hit);
      const d = this.crearObjetivo('burbuja', g, {
        texto, origen, destino, duracion: azar(6.5, 8), malla, modelo: modeloB, fase: azar(0, 6),
        alien: !!alien, mixer, panel, hit
      });
      this.burbujas.push(d);
      this.stats.acosoTotal++;
      Sonido.aparicion();
    },

    actualizarBurbujas(dt) {
      for (let i = this.burbujas.length - 1; i >= 0; i--) {
        const b = this.burbujas[i];
        b.t += dt;
        const k = Math.min(1, b.t / b.duracion);
        const pos = b.origen.clone().lerp(b.destino, k);
        pos.y += Math.sin(b.t * 2 + b.fase) * 0.08;
        b.grupo.position.copy(pos);
        if (b.alien) {
          // el alien mira a su destino (no gira el grupo); solo el panel y su hitbox encaran al jugador
          b.panel.mesh.lookAt(this.camPos);
          b.hit.quaternion.copy(b.panel.mesh.quaternion);
          if (b.mixer) b.mixer.update(dt);
        } else {
          b.grupo.lookAt(this.camPos);
        }
        b.grupo.scale.setScalar(Math.max(0.001, rebote(b.t / 0.5)) * (b.apuntado ? 1.08 : 1));
        if (b.malla) b.malla.rotation.y += dt * 2;
        else if (b.modelo) b.modelo.scale.setScalar(1 + Math.sin(b.t * 6 + b.fase) * 0.06); // palpita (no gira: el rayo debe mirar al jugador)
        if (k >= 1) this.llegaBurbuja(b);
      }
    },
    quitarBurbuja(b) {
      const i = this.burbujas.indexOf(b);
      if (i >= 0) this.burbujas.splice(i, 1);
      if (b.mixer) { b.mixer.stopAllAction(); b.mixer.uncacheRoot(b.mixer.getRoot()); b.mixer = null; }
      b.grupo.traverse(o => { if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose(); }); // libera la textura de huesos del clon
      this.retirar(b);
    },
    llegaBurbuja(b) {
      const a = this.amigo;
      a.animo = Math.max(0, a.animo - 0.12);
      a.golpe = 1;
      this.stats.acosoRecibido++;
      Sonido.error();
      this.explosion(b.grupo.position.clone(), COL.rojo, 25, false);
      this.textoFlotante(a.grupo.position.clone().add(new V3(0, 1.4, 0)), '💔 LE DOLIÓ',
        'Cada mensaje que pasa lastima a una persona real.', COL.rojo);
      this.dibujarEtiquetaAmigo();
      this.quitarBurbuja(b);
    },
    dispararBurbuja(b, mano) {
      const pos = b.grupo.position.clone();
      this.sumar(CONFIG.puntosAcoso);
      this.stats.acosoBloqueado++;
      Sonido.explosion(); Sonido.acierto();
      this.explosion(pos, COL.rojo, 50);
      this.explosion(pos, COL.dorado, 20, false);
      const consejos = [
        'No lo difundas: el acoso vive del público.',
        'Bloquear corta el ataque.',
        'Tu amigo nota que no está solo/a.',
        'Ser testigo activo hace la diferencia.'
      ];
      this.textoFlotante(pos, `+${CONFIG.puntosAcoso} BLOQUEADO`, consejos[this.stats.acosoBloqueado % consejos.length], COL.dorado);
      if (mano) this.vibrar(mano, 0.7, 80);
      this.quitarBurbuja(b);
    },

    crearAcciones() {
      const lista = barajar(ACCIONES_ACOSO);
      const huecos = [
        { ang: 0.95, dy: 0.05 }, { ang: 0.6, dy: -0.35 }, { ang: 0.33, dy: 0.15 },
        { ang: -0.33, dy: 0.15 }, { ang: -0.6, dy: -0.35 }, { ang: -0.95, dy: 0.05 },
        { ang: 0, dy: 0.62 }
      ];
      lista.forEach((accion, i) => {
        const h = huecos[i];
        const base = this.puntoFrente(1.9, h.dy, h.ang);
        const g = new THREE.Group();
        g.position.copy(base);
        // marco GLB con el plano de texto dentro (0.56x0.20 en z=+0.0135); sin GLB, la tarjeta de siempre
        const marco = Modelos.clonar('accion_tarjeta', true);
        const panel = marco ? new Panel(0.56, 0.20, 700, 250) : new Panel(0.62, 0.26, 620, 260);
        const brillo = crearGlow(COL.cian, 1.0, 0.3); brillo.position.z = -0.04;
        if (marco) {
          panel.mesh.position.z = 0.0135;
          g.add(brillo, marco, panel.mesh, this.zonaColision(0.66, 0.3, 0.06));
        } else {
          g.add(brillo, panel.mesh, this.zonaColision(0.66, 0.3, 0.06));
        }
        const marcoMats = marco ? Modelos.materiales(marco).filter(m => /^emisivo/.test(m.name)) : null;
        const d = this.crearObjetivo('accion', g, { accion, panel, base, brillo, marcoMats, estado: 'activa', fase: azar(0, 6) });
        this.dibujarAccion(d);
        this.acciones.push(d);
      });
    },

    dibujarAccion(d) {
      const color = d.estado === 'correcta' ? COL.verde : d.estado === 'incorrecta' ? COL.rojo : COL.cian;
      if (d.marcoMats && d.estado !== 'activa') {
        // el marco GLB toma el tinte verde / rojo según la respuesta
        d.marcoMats.forEach(m => { m.emissive.set(color); });
      }
      d.panel.dibujar((ctx, w, h) => {
        if (d.marcoMats) {
          // el marco ya lo da el modelo 3D: aquí solo va el fondo y el texto
          ctx.fillStyle = 'rgba(6, 12, 26, 0.92)'; rr(ctx, 2, 2, w - 4, h - 4, 14); ctx.fill();
        } else {
          marcoHUD(ctx, 6, 6, w - 12, h - 12, color, 'rgba(6, 12, 26, 0.9)');
        }
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = COL.blanco;
        ctx.font = `700 ${d.marcoMats ? 44 : 48}px ${F_TXT}`;
        const ls = lineas(ctx, d.accion.texto, w - (d.marcoMats ? 50 : 60)).slice(0, 2);
        ls.forEach((l, i) => ctx.fillText(l, w / 2, h / 2 + (i - (ls.length - 1) / 2) * (d.marcoMats ? 52 : 56)));
      });
    },

    dispararAccion(d, mano) {
      this.desactivar(d);
      const pos = d.grupo.position.clone();
      if (d.accion.correcta) {
        d.estado = 'correcta';
        this.sumar(CONFIG.puntosAccion);
        this.stats.accionesCorrectas++;
        Sonido.escudo();
        this.explosion(pos, COL.verde, 30, false);
        this.textoFlotante(pos, '✔ ¡ESO AYUDA!', d.accion.retro, COL.verde);
        if (mano) this.vibrar(mano, 0.5, 60);
      } else {
        d.estado = 'incorrecta';
        this.sumar(-CONFIG.penalAccion);
        this.stats.accionesErradas++;
        Sonido.error();
        this.textoFlotante(pos, '✖ NO AYUDA', d.accion.retro, COL.rojo);
        if (mano) this.vibrar(mano, 0.9, 150);
      }
      d.t = 0;
      this.dibujarAccion(d);
    },

    actualizarAcciones(dt) {
      for (let i = this.acciones.length - 1; i >= 0; i--) {
        const d = this.acciones[i];
        d.t += dt;
        if (d.estado === 'activa') {
          d.grupo.position.copy(d.base).add(new V3(0, Math.sin(d.t * 1.5 + d.fase) * 0.03, 0));
          d.grupo.scale.setScalar(Math.max(0.001, sueve(d.t / 0.6)) * (d.apuntado ? 1.08 : 1));
        } else if (d.estado === 'correcta') {
          // vuela hacia el amigo y refuerza su escudo
          const destino = this.amigo.grupo.position.clone().add(new V3(0, 1.1, 0));
          const k = Math.min(1, d.t / 1.0);
          d.grupo.position.lerpVectors(d.base, destino, sueve(k));
          d.grupo.scale.setScalar(Math.max(0.001, 1 - k * 0.8));
          if (k >= 1) {
            this.amigo.nivelEscudo++;
            this.amigo.animo = Math.min(1, this.amigo.animo + 0.25);
            this.dibujarEtiquetaAmigo();
            this.absorber(destino, COL.dorado);
            this.acciones.splice(i, 1); this.retirar(d);
            continue;
          }
        } else if (d.estado === 'incorrecta' || d.estado === 'saliendo') {
          const k = Math.min(1, d.t / 0.9);
          d.grupo.position.copy(d.base).add(new V3(Math.sin(d.t * 50) * 0.02 * (1 - k), -k * 0.5, 0));
          d.panel.mesh.material.opacity = 1 - k;
          if (d.marcoMats) d.marcoMats.forEach(m => { m.transparent = true; m.opacity = 1 - k; });
          if (k >= 1) { this.acciones.splice(i, 1); this.retirar(d); continue; }
        }
        d.grupo.lookAt(this.camPos);
      }
    },

    // ---------- Flujo de la partida ----------
    mostrarInicio() {
      this.limpiarTodo();
      this.fase = 'inicio'; this.tFase = 0;
      this.visor.visible = true; this.visorListo = false;
      this.colocarEscenario();
      this.hudTitulo = 'CIBERESCUDO XR'; this.hudObjetivo = 'Dispara al botón para comenzar'; this.hudTiempo = null;
      this.puntos = 0; this.combo = 0;
      this.dibujarHUD();
      this.mostrarBanner('CIBERESCUDO XR',
        'Aprieta el GATILLO para disparar. Apunta un momento a un mensaje para ESCANEARLO.', COL.naranja, 0);
      this.crearBoton('▶ INICIAR MISIÓN', this.puntoFrente(2.1, -0.62), COL.verde, () => this.comenzarPartida());
    },

    comenzarPartida() {
      this.limpiarTodo();
      this.agente = leerJSON(CLAVE_AGENTES, 0) + 1;
      guardarJSON(CLAVE_AGENTES, this.agente);
      this.puntos = 0; this.combo = 0; this.integridad = CONFIG.integridadInicial;
      this.stats = {
        estafasBloqueadas: 0, estafasRecibidas: 0, estafasTotal: 0,
        legitRecibidos: 0, legitDestruidos: 0, legitTotal: 0, escaneos: 0,
        acosoBloqueado: 0, acosoRecibido: 0, acosoTotal: 0,
        accionesCorrectas: 0, accionesErradas: 0
      };
      this.mazo = null; this.primerMazo = true; this.mazoAcoso = null;
      this.visor.visible = true; this.visorListo = false;
      this.colocarEscenario();
      this.cambiarFase('cuenta');
      this.abrirPortales();
      Sonido.musica.iniciar('accion');
    },

    cambiarFase(fase) {
      this.fase = fase; this.tFase = 0; this.paso = 0;
      const titulos = {
        cuenta: ['FASE 1 · ESTAFAS', 'Prepárate...'],
        fase1: ['FASE 1 · ESTAFAS', 'Dispara a las estafas · deja pasar lo legítimo'],
        transicion1: ['ANALIZANDO...', ''],
        acoso: ['FASE 2 · CIBERACOSO', 'Bloquea los mensajes antes de que lleguen'],
        decision: ['FASE 2 · AYUDA', 'Dispara SOLO a las acciones que ayudan'],
        cierre: ['MISIÓN CUMPLIDA', ''],
        final: ['INFORME DE MISIÓN', 'Dispara a SIGUIENTE AGENTE']
      };
      if (titulos[fase]) [this.hudTitulo, this.hudObjetivo] = titulos[fase];
      this.hudTiempo = { fase1: CONFIG.duracionFase1, acoso: CONFIG.duracionAcoso, decision: CONFIG.duracionDecision }[fase] ?? null;
      this.dibujarHUD();
    },

    actualizarFase(dt) {
      if (this.fase === 'menu' || this.fase === 'inicio') return;
      this.tFase += dt;
      const t = this.tFase;

      if (this.fase === 'cuenta') {
        const n = 3 - Math.floor(t);
        if (n !== this.ultimoNumero && n >= 0 && t < 4) {
          this.ultimoNumero = n;
          Sonido.cuenta(n);
          this.mostrarBanner(n > 0 ? String(n) : '¡YA!',
            'Dispara a las ESTAFAS. Deja pasar los mensajes LEGÍTIMOS.', n > 0 ? COL.naranja : COL.verde, n > 0 ? 1.05 : 1.6);
        }
        if (t >= 3.6) { this.ultimoNumero = null; this.cambiarFase('fase1'); this.tSpawn = 0.3; }
      } else if (this.fase === 'fase1') {
        const prog = t / CONFIG.duracionFase1;
        const intervalo = THREE.MathUtils.lerp(5.0, 2.8, prog);
        const max = prog < 0.3 ? 2 : prog < 0.65 ? 3 : 4;
        this.tSpawn -= dt;
        if (this.tSpawn <= 0 && this.drones.length < max && t < CONFIG.duracionFase1 - 3) {
          this.lanzarDrone(); this.tSpawn = intervalo;
        }
        this.tiempoHUD(CONFIG.duracionFase1 - t);
        if (t >= CONFIG.duracionFase1 || this.integridad <= 0) this.terminarFase1();
      } else if (this.fase === 'transicion1') {
        if (this.paso === 0 && t >= 2.8) {
          this.paso = 1;
          Sonido.alerta();
          Sonido.musica.modo = 'tension';
          this.mostrarBanner('ALERTA: CIBERACOSO',
            'Alguien de tu salón está siendo atacado. ¡Dispara a los mensajes antes de que lo alcancen!', COL.rojo, 4.5);
          this.crearAmigo();
        }
        if (t >= 6.5) { this.cambiarFase('acoso'); this.tSpawn = 0.5; }
      } else if (this.fase === 'acoso') {
        const prog = t / CONFIG.duracionAcoso;
        this.tSpawn -= dt;
        if (this.tSpawn <= 0 && this.burbujas.length < 4 && t < CONFIG.duracionAcoso - 3) {
          this.lanzarBurbuja(); this.tSpawn = THREE.MathUtils.lerp(2.4, 1.5, prog);
        }
        this.tiempoHUD(CONFIG.duracionAcoso - t);
        if (t >= CONFIG.duracionAcoso) {
          this.burbujas.slice().forEach(b => { this.absorber(b.grupo.position.clone(), COL.rojo); this.quitarBurbuja(b); });
          this.cambiarFase('decision');
          Sonido.alerta();
          this.mostrarBanner('¿CÓMO LO AYUDAS?',
            'Dispara SOLO a las acciones correctas. Cada una refuerza su escudo.', COL.cian, 4);
          this.crearAcciones();
        }
      } else if (this.fase === 'decision') {
        this.tiempoHUD(CONFIG.duracionDecision - t);
        const correctasTotal = ACCIONES_ACOSO.filter(a => a.correcta).length;
        const listas = this.amigo.nivelEscudo >= correctasTotal;
        if (listas || t >= CONFIG.duracionDecision) {
          this.acciones.forEach(d => { if (d.estado === 'activa') { this.desactivar(d); d.estado = 'saliendo'; d.t = 0; } });
          this.cambiarFase('cierre');
          this.amigo.protegido = true; this.amigo.animo = 1;
          this.dibujarEtiquetaAmigo();
          Sonido.victoria();
          Sonido.musica.modo = 'calma';
          this.mostrarBanner(listas ? '¡AMIGO PROTEGIDO!' : 'ESCUDO ACTIVADO',
            `Si ves acoso: no lo reenvíes, guarda evidencia, repórtalo y cuéntale a un adulto. ${LINEAS_AYUDA}`, COL.dorado, 7);
        }
      } else if (this.fase === 'cierre') {
        if (t >= 7.2) this.mostrarResultados();
      }
    },

    tiempoHUD(restante) {
      const s = Math.max(0, Math.ceil(restante));
      if (s !== this.hudTiempo) { this.hudTiempo = s; this.marcarHUD(); }
    },

    terminarFase1() {
      const caido = this.integridad <= 0;
      this.drones.slice().forEach(d => { this.absorber(d.grupo.position.clone(), COL.cian); this.quitarDrone(d); });
      this.cerrarPortales();
      this.cambiarFase('transicion1');
      if (caido) {
        Sonido.dano();
        this.mostrarBanner('FIREWALL CAÍDO', 'Las estafas entraron... pero aún puedes ayudar a alguien.', COL.rojo, 2.7);
      } else {
        Sonido.victoria();
        this.mostrarBanner('FASE 1 SUPERADA', `Bloqueaste ${this.stats.estafasBloqueadas} estafas`, COL.verde, 2.7);
      }
    },

    mostrarResultados() {
      this.cambiarFase('final');
      Sonido.musica.detener();
      this.ocultarBanner();
      this.visor.visible = false; // el informe ya muestra el puntaje
      if (this.amigo) { this.raiz.remove(this.amigo.grupo); liberar(this.amigo.grupo); this.amigo = null; }

      const ranking = leerJSON(CLAVE_RANKING, []);
      ranking.push({ agente: this.agente, puntos: this.puntos });
      ranking.sort((a, b) => b.puntos - a.puntos);
      guardarJSON(CLAVE_RANKING, ranking.slice(0, 50));
      const puesto = ranking.findIndex(r => r.agente === this.agente) + 1;
      const rango = RANGOS.find(r => this.puntos >= r.min).nombre;
      const s = this.stats;

      const p = new Panel(1.6, 1.0, 1280, 800);
      p.dibujar((ctx, w, h) => {
        marcoHUD(ctx, 8, 8, w - 16, h - 16, COL.naranja, 'rgba(4, 8, 18, 0.9)');
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center'; ctx.fillStyle = COL.naranja; ctx.font = `900 46px ${F_TIT}`;
        ctx.shadowColor = COL.naranja; ctx.shadowBlur = 20;
        ctx.fillText(`AGENTE #${this.agente}`, w / 2, 70);
        ctx.shadowBlur = 0;

        // Columna izquierda: puntaje y estadísticas
        ctx.textAlign = 'left';
        ctx.fillStyle = COL.gris; ctx.font = `700 30px ${F_TXT}`; ctx.fillText('PUNTAJE', 60, 150);
        ctx.fillStyle = COL.dorado; ctx.font = `900 96px ${F_TIT}`;
        ctx.shadowColor = COL.dorado; ctx.shadowBlur = 24; ctx.fillText(String(this.puntos), 56, 230); ctx.shadowBlur = 0;
        ctx.fillStyle = COL.cian; fuenteAjustada(ctx, rango, 700, F_TIT, 34, 700);
        ctx.fillText(rango, 60, 310);
        const filas = [
          `🛡️ Estafas bloqueadas: ${s.estafasBloqueadas} / ${s.estafasBloqueadas + s.estafasRecibidas}`,
          `✔ Mensajes reales recibidos: ${s.legitRecibidos} / ${s.legitRecibidos + s.legitDestruidos}`,
          `🔍 Mensajes escaneados: ${s.escaneos}`,
          `💬 Ataques de acoso bloqueados: ${s.acosoBloqueado} / ${s.acosoBloqueado + s.acosoRecibido}`,
          `🤝 Acciones de ayuda correctas: ${s.accionesCorrectas} / ${ACCIONES_ACOSO.filter(a => a.correcta).length}`
        ];
        ctx.fillStyle = COL.blanco; ctx.font = `600 36px ${F_TXT}`;
        filas.forEach((f, i) => ctx.fillText(f, 60, 390 + i * 54));

        // Columna derecha: ranking
        const x0 = 800;
        ctx.strokeStyle = 'rgba(255,157,0,0.4)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0 - 30, 130); ctx.lineTo(x0 - 30, 640); ctx.stroke();
        ctx.fillStyle = COL.naranja; ctx.font = `900 34px ${F_TIT}`; ctx.fillText('TOP 5', x0, 150);
        ranking.slice(0, 5).forEach((r, i) => {
          const yo = r.agente === this.agente;
          ctx.fillStyle = yo ? COL.dorado : COL.blanco;
          ctx.font = `${yo ? 700 : 600} 38px ${F_TXT}`;
          ctx.fillText(`${i + 1}. Agente #${r.agente}`, x0, 220 + i * 62);
          ctx.textAlign = 'right'; ctx.fillText(String(r.puntos), w - 60, 220 + i * 62); ctx.textAlign = 'left';
        });
        if (puesto > 5) {
          ctx.fillStyle = COL.gris; ctx.font = `600 32px ${F_TXT}`;
          ctx.fillText(`Tu puesto: #${puesto}`, x0, 560);
        }

        ctx.textAlign = 'center'; ctx.fillStyle = COL.verde; ctx.font = `700 34px ${F_TXT}`;
        ctx.fillText(LINEAS_AYUDA, w / 2, h - 60);
      });
      p.mesh.position.copy(this.puntoFrente(2.4, 0.15));
      p.mesh.lookAt(this.camPos);
      this.raiz.add(p.mesh);
      this.resultados = p;
      this.crearBoton('SIGUIENTE AGENTE ▶', this.puntoFrente(2.2, -0.62), COL.verde, () => this.comenzarPartida());
      this.explosion(p.mesh.position.clone(), COL.dorado, 80, false);
      Sonido.victoria();
    },

    limpiarTodo() {
      this.retirarBotones();
      this.drones.slice().forEach(d => this.quitarDrone(d));
      this.burbujas.slice().forEach(b => this.quitarBurbuja(b));
      this.acciones.slice().forEach(a => this.retirar(a)); this.acciones = [];
      this.objetivos.slice().forEach(o => this.retirar(o));
      this.portales.forEach(p => { this.raiz.remove(p.grupo); liberar(p.grupo); }); this.portales = [];
      if (this.amigo) { this.raiz.remove(this.amigo.grupo); liberar(this.amigo.grupo); this.amigo = null; }
      if (this.resultados) { this.raiz.remove(this.resultados.mesh); liberar(this.resultados.mesh); this.resultados = null; }
      this.efectos.forEach(e => { if (e.obj) { e.padre.remove(e.obj); liberar(e.obj); } });
      this.efectos = []; this.textosActivos = 0;
      this.ocultarBanner();
    },

    // ---------- Bucle principal ----------
    tick(t, dtMs) {
      const dt = Math.min((dtMs || 16) / 1000, 0.05);
      this.actualizarCamara();
      if (!this.vinetaMontada && this.el.camera) { this.el.camera.add(this.vineta); this.vinetaMontada = true; }
      if (this.vinetaT > 0) {
        this.vinetaT = Math.max(0, this.vinetaT - dt * 1.5);
        this.vineta.material.opacity = this.vinetaT * 0.85;
      }
      if (this.fase === 'menu') return;
      this.actualizarApuntado(dt);
      this.actualizarFase(dt);
      this.actualizarDrones(dt);
      this.actualizarBurbujas(dt);
      this.actualizarAcciones(dt);
      this.actualizarAmigo(dt);
      this.actualizarPortales(dt);
      this.actualizarBotones(dt);
      this.actualizarEfectos(dt);
      this.actualizarVisor(dt);
      if (this.hudSucio && t - (this.ultimoHud || 0) > 120) { this.ultimoHud = t; this.dibujarHUD(); }
    }
  });
})();
