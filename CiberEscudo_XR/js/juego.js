/* CiberEscudo XR - Motor del juego
 * A-Frame se encarga de la sesión XR y los mandos; los objetos del juego se construyen con three.js.
 */
/* global AFRAME, CASOS_ESTAFA, MENSAJES_ACOSO, ACCIONES_ACOSO, LINEAS_AYUDA, Sonido */
(() => {
  const THREE = AFRAME.THREE;
  const V3 = THREE.Vector3;

  // ===== Ajustes de juego =====
  const CONFIG = {
    duracionFase1: 90,       // s de fase 1 (varios drones a la vez, pero solo UNO habla por turno)
    duracionAcoso: 28,       // s bloqueando mensajes de acoso
    duracionDecision: 30,    // s para elegir cómo ayudar
    integridadInicial: 100,
    danoEstafa: 25,          // % de salud/firewall que quita una amenaza al impactar contra el jugador (4 impactos = breach)
    danoFuegoAmigo: 10,      // % de penalización si se destruye un mensaje legítimo por error
    puntosBloqueo: 100,      // + disparar a una amenaza (mando derecho)
    puntosAtrapar: 100,      // + atrapar un mensaje seguro (mano izquierda)
    penalAtaque: 100,        // - una amenaza llega al jugador
    penalLegitimo: 100,      // - disparar a un mensaje seguro
    penalPerdido: 50,        // - dejar pasar un mensaje seguro sin atraparlo
    penalAtrapada: 100,      // - atrapar una amenaza con la mano
    RADIO_CAPTURA: 0.85,     // m entre mando izquierdo y dron para atrapar con comodidad y fluidez en Quest 3S
    RADIO_AYUDA: 1.35,       // m a los que el aro de la mano empieza a brillar
    palmaZ: 0,               // m: desplazamiento (en el eje del mando) del punto de captura
    llegadaDist: 1.45,       // m delante del jugador donde el dron transmite su mensaje antes de la embestida o captura
    llegadaBajo: 0.22,       // m por debajo de la cabeza donde se posiciona el dron
    // --- Ritmo de la fase 1 (cola con turnos de audio) ---
    maxDrones: 3,            // drones vivos a la vez (aproximando + cola + activo). Tope duro: 4 (rendimiento en Quest)
    intervaloLanzamiento: 2.2, // s entre lanzamientos desde los portales (mientras haya sitio)
    cierreLanzamiento: 8,    // s finales de la fase en los que ya no se lanzan drones nuevos
    ventanaDecision: 3.0,    // s para actuar DESPUÉS de que termina el audio del mensaje; si no, se resuelve como «llegada»
    tiempoAproximacion: 4.0, // s base que tarda un dron en volar del portal a su casilla de espera (× nivel)
    // Niveles de velocidad: lento al empezar la ronda y más rápido después (factor > 1 = más lento)
    nivelesVelocidad: [
      { hasta: 30, factor: 1.7 },  // nivel 1: lento
      { hasta: 60, factor: 1.0 },  // nivel 2: normal
      { hasta: Infinity, factor: 0.6 } // nivel 3: rápido (reto)
    ],
    vueloActivo: 2.0,        // s mínimos que tarda el dron de turno en volar al punto de captura
    graciaFinal: 6,          // s tras el tiempo de la fase que se espera a que acabe lo que está sonando antes de forzar el cierre
    esperaDist: 2.4,         // m (horizontal) de las casillas de espera al jugador
    esperaArco: 40,          // grados a cada lado de la dirección inicial del jugador donde se reparten las casillas
    esperaBajo: 0.1,         // m por debajo de los ojos a los que flotan los drones en espera
    escalaEspera: 0.8,       // escala de los drones en espera
    duracionMensajeEstimada: 3.8, // s de un mensaje si no hay duraciones.json ni MP3
    duracionRetroEstimada: 2.7,   // s de una explicación si no hay duraciones.json ni MP3
    puntosAcoso: 100,
    puntosAccion: 150,
    penalAccion: 50
  };

  const MAX_DRONES_TOPE = 4; // máximo absoluto de drones vivos (presupuesto de dibujo en Quest); CONFIG.maxDrones nunca lo supera
  const EJE_Y = new V3(0, 1, 0);

  // ===== PALETA CYBER-COMMAND NEÓN (Cian Eléctrico + Azul Bolívar + Oro Institucional) =====
  const COL = {
    negro: '#01040a',
    fondoOscuro: '#040b18',
    fosforo: '#00e5ff',        // cian neón principal (marcos, HUD, amenazas, láser)
    cian: '#00e5ff',           // cian neón
    azul: '#0075b8',           // azul institucional Bolívar
    menta: '#00ffaa',          // verde esmeralda neón: aciertos, mensajes seguros, escudo
    verdeOscuro: '#061d36',    // fondo profundo azulado
    blancoVerde: '#f0f8ff',    // texto blanco hielo de alta legibilidad
    protegido: '#ffe066',      // dorado radiante: compañero protegido
    rojo: '#ff2a5f',           // error / daño / amenaza crítica (rojo coral neón brillante)
    ambar: '#ffb703',          // alerta / urgencia (oro ámbar)
    gris: '#738fa8',           // texto secundario
    fondo: 'rgba(4, 12, 26, 0.92)',
    fondoBanner: 'rgba(2, 8, 18, 0.95)'
  };
  const F_TIT = 'Orbitron, "Segoe UI", sans-serif';
  const F_TXT = 'Rajdhani, "Segoe UI", Roboto, sans-serif';
  const F_MONO = '"Cascadia Mono", Consolas, "Courier New", monospace';

  // ===== Ajustes de la lluvia de código (VR / pantalla) =====
  const LLUVIA = {
    radio: 9, alto: 10, base: -0.8,      // m: cilindro alrededor del jugador (base = y del borde inferior)
    columnas: 150, filas: 26,            // celdas alrededor y a lo alto
    brillo: 0.62,                        // 0..1 intensidad general (bájala si tapa el HUD)
    brilloBajo: 0.45,                    // factor en la parte baja (tras las paredes de la sala)
    velocidad: 1.0,                      // multiplicador de la velocidad de caída
    cola: 14,                            // celdas de cola (media)
    densidad: 0.78                       // fracción de columnas activas
  };

  const RANGOS = [
    { min: 3000, nombre: 'GUARDIÁN LEGENDARIO DE BOLÍVAR' },
    { min: 2000, nombre: 'COMANDANTE CIBERESCUDO' },
    { min: 1000, nombre: 'DEFENSOR DIGITAL JUVENIL' },
    { min: 0, nombre: 'CADETE DE CIBERDEFENSA' }
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
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, 'rgba(0,117,184,0.4)');
      g.addColorStop(0.85, 'rgba(0,229,255,0.92)'); g.addColorStop(1, 'rgba(0,229,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 512, 512);
      x.lineWidth = 5;
      for (let k = 0; k < 6; k++) {
        x.strokeStyle = k % 2 ? 'rgba(0,229,255,0.75)' : 'rgba(128,243,255,0.65)';
        x.beginPath();
        for (let r = 20; r < 240; r += 4) {
          const a = k * Math.PI / 3 + r * 0.025;
          const px = 256 + Math.cos(a) * r, py = 256 + Math.sin(a) * r;
          if (r === 20) x.moveTo(px, py); else x.lineTo(px, py);
        }
        x.stroke();
      }
      x.strokeStyle = 'rgba(0,229,255,0.4)'; x.lineWidth = 2;
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
      mano_izquierda: 'modelos/mano_izquierda.glb',
      mano_derecha: 'modelos/mano_derecha.glb',
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

    // --- Tema Cyber-Command Neón Bolívar: recolorea los materiales con paleta cian, azul y oro institucional ---
    const tinteEmisivo = (m, hex, base = 0.16) => {
      if (m.emissive) m.emissive.set(hex);
      if (m.color && !m.userData.tintada) m.color.set(hex).multiplyScalar(base);
    };
    function recolorar(m, n) {
      if (m.userData.recolorado) return;
      m.userData.recolorado = true;
      switch (n) {
        case 'emisivo_naranja': case 'Luz_Naranja': case 'Naranja': tinteEmisivo(m, COL.ambar); break; // acento oro/ámbar Bolívar
        case 'emisivo_azul': case 'emisivo': case 'Decal_Cian': case 'Luz_Cian': case 'Anillo_Cian': case 'Cian':
          tinteEmisivo(m, COL.cian); break; // cian neón eléctrico
        case 'emisivo_dorado': tinteEmisivo(m, COL.protegido); break;
        case 'emisivo_palido': tinteEmisivo(m, COL.protegido); break;
        case 'emisivo_blanco': tinteEmisivo(m, COL.blancoVerde); break;
        case 'vidrio_holo': tinteEmisivo(m, COL.cian, 0.12); break;
        case 'vidrio': // cúpula del escudo protector (cian translúcido y oro)
          if (m.color) m.color.set(COL.protegido);
          if (m.emissive) m.emissive.set(COL.cian).multiplyScalar(0.4);
          break;
        case 'pintado': // casco de naves y drones: titanio oscuro y azul cobalto espacial
          if (m.color) m.color.setRGB(0.18, 0.28, 0.45);
          break;
        case 'Guante': case 'Manga': // guantes tácticos del operador: fibra de carbono y cian
          if (m.color) m.color.multiply(new THREE.Color(0.75, 0.95, 1.3));
          break;
        case 'Suelo_Oscuro': case 'Negro': // suelo obsidiana espacial
          if (m.color) m.color.setRGB(0.015, 0.025, 0.05);
          break;
        case 'Trim_01': case 'Trim_02_Azul': case 'Trim_03': case 'Trim_03_Oscuro': // molduras de alta tecnología: cobalto Bolívar brillante
          if (m.color) m.color.setRGB(0.2, 0.65, 1.2);
          break;
        case 'M_Alien_Body_Blue': // Sombra Phish: espectro cibernético oscuro
          if (m.color) m.color.setRGB(0.08, 0.12, 0.28);
          break;
        case 'M_Alien_Eyes': // ojos de amenaza: rojo carmesí neón
          if (m.emissive) m.emissive.set(COL.rojo);
          break;
        default: break;
      }
      if (n === 'pintado' || n === 'Trim_01' || n === 'Trim_02_Azul' || n === 'Trim_03' || n === 'Trim_03_Oscuro') m.userData.tintada = true;
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
          try { recolorar(m, n); } catch (e) { console.warn('CiberEscudo: no se pudo reteñir', n, e); }
          if (n.startsWith('emisivo')) { m.toneMapped = false; m.emissiveIntensity = INTENSIDAD_EMISIVA; }
          else if (n.startsWith('vidrio')) { m.transparent = true; m.depthWrite = false; }
          if (kit) {
            if (m.isMeshStandardMaterial && !matsKit.includes(m)) { matsKit.push(m); aplicarEntorno(m); }
            if (n === 'M_Alien_Eyes') { // el ojo del alien brilla en verde mentol
              m.emissive.set(COL.menta); m.emissiveIntensity = INTENSIDAD_EMISIVA; m.toneMapped = false;
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
      pieza(new THREE.BoxGeometry(12, 8, 12), '#163d28', [0, 0, 0], 0, 0, THREE.BackSide);
      pieza(new THREE.PlaneGeometry(12, 12), '#040d09', [0, -3.9, 0], -Math.PI / 2);
      pieza(new THREE.PlaneGeometry(6, 6), new THREE.Color(5.5, 5.8, 5.5), [0, 3.9, 0], Math.PI / 2);
      pieza(new THREE.PlaneGeometry(8, 1.4), new THREE.Color(0.5, 3.4, 1.6), [0, 0.6, -5.9]);
      pieza(new THREE.PlaneGeometry(8, 1.4), new THREE.Color(0.2, 2.2, 3.0), [0, 0.6, 5.9], 0, Math.PI);
      pieza(new THREE.PlaneGeometry(5, 1.0), new THREE.Color(2.4, 1.9, 0.4), [-5.9, 1.2, 0], 0, Math.PI / 2);
      pieza(new THREE.PlaneGeometry(5, 1.0), new THREE.Color(0.3, 2.5, 1.4), [5.9, 1.2, 0], 0, -Math.PI / 2);
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

  // ===== Marca institucional (Gobernación de Bolívar · Secretaría de las TIC) =====
  // Emblemas entregados por la Secretaría (marca/escudo.png 512×512 y marca/logo_secretaria.png 500×200, en negativo).
  // Reglas del Manual de Identidad Visual 2024 (ver README «Marca»): el emblema va SIEMPRE sobre un panel oscuro opaco con
  // margen de seguridad (≥ 12 % del alto del logo, ≥ 10 % del lado del escudo), en su proporción original, sin tinte, sin
  // brillo, sin transparencia, sin rotarlo y sin efectos encima (glitch, barrido, lluvia, bloom). El tema verde NO se le aplica.
  // Si una imagen no carga, el juego sigue sin ella (solo console.warn).
  const Marca = (() => {
    const ARCHIVOS = { escudo: 'marca/escudo.png', logo: 'marca/logo_secretaria.png' };
    const DIM = { escudo: [512, 512], logo: [500, 200] }; // px nativos: de aquí sale la proporción, que nunca se altera
    const FONDO = '#070a09';                // panel oscuro opaco, casi negro y neutro (sin tinte verde)
    const BORDE = 'rgba(255, 255, 255, 0.22)'; // borde fino del recuadro (queda fuera del margen de seguridad)
    const LEYENDA = 'Una iniciativa de la Gobernación de Bolívar · Secretaría de las TIC';
    const tex = {}, esperas = {};

    function cargar() {
      let cargador;
      try { cargador = new THREE.TextureLoader(); } catch (e) { console.warn('CiberEscudo: sin cargador de imágenes; no se muestra la marca', e); return; }
      Object.keys(ARCHIVOS).forEach(clave => {
        try {
          cargador.load(ARCHIVOS[clave], t => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.generateMipmaps = true;
            t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
            t.anisotropy = 16; // three la limita a lo que permita la GPU
            t.userData.compartida = true; // liberar() no la destruye
            tex[clave] = t;
            (esperas[clave] || []).splice(0).forEach(f => { try { f(); } catch (e) { console.warn('CiberEscudo: error al montar la marca', clave, e); } });
          }, undefined, () => console.warn('CiberEscudo: no se pudo cargar la marca', ARCHIVOS[clave]));
        } catch (e) { console.warn('CiberEscudo: error al pedir la marca', clave, e); }
      });
    }

    const imagen = clave => (tex[clave] && tex[clave].image) || null; // HTMLImageElement ya cargada, para drawImage
    function cuando(clave, fn) { if (tex[clave]) fn(); else (esperas[clave] = esperas[clave] || []).push(fn); }

    // Material del emblema en 3D: blanco puro (sin tinte), opaco, sin brillo, sin niebla ni tone mapping.
    // «transparent» solo recorta el PNG y siempre va sobre un respaldo opaco; depthWrite normal.
    const materialEmblema = t => new THREE.MeshBasicMaterial({
      map: t, color: 0xffffff, transparent: true, opacity: 1, depthTest: true, depthWrite: true,
      toneMapped: false, fog: false, side: THREE.FrontSide,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
    });
    const materialFondo = (lado = THREE.FrontSide) => new THREE.MeshBasicMaterial({ color: FONDO, toneMapped: false, fog: false, side: lado });

    // Placa 3D: respaldo oscuro opaco (ancho × alto m) y el emblema centrado (anchoImg m de ancho, alto proporcional).
    // El plano mira a +Z; el emblema queda 4 mm delante del respaldo.
    // Plano con el emblema solo (anchoImg m, alto proporcional). Quien lo use debe ponerle un respaldo opaco detrás.
    function emblema(clave, anchoImg) {
      const t = tex[clave];
      if (!t) return null;
      const altoImg = anchoImg * DIM[clave][1] / DIM[clave][0];
      const m = new THREE.Mesh(new THREE.PlaneGeometry(anchoImg, altoImg), materialEmblema(t));
      m.name = 'emblema_' + clave;
      return m;
    }
    function placa(clave, ancho, alto, anchoImg) {
      const t = tex[clave];
      if (!t) return null;
      const altoImg = anchoImg * DIM[clave][1] / DIM[clave][0];
      const fondo = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), materialFondo());
      const emblema = new THREE.Mesh(new THREE.PlaneGeometry(anchoImg, altoImg), materialEmblema(t));
      emblema.name = 'emblema_' + clave;
      emblema.position.z = 0.004;
      const g = new THREE.Group();
      g.add(fondo, emblema);
      g.userData.marca = { clave, ancho, alto, anchoImg, altoImg };
      return g;
    }

    // Dibuja en un canvas 2D el recuadro oscuro opaco con el emblema dentro (drawImage sin filtros ni transparencia).
    // (x, y) = esquina del recuadro; anchoImg = ancho del emblema en px del canvas; margen = fracción del alto del emblema.
    // El interior [x..x+w, y..y+h] es 100 % opaco (#070a09) y respeta el margen de seguridad (≥ 14 %).
    // Por FUERA del recuadro de reserva se dibuja un bisel táctico institucional con esquineros dorados (#ffcc29) y cian (#00afef).
    function dibujar(ctx, clave, x, y, anchoImg, margen = 0.14) {
      const img = imagen(clave);
      if (!img) return null;
      const altoImg = Math.round(anchoImg * DIM[clave][1] / DIM[clave][0]);
      const m = Math.ceil(altoImg * margen);
      const w = anchoImg + 2 * m, h = altoImg + 2 * m;
      ctx.save();
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      if ('filter' in ctx) ctx.filter = 'none';
      // Bisel exterior táctico (fuera del área de reserva)
      ctx.strokeStyle = 'rgba(0, 175, 239, 0.55)'; ctx.lineWidth = 3;
      rr(ctx, x - 4, y - 4, w + 8, h + 8, 11); ctx.stroke();
      // Recuadro interior 100 % opaco de reserva
      ctx.fillStyle = FONDO; rr(ctx, x, y, w, h, 8); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = BORDE; rr(ctx, x + 1, y + 1, w - 2, h - 2, 8); ctx.stroke();
      // Esquineros institucionales dorados (por fuera de la zona de seguridad)
      const L = Math.min(26, Math.round(h * 0.22));
      ctx.strokeStyle = '#ffcc29'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - 4, y + L); ctx.lineTo(x - 4, y - 4); ctx.lineTo(x + L, y - 4);
      ctx.moveTo(x + w - L, y - 4); ctx.lineTo(x + w + 4, y - 4); ctx.lineTo(x + w + 4, y + L);
      ctx.moveTo(x + w + 4, y + h - L); ctx.lineTo(x + w + 4, y + h + 4); ctx.lineTo(x + w - L, y + h + 4);
      ctx.moveTo(x + L, y + h + 4); ctx.lineTo(x - 4, y + h + 4); ctx.lineTo(x - 4, y + h - L);
      ctx.stroke();
      // Emblema intacto sin filtros ni alteración
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x + m, y + m, anchoImg, altoImg);
      ctx.restore();
      return { x, y, w, h, m };
    }

    cargar();
    return { cuando, imagen, emblema, placa, dibujar, materialFondo, listo: clave => !!tex[clave], FONDO, LEYENDA };
  })();

  // Rótulos ficticios «ASTRANOVA» del kit sci-fi (decals de sala_mando.glb, material Decal_Cian) y cómo se cubren.
  // Las coordenadas están en el marco de la sala ya montada (origen en el centro, Y = 0 en la plataforma, frente = -Z) y salen de
  // agrupar los vértices de la primitiva Decal_Cian y tomar los cúmulos cuya región UV es el logo (u 0-217, v 0-134 del atlas):
  //  - frente (z -7.359) y fondo (z +7.359): rótulo de 2.29 × 1.42 m, x -1.17..1.13, y 3.20..4.62. Entre x ±1.5 el muro está libre;
  //    desde x ±1.51 empiezan las pilastras (Trim_01), así que el panel mide 2.84 m de ancho (+ marco de 3 cm) y queda a 3 cm del decal.
  //  - consolas a ±60° (a 6.7 m): el mismo rótulo, pero de 0.40 × 0.25 m y en un plano inclinado; se tapan con un panel liso.
  // `ancla` = un vértice del decal usado para comprobar en tiempo de ejecución que el GLB sigue siendo el esperado.
  const ROTULOS_SALA = {
    paredes: [
      { id: 'frente', pos: [-0.02, 3.9075, -7.33], giro: 0, ancla: [-1.166, 3.199, -7.359] },
      { id: 'fondo', pos: [0.02, 3.9075, 7.33], giro: Math.PI, ancla: [1.166, 3.199, 7.359] }
    ],
    panel: { ancho: 2.84, alto: 1.46, logo: 2.5, marco: 0.03 }, // m; el logo (2.5 × 1.0 m) deja ≥ 0.17 m de margen (12 % de 1.0 m = 0.12)
    consolas: [
      { id: 'consola+60', centro: [5.813, 1.334, -3.360], ex: [0.5, 0, 0.866], ey: [0.6124, 0.7071, -0.3536], ancla: [5.638, 1.247, -3.489] },
      { id: 'consola-60', centro: [-5.813, 1.334, -3.360], ex: [-0.5, 0, 0.866], ey: [-0.6124, 0.7071, -0.3536], ancla: [-5.840, 1.247, -3.138] }
    ],
    consola: { ancho: 0.44, alto: 0.29, avance: 0.012 } // m (rótulo 0.398 × 0.246 + 2 cm por lado); avance = separación hacia el jugador
  };

  // ===== Lluvia de código (ShaderMaterial, una sola malla / una llamada de dibujo) =====
  // Atlas de glifos generado en un canvas al arrancar (dígitos, letras latinas y símbolos). Cada columna tiene velocidad, fase
  // y longitud de cola propias; la cabeza es brillante y la cola se apaga. Todo se calcula en el fragment shader.
  const Lluvia = (() => {
    const SIMBOLOS = '<>/\\{}[]=+*;:#%&|~$@!?^_-().';
    const GLIFOS = ('0123456789' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + SIMBOLOS).slice(0, 64);
    let atlas = null;
    const mats = [];
    let tiempo = 0;

    function crearAtlas() {
      if (atlas) return atlas;
      const N = 8, C = 32;
      const c = document.createElement('canvas'); c.width = c.height = N * C;
      const x = c.getContext('2d');
      x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `bold 22px ${F_MONO}`;
      for (let i = 0; i < 64; i++) {
        const ch = GLIFOS[i % GLIFOS.length];
        x.fillText(ch, (i % N) * C + C / 2, Math.floor(i / N) * C + C / 2 + 1);
      }
      atlas = new THREE.CanvasTexture(c);
      atlas.generateMipmaps = true;
      atlas.minFilter = THREE.LinearMipmapLinearFilter; atlas.magFilter = THREE.LinearFilter;
      atlas.anisotropy = 2;
      atlas.userData.compartida = true;
      return atlas;
    }

    const VERT = `
      attribute float aSemilla;
      varying vec2 vUv; varying float vSem;
      void main() {
        vUv = uv; vSem = aSemilla;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`;
    const FRAG = `
      precision highp float;
      uniform sampler2D uAtlas;
      uniform float uTime, uCols, uRows, uBrillo, uBajo, uVel, uCola, uDens, uAparece;
      uniform vec3 uCabeza, uCuerpo, uFondo;
      varying vec2 vUv; varying float vSem;
      float h11(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
      float h21(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec2 g = vec2(vUv.x * uCols, (1.0 - vUv.y) * uRows);   // filas contadas desde arriba
        float col = floor(g.x);
        float fila = floor(g.y);
        vec2 f = fract(g);
        float sem = col + vSem * 57.0;
        float a = h11(sem + 1.0), b = h11(sem + 7.7), c = h11(sem + 3.3);
        float activa = step(a, uDens);
        float vel = (3.0 + 6.0 * b) * uVel;                      // filas por segundo
        float largo = uCola * (0.45 + 0.9 * c);                  // celdas de cola
        float ciclo = uRows + largo + 6.0;
        float cab = floor(mod(uTime * vel + c * ciclo, ciclo));  // celda de la cabeza (desde arriba)
        float d = cab - fila;                                    // >0: detrás de la cabeza
        float cola = (d >= 0.0 && d < largo) ? pow(1.0 - d / largo, 1.6) : 0.0;
        float esCab = step(abs(d), 0.5);
        float t = floor(uTime * (1.5 + 3.0 * h21(vec2(col, fila))) + esCab * uTime * 6.0);
        float gi = floor(h21(vec2(col * 1.37 + t, fila * 2.11 + sem)) * 64.0);
        vec2 celda = vec2(mod(gi, 8.0), floor(gi / 8.0));
        vec2 q = (f - 0.12) / 0.76;
        float dentro = step(0.0, q.x) * step(q.x, 1.0) * step(0.0, q.y) * step(q.y, 1.0);
        vec2 auv = vec2((celda.x + clamp(q.x, 0.0, 1.0)) / 8.0, 1.0 - (celda.y + clamp(q.y, 0.0, 1.0)) / 8.0);
        float glifo = texture2D(uAtlas, auv).r * dentro;
        float k = activa * max(cola, esCab);
        float chispa = 0.7 + 0.3 * h21(vec2(fila + col, floor(uTime * 7.0)));
        vec3 color = mix(uFondo * 2.2, uCuerpo, smoothstep(0.0, 0.65, cola));
        color = mix(color, uCabeza, esCab);
        #ifdef GOTEO
          float masc = smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.88, 1.0, vUv.y));
        #else
          float masc = mix(uBajo, 1.0, smoothstep(0.30, 0.62, vUv.y)) * smoothstep(0.0, 0.05, vUv.y) * (1.0 - smoothstep(0.90, 1.0, vUv.y));
        #endif
        float I = glifo * k * chispa * masc * uBrillo * uAparece * mix(1.0, 1.5, esCab);
        if (I < 0.004) discard;
        gl_FragColor = vec4(color, min(I, 1.0));
        #include <colorspace_fragment>
      }`;

    function material(o, goteo) {
      const m = new THREE.ShaderMaterial({
        uniforms: {
          uAtlas: { value: crearAtlas() }, uTime: { value: 0 },
          uCols: { value: o.columnas }, uRows: { value: o.filas }, uBrillo: { value: o.brillo }, uBajo: { value: o.brilloBajo },
          uVel: { value: o.velocidad }, uCola: { value: o.cola }, uDens: { value: o.densidad }, uAparece: { value: 1 },
          uCabeza: { value: new THREE.Color(COL.blancoVerde) }, uCuerpo: { value: new THREE.Color(COL.fosforo) },
          uFondo: { value: new THREE.Color(COL.verdeOscuro) }
        },
        vertexShader: VERT, fragmentShader: FRAG, defines: goteo ? { GOTEO: 1 } : {},
        transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
        side: goteo ? THREE.DoubleSide : THREE.BackSide, fog: false
      });
      mats.push(m);
      return m;
    }

    // Cilindro grande alrededor del jugador (solo VR / pantalla). Una malla = una llamada de dibujo.
    function cilindro() {
      const geo = new THREE.CylinderGeometry(LLUVIA.radio, LLUVIA.radio, LLUVIA.alto, 96, 1, true);
      const mat = material(LLUVIA, false);
      const malla = new THREE.Mesh(geo, mat);
      malla.frustumCulled = false; malla.renderOrder = -10; malla.raycast = () => {};
      malla.position.y = LLUVIA.base + LLUVIA.alto / 2;
      malla.name = 'lluviaCodigo';
      return malla;
    }

    // Columnas finas goteando junto a cada portal (realidad mixta): UNA malla con 3 tiras por portal.
    function goteo(portales) {
      const n = portales.length * 3;
      const pos = new Float32Array(n * 12), uv = new Float32Array(n * 8), sem = new Float32Array(n * 4), idx = [];
      const offs = [[-0.78, 0.0], [0.80, 0.12], [0.96, -0.1]];
      const V = new THREE.Vector3();
      let q = 0;
      portales.forEach(p => {
        offs.forEach(([ox, oy]) => {
          const s = Math.random() * 60;
          [[-1, 1, 0, 1], [1, 1, 1, 1], [-1, -1, 0, 0], [1, -1, 1, 0]].forEach(([sx, sy, u, v], k) => {
            V.set(ox + sx * 0.05, oy + 0.1 + sy * 0.8, 0.05).applyQuaternion(p.grupo.quaternion).add(p.grupo.position);
            pos.set([V.x, V.y, V.z], (q * 4 + k) * 3);
            uv.set([u, v], (q * 4 + k) * 2); sem[q * 4 + k] = s;
          });
          idx.push(q * 4, q * 4 + 2, q * 4 + 1, q * 4 + 1, q * 4 + 2, q * 4 + 3);
          q++;
        });
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geo.setAttribute('aSemilla', new THREE.BufferAttribute(sem, 1));
      geo.setIndex(idx);
      const mat = material({ columnas: 1, filas: 12, brillo: 0.7, brilloBajo: 1, velocidad: 0.7, cola: 8, densidad: 1 }, true);
      mat.uniforms.uAparece.value = 0;
      const malla = new THREE.Mesh(geo, mat);
      malla.frustumCulled = false; malla.renderOrder = 4; malla.raycast = () => {};
      return malla;
    }

    function actualizar(dt) {
      tiempo = (tiempo + dt) % 4096;
      mats.forEach(m => { m.uniforms.uTime.value = tiempo; });
    }
    function soltar(malla) {
      const i = mats.indexOf(malla.material);
      if (i >= 0) mats.splice(i, 1);
      malla.geometry.dispose(); malla.material.dispose();
    }
    return { cilindro, goteo, actualizar, soltar };
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
      this.manos.forEach(m => m.addEventListener('model-loaded', e => this.tenirMano(e.detail && e.detail.model)));

      this.objetivos = []; this.efectos = [];
      this.drones = []; this.portales = []; this.burbujas = []; this.acciones = []; this.botones = [];
      this.amigo = null; this.resultados = null;
      this.fase = 'menu'; this.tFase = 0;
      this.puntos = 0; this.combo = 0;
      this.integridadMax = CONFIG.integridadInicial;
      this.integridad = CONFIG.integridadInicial;
      this.integridadFantasma = CONFIG.integridadInicial;
      this.tSacudida = 0; this.intSacudida = 0;
      // fase 1 por audio
      // (this.casosListos = casos ya sorteados y con el audio precargado; this.dronActivo = el dron cuyo turno está en marcha;
      //  this.retroRestante = s que le quedan a la explicación hablada tras un error; this.tLanzar = s hasta el próximo lanzamiento)
      this.audios = {}; this.casosListos = []; this.dronActivo = null; this.retroRestante = 0; this.tLanzar = 0;
      this.dirBase = new V3(0, 0, -1); this.nLanzados = 0; this.hudCola = -1; this.ultimoCasoId = null; this.marca = null;
      this.duraciones = null; this.sinMasDrones = false; this.ultCaptura = 0;
      this.CONFIG = CONFIG; // para ajustar o probar desde la consola: juego.CONFIG.maxDrones = 4
      this.Marca = Marca; this.sello = null; this.marcaSala = null; // marca institucional (para revisar desde la consola)

      this.camPos = new V3(0, 1.6, 0); this.camDir = new V3(0, 0, -1);
      this.mouse = new THREE.Vector2(); this.mouseActivo = false;
      this.rayEscritorio = new THREE.Raycaster();

      this.crearVisor();
      this.crearVineta();
      this.crearEntornoVirtual();
      this.crearArmasPC();
      this.plataforma = null; this.sala = null;

      // Luz para los materiales PBR del kit: hemisférica barata, sin sombras, más un mapa de entorno solo para el kit
      this.el.object3D.add(new THREE.HemisphereLight('#a8ffc4', '#06200f', 0.55));
      const montarEntorno = () => {
        try { Modelos.prepararEntorno(this.el.renderer); } catch (e) { console.warn('CiberEscudo: sin mapa de entorno', e); }
      };
      if (this.el.renderer) montarEntorno(); else this.el.addEventListener('renderstart', montarEntorno, { once: true });
      Modelos.cuando('sala_mando', () => this.montarSala());
      Modelos.cuando('plataforma_mando', () => { if (this.fase !== 'menu') this.colocarEscenario(); });
      Modelos.cuando('blaster_naranja', () => this.montarArmasPC());
      Modelos.cuando('mano_izquierda', () => this.montarArmasPC());

      // Mando DERECHO: gatillo = disparar. Mando IZQUIERDO: no dispara; gatillo o agarre = atrapar el dron cercano.
      // (Decisión: el izquierdo no dispara en ninguna fase; en la fase 2 y la ayuda se juega con el derecho.)
      const izq = this.manos[0], der = this.manos[1];
      der.addEventListener('triggerdown', () => this.disparar(der));
      ['triggerdown', 'gripdown'].forEach(ev => izq.addEventListener(ev, () => this.atraparConMano(izq)));
      this.manos.forEach(m => {
        m.addEventListener('controllerconnected', () => {
          m.setAttribute('visible', true); // muestra la mano en primera persona
          setTimeout(() => { if (m === izq) { this.montarHalo(m); this.ocultarLaserIzq(true); } else this.montarBlaster(m); }, 100);
        });
      });

      this.el.addEventListener('renderstart', () => {
        const cv = this.el.canvas;
        if (!cv) return;

        // Movimiento libre del ratón: dirige la mirada directamente sin necesidad de arrastrar ni dar clic derecho
        window.addEventListener('mousemove', e => this.manejarMovimientoMouse(e));

        // Disparo con clic izquierdo y captura con clic derecho
        cv.addEventListener('mousedown', e => {
          if (this.fase === 'menu') return;
          if (this.modo === 'pantalla') {
            this.solicitarBloqueoPuntero();
          }
          if (e.button === 2) {
            this.capturarEscritorio();
            this.animarReticula('captura');
          } else if (e.button === 0) {
            this.dispararEscritorio();
            this.animarReticula('disparo');
          }
        });

        // Prevenir menú contextual para usar clic derecho como captura limpia
        cv.addEventListener('contextmenu', e => e.preventDefault());

        // Rebloquear puntero al hacer clic en el lienzo si se liberó con ESC
        cv.addEventListener('click', () => {
          if (this.modo === 'pantalla' && this.fase !== 'menu') {
            this.solicitarBloqueoPuntero();
          }
        });

        cv.addEventListener('mouseleave', () => {
          this._ultimoMouseX = undefined;
          this._ultimoMouseY = undefined;
        });
      });
      window.addEventListener('keydown', e => {
        if (e.code === 'KeyC' && !e.repeat && !this.el.is('vr-mode')) {
          this.capturarEscritorio();
          this.animarReticula('captura');
        }
      });

      this.el.addEventListener('enter-vr', () => {
        try {
          const xrSession = this.el.renderer && this.el.renderer.xr && this.el.renderer.xr.getSession && this.el.renderer.xr.getSession();
          if (xrSession && typeof xrSession.updateTargetFrameRate === 'function' && xrSession.supportedFrameRates) {
            const rates = Array.from(xrSession.supportedFrameRates);
            if (rates.includes(90)) xrSession.updateTargetFrameRate(90).catch(() => {});
          }
        } catch (e) { /* frecuencia estándar del dispositivo */ }
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
      this.cargarDuraciones();
      this.cargarAudio('bienvenida', 'audio/bienvenida.mp3');
      window.juego = this; // útil para depurar desde la consola
    },

    // Las manos las carga A-Frame (gltf-model): sus acentos pasan a cian neón, cobalto y oro institucional
    tenirMano(modelo) {
      if (!modelo) return;
      try {
        modelo.traverse(o => {
          if (!o.isMesh) return;
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
            const n = m.name || '';
            if (n === 'Naranja') { m.color.set(COL.ambar); if (m.emissive) m.emissive.set(COL.ambar); }
            else if (n === 'Cian') { m.color.set(COL.cian); if (m.emissive) m.emissive.set(COL.cian); }
            else if (n === 'Guante' || n === 'Manga') m.color.multiply(new THREE.Color(0.75, 0.95, 1.3));
          });
        });
      } catch (e) { console.warn('CiberEscudo: no se pudo reteñir la mano', e); }
    },

    // ---------- Entrada desde el menú ----------
    activar(modo) {
      Sonido.iniciar();
      document.getElementById('menu').classList.add('oculto');
      this.modo = modo;
      const ret = document.getElementById('reticula-pc');
      const av = document.getElementById('aviso-pc');
      if (modo === 'pantalla') {
        this.montarArmasPC();
        if (this.rigArmasPC) this.rigArmasPC.visible = true;
        if (ret) ret.classList.add('activo');
        if (av) {
          av.classList.remove('activo');
          void av.offsetWidth;
          av.classList.add('activo');
        }
        this.solicitarBloqueoPuntero();
        this.mostrarInicio();
      } else {
        if (this.rigArmasPC) this.rigArmasPC.visible = false;
        if (ret) ret.classList.remove('activo');
        if (av) av.classList.remove('activo');
        this.esperandoXR = true;
      }
    },

    volverAlMenu() {
      this.limpiarTodo();
      this.fase = 'menu';
      this.visor.visible = false;
      if (this.plataforma) this.plataforma.visible = false;
      if (this.rigArmasPC) this.rigArmasPC.visible = false;
      Sonido.musica.detener();
      const ret = document.getElementById('reticula-pc');
      const av = document.getElementById('aviso-pc');
      if (ret) ret.classList.remove('activo');
      if (av) av.classList.remove('activo');
      if (document.exitPointerLock && document.pointerLockElement) {
        try { document.exitPointerLock(); } catch (e) {}
      }
      document.getElementById('menu').classList.remove('oculto');
    },

    // ---------- Cámara y entrada ----------
    solicitarBloqueoPuntero() {
      const cv = this.el && this.el.canvas;
      if (!cv) return;
      try {
        if (document.pointerLockElement !== cv) {
          if (cv.requestPointerLock) cv.requestPointerLock();
          else if (cv.mozRequestPointerLock) cv.mozRequestPointerLock();
        }
      } catch (err) {}
    },

    animarReticula(tipo) {
      const ret = document.getElementById('reticula-pc');
      if (!ret) return;
      ret.classList.remove('disparo', 'captura');
      void ret.offsetWidth; // reiniciar animación
      ret.classList.add(tipo);
      setTimeout(() => { if (ret) ret.classList.remove(tipo); }, 150);
    },

    manejarMovimientoMouse(e) {
      if (this.fase === 'menu' || this.el.is('vr-mode')) return;

      let mx = e.movementX;
      let my = e.movementY;

      // Soporte para navegadores o situaciones donde movementX no se reporte
      if (mx === undefined || my === undefined) {
        if (this._ultimoMouseX !== undefined && this._ultimoMouseY !== undefined) {
          mx = e.clientX - this._ultimoMouseX;
          my = e.clientY - this._ultimoMouseY;
        } else {
          mx = 0;
          my = 0;
        }
      }
      this._ultimoMouseX = e.clientX;
      this._ultimoMouseY = e.clientY;

      // Descartar saltos desproporcionados (al recapturar puntero o al entrar el ratón)
      if (Math.abs(mx) > 180 || Math.abs(my) > 180) {
        mx = 0; my = 0;
      }

      // Rotación fluida directa de la perspectiva con el movimiento del ratón
      const camEl = document.getElementById('camara');
      const lc = camEl && camEl.components['look-controls'];
      if (lc && lc.yawObject && lc.pitchObject) {
        const sens = 0.0022; // Sensibilidad calibrada
        lc.yawObject.rotation.y -= mx * sens;
        lc.pitchObject.rotation.x -= my * sens;
        const maxPitch = 1.35; // ~77° (permite mirar arriba/abajo sin invertir la cabeza)
        lc.pitchObject.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, lc.pitchObject.rotation.x));
      }

      // En PC la retícula central es el eje de disparo y enfoque
      this.mouse.set(0, 0);
      this.mouseActivo = true;
    },

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
      if (this.modo === 'pantalla') {
        this.mouse.set(0, 0);
      } else {
        const r = this.el.canvas.getBoundingClientRect();
        this.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      }
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
      if (mano.blaster || mano.id === 'mano-izq') return; // el mando izquierdo va sin blaster
      const rc = mano.components.raycaster;
      const dir = rc ? new V3(rc.data.direction.x, rc.data.direction.y, rc.data.direction.z).normalize() : new V3(0, 0, -1);
      const ori = rc ? rc.data.origin : { x: 0, y: 0, z: 0 };
      const acento = mano.id === 'mano-izq' ? COL.menta : COL.fosforo;

      const g = new THREE.Group();
      const punta = new THREE.Object3D();
      const modelo = Modelos.clonar(mano.id === 'mano-izq' ? 'blaster_cian' : 'blaster_naranja');
      if (modelo) {
        // el GLB apunta el cañón a +Z; el juego lo apunta a -Z, así que se gira 180° en Y
        modelo.rotation.y = Math.PI;
        punta.position.z = -0.203;
        g.add(modelo, punta);
      } else {
        const metal = new THREE.MeshStandardMaterial({ color: '#12301d', metalness: 0.7, roughness: 0.35 });
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

    // ---------- Sistema de Puntería Táctica Asistida (Garantiza impacto certero) ----------
    buscarImpactoRayo(ray) {
      let mejorObj = null;
      let mejorDist = Infinity;
      let mejorPunto = null;

      // 1. Drones (activos, en aproximación o en cola: todos son interceptables si apuntas hacia ellos)
      if (this.drones) {
        for (let i = 0; i < this.drones.length; i++) {
          const d = this.drones[i];
          if (!d || d.resuelto) continue;
          const pos = d.grupo.position;
          const toD = pos.clone().sub(ray.origin);
          const proj = toD.dot(ray.direction);
          if (proj <= 0.2) continue; // no disparar hacia atrás

          const distRayo = ray.distanceToPoint(pos);
          // Radio de impacto generoso (1.25 m) para disparo arcade fluido y gratificante
          if (distRayo <= 1.25 && distRayo < mejorDist) {
            mejorDist = distRayo;
            mejorObj = d;
            mejorPunto = pos.clone();
          }
        }
      }

      // 2. Burbujas de ciberacoso en Fase 2
      if (!mejorObj && this.burbujas) {
        for (let i = 0; i < this.burbujas.length; i++) {
          const b = this.burbujas[i];
          if (!b || !b.vivo) continue;
          const pos = b.grupo.position;
          const toB = pos.clone().sub(ray.origin);
          const proj = toB.dot(ray.direction);
          if (proj <= 0.2) continue;
          const distRayo = ray.distanceToPoint(pos);
          if (distRayo <= 1.1 && distRayo < mejorDist) {
            mejorDist = distRayo;
            mejorObj = b;
            mejorPunto = pos.clone();
          }
        }
      }

      // 3. Botones y tarjetas interactivas
      if (!mejorObj && this.objetivos) {
        for (let i = 0; i < this.objetivos.length; i++) {
          const obj = this.objetivos[i];
          if (!obj || !obj.vivo) continue;
          const pos = obj.grupo ? obj.grupo.position : (obj.base || null);
          if (!pos) continue;
          const toO = pos.clone().sub(ray.origin);
          const proj = toO.dot(ray.direction);
          if (proj <= 0.2) continue;
          const distRayo = ray.distanceToPoint(pos);
          if (distRayo <= 0.85 && distRayo < mejorDist) {
            mejorDist = distRayo;
            mejorObj = obj;
            mejorPunto = pos.clone();
          }
        }
      }

      return { objetivo: mejorObj, punto: mejorPunto };
    },

    // ---------- Disparo en VR (Meta Quest) y Pantalla ----------
    disparar(mano) {
      if (this.fase === 'menu' || mano === this.manos[0]) return;
      const rc = mano.components.raycaster;
      if (!rc || !rc.raycaster) return;
      const ray = rc.raycaster.ray;

      // 1. Detección directa por raycast físico
      const inter = (rc.intersections || [])[0];
      let target = inter ? this.datosDe(inter.object) : null;
      let puntoImpacto = inter ? inter.point.clone() : null;

      // 2. Asistencia magnética táctica: si el láser pasa cerca del dron, conecta siempre
      if (!target) {
        const h = this.buscarImpactoRayo(ray);
        if (h.objetivo) {
          target = h.objetivo;
          puntoImpacto = h.punto;
        }
      }

      const desde = new V3();
      if (mano.blaster) mano.blaster.punta.getWorldPosition(desde); else desde.copy(ray.origin);
      const hasta = puntoImpacto || ray.origin.clone().addScaledVector(ray.direction, 16);
      const color = mano.id === 'mano-izq' ? COL.menta : COL.fosforo;
      this.efectoRayo(desde, hasta, color);
      if (mano.blaster) this.fogonazo(mano.blaster.boca);
      Sonido.disparo();
      this.vibrar(mano, 0.5, 45);

      if (target) {
        this.impacto(target, hasta, mano);
      }
    },

    dispararEscritorio() {
      if (this.fase === 'menu' || this.el.is('vr-mode') || !this.el.camera) return;
      if (this.armaDerechaPC) {
        this.recoilArmaPC = 0.055;
        if (this.bocaPC) this.fogonazo(this.bocaPC);
      }
      this.rayEscritorio.setFromCamera(this.mouse, this.el.camera);
      const hits = this.rayEscritorio.intersectObjects(this.objetivos.map(o => o.ent.object3D), true);
      const ray = this.rayEscritorio.ray;

      let target = hits[0] ? this.datosDe(hits[0].object) : null;
      let puntoImpacto = hits[0] ? hits[0].point.clone() : null;

      // Asistencia balística para ratón en PC
      if (!target) {
        const h = this.buscarImpactoRayo(ray);
        if (h.objetivo) {
          target = h.objetivo;
          puntoImpacto = h.punto;
        }
      }

      const desde = this.camPos.clone().add(new V3(0, -0.22, 0)).addScaledVector(this.camDir, 0.35);
      const hasta = puntoImpacto || ray.origin.clone().addScaledVector(ray.direction, 16);
      this.efectoRayo(desde, hasta, COL.fosforo);
      Sonido.disparo();

      if (target) {
        this.impacto(target, hasta, null);
      }
    },

    impacto(d, punto, mano) {
      if (!d || d.resuelto) return;
      if (d.tipo === 'boton') this.pulsarBoton(d);
      else if (d.tipo === 'drone') this.dispararDrone(d, mano);
      else if (d.tipo === 'burbuja') this.dispararBurbuja(d, mano);
      else if (d.tipo === 'accion') this.dispararAccion(d, mano);
    },

    // Qué está apuntando el mando derecho / el ratón (solo para resaltar)
    actualizarApuntado() {
      const apuntados = new Set();
      if (this.el.is('vr-mode')) {
        this.manos.forEach(m => {
          if (!m.blaster) return;
          const rc = m.components.raycaster;
          const i = rc && rc.intersections && rc.intersections[0];
          const d = i && this.datosDe(i.object);
          if (d && d.vivo) apuntados.add(d);
        });
      } else if (this.mouseActivo && this.el.camera && this.objetivos.length) {
        this.rayEscritorio.setFromCamera(this.mouse, this.el.camera);
        const hits = this.rayEscritorio.intersectObjects(this.objetivos.map(o => o.ent.object3D), true);
        let d = hits[0] && this.datosDe(hits[0].object);
        if (!d) {
          const h = this.buscarImpactoRayo(this.rayEscritorio.ray);
          if (h && h.objetivo) d = h.objetivo;
        }
        if (d && d.vivo) apuntados.add(d);
      }
      this.objetivos.forEach(d => { d.apuntado = apuntados.has(d); });

      // Actualizar estado dinámico de la retícula en PC
      if (this.modo === 'pantalla') {
        const ret = document.getElementById('reticula-pc');
        if (ret) {
          let primer = null;
          for (const item of apuntados) { primer = item; break; }
          if (primer) {
            if (primer.tipo === 'drone') {
              ret.className = (primer.datos && primer.datos.esAcoso) ? 'activo fijo-amenaza' : 'activo fijo-seguro';
            } else if (primer.tipo === 'boton') {
              ret.className = 'activo fijo-boton';
            } else {
              ret.className = 'activo fijo-amenaza';
            }
          } else {
            ret.className = 'activo';
          }
        }
      }
    },

    // ---------- Captura (mano izquierda / clic derecho / Tecla C) ----------
    posMano(mano, salida = new V3()) {
      salida.set(0, 0, CONFIG.palmaZ);
      return mano.object3D.localToWorld(salida);
    },

    atraparConMano(mano) {
      if (this.fase !== 'fase1') return;
      const ahora = performance.now();
      if (ahora - this.ultCaptura < 250) return; // gatillo + agarre casi a la vez cuentan como un solo intento
      this.ultCaptura = ahora;
      const p = this.posMano(mano);
      let mejor = null, dm = Infinity;
      this.drones.forEach(d => {
        if (d.resuelto || !d.vivo) return; // los drones en cola no se pueden atrapar
        const dist = d.grupo.position.distanceTo(p);
        if (dist < dm) { dm = dist; mejor = d; }
      });
      // Priorizar el dron de turno activo si está al alcance de captura
      if (this.dronActivo && this.dronActivo.vivo && !this.dronActivo.resuelto) {
        const dAct = this.dronActivo.grupo.position.distanceTo(p);
        if (dAct <= CONFIG.RADIO_CAPTURA) mejor = this.dronActivo;
      }
      if (mejor && (mejor === this.dronActivo || dm <= CONFIG.RADIO_CAPTURA)) this.atraparDrone(mejor, mano);
      else { Sonido.clic(); this.vibrar(mano, 0.15, 20); }
    },

    capturarEscritorio() {
      if (this.fase !== 'fase1' || this.el.is('vr-mode') || !this.el.camera) return;
      if (this.guanteIzquierdoPC) {
        this.pulsoGuantePC = 0.055;
      }
      let d = null;
      if (this.mouseActivo) {
        this.rayEscritorio.setFromCamera(this.mouse, this.el.camera);
        const hits = this.rayEscritorio.intersectObjects(this.objetivos.map(o => o.ent.object3D), true);
        d = hits[0] && this.datosDe(hits[0].object);
        if (!d) {
          const h = this.buscarImpactoRayo(this.rayEscritorio.ray);
          if (h && h.objetivo) d = h.objetivo;
        }
      }
      // Si el cursor no impacta directamente sobre el mesh pero el dron activo está en ventana de respuesta:
      if ((!d || d.tipo !== 'drone') && this.dronActivo && this.dronActivo.vivo && !this.dronActivo.resuelto && (this.dronActivo.sub === 'habla' || this.dronActivo.sub === 'decide')) {
        d = this.dronActivo;
      }
      if (d && d.tipo === 'drone' && d.vivo) this.atraparDrone(d, null); else Sonido.clic();
    },

    // El mando izquierdo no lleva láser: se apaga cada vez que laser-controls lo vuelve a encender
    ocultarLaserIzq(forzar) {
      const izq = this.manos[0];
      const rc = izq.components.raycaster;
      if (rc && (forzar || rc.data.showLine || rc.data.enabled)) izq.setAttribute('raycaster', { showLine: false, enabled: false });
      const ln = izq.getObject3D('line');
      if (ln) ln.visible = false;
    },

    // Aro de "zona de captura" alrededor de la mano izquierda
    montarHalo(mano) {
      if (mano.halo) return;
      const g = new THREE.Group();
      g.position.z = CONFIG.palmaZ;
      const aro1 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.004, 8, 48), matAditivo(COL.menta, 0));
      const aro2 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.0025, 6, 48), matAditivo(COL.menta, 0));
      aro2.rotation.y = Math.PI / 2;
      const brillo = crearGlow(COL.menta, 0.3, 0);
      g.add(aro1, aro2, brillo);
      g.visible = false;
      mano.object3D.add(g);
      mano.halo = { g, aro1, aro2, brillo, t: 0, pulso: 0 };
    },

    // Cada fotograma: ayuda visual y háptica de la mano izquierda según el dron más cercano
    actualizarMano(dt) {
      const izq = this.manos[0];
      if (!this.el.is('vr-mode')) return;
      this.ocultarLaserIzq(false);
      const h = izq.halo;
      if (!h) return;
      let dm = Infinity;
      if (this.fase === 'fase1') {
        const p = this.posMano(izq, this._pm || (this._pm = new V3()));
        this.drones.forEach(d => { if (!d.resuelto && d.vivo) dm = Math.min(dm, d.grupo.position.distanceTo(p)); });
      }
      h.t += dt;
      let op = 0, cerca = false;
      if (dm <= CONFIG.RADIO_AYUDA) {
        cerca = dm <= CONFIG.RADIO_CAPTURA;
        op = cerca ? 0.9 + Math.sin(h.t * 14) * 0.1 : THREE.MathUtils.lerp(0.25, 0.6, 1 - (dm - CONFIG.RADIO_CAPTURA) / (CONFIG.RADIO_AYUDA - CONFIG.RADIO_CAPTURA));
      }
      h.g.visible = op > 0.01;
      if (h.g.visible) {
        h.aro1.material.opacity = h.aro2.material.opacity = op;
        h.brillo.material.opacity = op * (cerca ? 0.8 : 0.35);
        const e = cerca ? 1.25 + Math.sin(h.t * 14) * 0.1 : 1;
        h.g.scale.setScalar(e);
        h.aro1.rotation.z += dt * 2; h.aro2.rotation.x += dt * 2.6;
        h.pulso -= dt;
        if (h.pulso <= 0) { this.vibrar(izq, cerca ? 0.22 : 0.08, cerca ? 30 : 20); h.pulso = cerca ? 0.18 : 0.4; }
      }
    },

    // ---------- Objetivos (entidades que el raycaster puede tocar) ----------
    // seleccionable = false: el objetivo existe en escena pero NO recibe disparos ni capturas (drones en cola) hasta llamar a habilitar()
    crearObjetivo(tipo, grupo, datos, seleccionable = true) {
      const ent = document.createElement('a-entity');
      if (seleccionable) ent.classList.add('disparable');
      ent.setObject3D('mesh', grupo);
      this.contenedor.appendChild(ent);
      const d = Object.assign({ tipo, ent, grupo, vivo: seleccionable, apuntado: false, t: 0 }, datos);
      ent.datosJuego = d;
      if (seleccionable) this.objetivos.push(d);
      return d;
    },
    habilitar(d) {
      if (d.vivo) return;
      d.vivo = true;
      d.ent.classList.add('disparable');
      if (this.objetivos.indexOf(d) < 0) this.objetivos.push(d);
      // que los láseres cuenten ya con el nuevo objetivo (no esperar al observador de A-Frame)
      try { this.manos.forEach(m => { const rc = m.components && m.components.raycaster; if (rc && rc.refreshObjects) rc.refreshObjects(); }); } catch (e) { /* sin láser */ }
    },
    desactivar(d) {
      d.vivo = false;
      d.apuntado = false;
      if (d.ent) d.ent.classList.remove('disparable');
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

    // ---------- Armas en primera persona (POV) para PC / Navegador ----------
    crearArmasPC() {
      this.rigArmasPC = new THREE.Group();
      this.rigArmasPC.visible = false;
      this.recoilArmaPC = 0;
      this.pulsoGuantePC = 0;
      this.armasPCMontadas = false;

      const vincularCamara = () => {
        if (this.el.camera && !this.rigArmasPC.parent) {
          this.el.camera.add(this.rigArmasPC);
        }
      };
      if (this.el.camera) vincularCamara();
      this.el.addEventListener('camera-set-active', vincularCamara);
      this.el.addEventListener('renderstart', vincularCamara);
    },

    montarArmasPC() {
      if (this.armasPCMontadas) return;
      if (!this.rigArmasPC) this.crearArmasPC();

      // 1. Mano Derecha: Ciber-Blaster Alienígena Halo Covenant + Guante Espacial
      this.armaDerechaPC = new THREE.Group();
      this.armaDerechaPC.position.set(0.24, -0.22, -0.42);

      const blaster = Modelos.clonar('blaster_naranja');
      if (blaster) {
        blaster.rotation.y = Math.PI; // cañón hacia -Z del jugador
        this.armaDerechaPC.add(blaster);
      }
      const manoDer = Modelos.clonar('mano_derecha');
      if (manoDer) {
        this.armaDerechaPC.add(manoDer);
      }

      this.bocaPC = crearGlow(COL.cian, 0.001, 0);
      this.bocaPC.position.set(0, 0.067, -0.205);
      this.armaDerechaPC.add(this.bocaPC);

      // 2. Mano Izquierda: Guante Espacial en postura abierta receptiva con vórtice de captura
      this.guanteIzquierdoPC = new THREE.Group();
      this.guanteIzquierdoPC.position.set(-0.24, -0.20, -0.38);
      this.guanteIzquierdoPC.rotation.set(-0.12, -0.20, 0.16);

      const guanteIzq = Modelos.clonar('mano_izquierda');
      if (guanteIzq) {
        this.guanteIzquierdoPC.add(guanteIzq);
      }

      // Vórtice energético sobre la palma receptiva
      const haloPalma = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.002, 6, 24), matAditivo(COL.menta, 0.8));
      haloPalma.position.set(0, -0.028, -0.002);
      haloPalma.rotation.x = Math.PI / 2;
      this.guanteIzquierdoPC.add(haloPalma);
      this.guanteIzquierdoPC.halo = haloPalma;

      this.rigArmasPC.add(this.armaDerechaPC, this.guanteIzquierdoPC);
      this.armasPCMontadas = true;
    },

    actualizarArmasPC(t, dt) {
      if (!this.rigArmasPC || !this.rigArmasPC.visible || !this.armasPCMontadas) return;

      // Balanceo orgánico y respiración sutil en primera persona
      const swayY = Math.sin(t * 0.002) * 0.0035;
      const swayX = Math.cos(t * 0.0014) * 0.002;

      if (this.armaDerechaPC) {
        this.armaDerechaPC.position.x = 0.24 + swayX;
        this.armaDerechaPC.position.y = -0.22 + swayY - this.recoilArmaPC * 0.35;
        this.armaDerechaPC.position.z = -0.42 + this.recoilArmaPC;
        this.recoilArmaPC *= Math.exp(-dt * 14);
      }

      if (this.guanteIzquierdoPC) {
        this.guanteIzquierdoPC.position.x = -0.24 - swayX;
        this.guanteIzquierdoPC.position.y = -0.20 + swayY * 0.8;
        this.guanteIzquierdoPC.position.z = -0.38 - this.pulsoGuantePC;
        if (this.guanteIzquierdoPC.halo) {
          this.guanteIzquierdoPC.halo.rotation.z += dt * 3.5;
        }
        this.pulsoGuantePC *= Math.exp(-dt * 12);
      }
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
      this.hudTitulo = 'CIBERESCUDO · CÓDIGO VERDE'; this.hudObjetivo = ''; this.hudTiempo = null;
      this.crearPlacaInicio();
    },

    // Placa de marca bajo el banner inicial: panel oscuro OPACO (1.3 × 0.34 m, canvas a 1000 px/m) con el logo de la Secretaría a
    // su tamaño nativo (500 × 200 px = 0.5 × 0.2 m, margen ≥ 40 px) y la leyenda a la derecha. Malla aparte del banner: no recibe
    // su glitch, su escritura ni su fundido. Está 0.4 m más cerca que el banner, para quedar delante del brillo del botón.
    crearPlacaInicio() {
      const c = document.createElement('canvas'); c.width = 1300; c.height = 340;
      const tex = texCanvas(c);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.34),
        new THREE.MeshBasicMaterial({ map: tex, transparent: false, opacity: 1, depthWrite: true, toneMapped: false, fog: false }));
      mesh.position.set(0, -0.22, 0.4);
      mesh.visible = false;
      mesh.name = 'placa_marca_inicio';
      this.visor.add(mesh);
      this.placaInicio = { canvas: c, ctx: c.getContext('2d'), tex, mesh, lista: false };
      Marca.cuando('logo', () => this.pintarPlacaInicio());
    },
    pintarPlacaInicio() {
      const p = this.placaInicio;
      if (!p || !Marca.imagen('logo')) return;
      const { ctx, canvas } = p, w = canvas.width, h = canvas.height;
      ctx.save();
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      ctx.fillStyle = Marca.FONDO; ctx.fillRect(0, 0, w, h);
      // Marco institucional exterior (dorado y cian en el borde de la placa, fuera de la reserva del logo)
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0, 175, 239, 0.65)'; ctx.strokeRect(2, 2, w - 4, h - 4);
      ctx.fillStyle = '#ffcc29';
      ctx.fillRect(0, 0, 56, 6); ctx.fillRect(0, 0, 6, 56);
      ctx.fillRect(w - 56, 0, 56, 6); ctx.fillRect(w - 6, 0, 6, 56);
      ctx.fillRect(0, h - 6, 56, 6); ctx.fillRect(0, h - 56, 6, 56);
      ctx.fillRect(w - 56, h - 6, 56, 6); ctx.fillRect(w - 6, h - 56, 6, 56);
      // El recuadro del logo coincide con el fondo opaco de la placa (margen interno 28 px ≥ 14 %)
      Marca.dibujar(ctx, 'logo', 18, (h - 256) / 2, 500);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffcc29'; ctx.font = `700 24px ${F_TIT}`;
      ctx.fillText('◆ CENTRO DE CIBERDEFENSA ESCOLAR · BOLÍVAR', 590, 88);
      ctx.fillStyle = '#e6ffee'; ctx.font = `600 40px ${F_TXT}`;
      const ls = lineas(ctx, Marca.LEYENDA, w - 620);
      ls.forEach((l, i) => ctx.fillText(l, 590, 170 + i * 48));
      ctx.fillStyle = '#00afef'; ctx.font = `700 24px ${F_MONO}`;
      ctx.fillText('> OPERACIÓN: CÓDIGO VERDE // NODO EDUCATIVO', 590, h - 54);
      ctx.restore();
      p.tex.needsUpdate = true;
      p.lista = true;
      if (this.fase === 'inicio') p.mesh.visible = true;
    },
    mostrarPlacaInicio(v) {
      const p = this.placaInicio;
      if (p) p.mesh.visible = !!v && p.lista;
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
        // efecto de escritura / glitch (solo en banners): se redibuja a ~30 fps mientras escribe y 2 veces por segundo después
        if (this.bannerDatos) {
          const clave = this.bannerT < 1.2 ? Math.floor(this.bannerT * 30) : 1000 + Math.floor(this.bannerT * 2);
          if (clave !== this.bannerClave) { this.bannerClave = clave; this.pintarBanner(this.bannerT); }
        }
        if (this.bannerDur > 0) {
          const quedan = this.bannerDur - this.bannerT;
          b.material.opacity = Math.max(0, Math.min(1, this.bannerT * 4, quedan * 2.5));
          if (quedan <= 0) b.visible = false;
        } else {
          b.material.opacity = Math.min(1, this.bannerT * 4);
        }
      }
    },

    mostrarBanner(titulo, sub, color = COL.fosforo, dur = 3.5) {
      this.bannerDatos = { titulo, sub: sub || '', color, lineasSub: null };
      this.bannerClave = -1;
      this.pintarBanner(0);
      this.banner.mesh.visible = true;
      this.banner.mesh.material.opacity = 0;
      this.bannerT = 0; this.bannerDur = dur;
      Sonido.tecleo();
    },
    // Dibuja el banner en el instante t: el texto se «escribe» con cursor y, al inicio, tiembla con un glitch verde
    pintarBanner(t) {
      const b = this.bannerDatos;
      if (!b) return;
      const { titulo, sub, color } = b;
      const total = titulo.length + sub.length;
      const n = Math.min(total, Math.floor(t * Math.max(70, total)));
      const escribiendo = n < total;
      const cursor = escribiendo || Math.floor(t * 2) % 2 === 0;
      const glitch = t < 0.45 ? 1 - t / 0.45 : 0;
      const nTit = Math.min(titulo.length, n);
      let restoSub = Math.max(0, n - titulo.length);
      this.banner.dibujar((ctx, w, h) => {
        marcoHUD(ctx, 8, 8, w - 16, h - 16, color, COL.fondoBanner);
        ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
        ctx.globalAlpha = 0.65; ctx.fillStyle = color; ctx.font = `600 24px ${F_MONO}`;
        ctx.fillText('> señal_entrante // ciberescudo', 44, 46);
        ctx.globalAlpha = 1;
        // título
        ctx.shadowColor = color; ctx.shadowBlur = 26; ctx.fillStyle = color;
        fuenteAjustada(ctx, titulo, 900, F_TIT, titulo.length <= 3 ? 190 : 74, w - 100);
        const ancho = ctx.measureText(titulo).width, x0 = (w - ancho) / 2, yT = sub ? 115 : h / 2;
        const parte = titulo.slice(0, nTit);
        if (glitch > 0) { // dos copias desplazadas, solo al aparecer
          ctx.globalAlpha = 0.55 * glitch; ctx.shadowBlur = 0;
          ctx.fillStyle = COL.menta; ctx.fillText(parte, x0 + (Math.random() - 0.3) * 26 * glitch, yT + (Math.random() - 0.5) * 8 * glitch);
          ctx.fillStyle = COL.verdeOscuro; ctx.fillText(parte, x0 - (Math.random() - 0.3) * 26 * glitch, yT);
          ctx.globalAlpha = 1; ctx.shadowBlur = 26; ctx.fillStyle = color;
        }
        ctx.fillText(parte, x0 + (glitch > 0 && Math.random() < 0.3 ? (Math.random() - 0.5) * 14 * glitch : 0), yT);
        ctx.shadowBlur = 0;
        let xc = x0 + ctx.measureText(parte).width, yc = yT, tam = 74;
        // subtítulo
        if (sub) {
          const fontSize = sub.length > 120 ? 38 : 44;
          ctx.fillStyle = COL.blancoVerde; ctx.font = `600 ${fontSize}px ${F_TXT}`;
          if (!b.lineasSub) b.lineasSub = lineas(ctx, sub, w - 130).slice(0, 5);
          let quedan = restoSub;
          const yBase = b.lineasSub.length > 3 ? 210 : 230;
          const salto = b.lineasSub.length > 3 ? 48 : 54;
          b.lineasSub.forEach((l, i) => {
            if (quedan <= 0) return;
            const trozo = l.slice(0, quedan);
            const xl = (w - ctx.measureText(l).width) / 2;
            ctx.fillText(trozo, xl, yBase + i * salto);
            xc = xl + ctx.measureText(trozo).width; yc = yBase + i * salto; tam = fontSize;
            quedan -= l.length + 1;
          });
        }
        if (cursor) { ctx.fillStyle = color; ctx.fillRect(xc + 8, yc - tam * 0.42, tam * 0.45, tam * 0.84); }
      });
    },
    ocultarBanner() { this.banner.mesh.visible = false; this.mostrarPlacaInicio(false); },

    marcarHUD() { this.hudSucio = true; },
    dibujarHUD() {
      this.hudSucio = false;
      this.hud.dibujar((ctx, w, h) => {
        marcoHUD(ctx, 4, 4, w - 8, h - 8, COL.fosforo);
        // Sello institucional discreto a la izquierda del HUD (escudo de Bolívar sobre fondo 100 % opaco)
        let xTxt = 34;
        if (Marca.imagen('escudo')) {
          const s = Marca.dibujar(ctx, 'escudo', 22, 18, 76, 0.14);
          if (s) xTxt = s.x + s.w + 22;
        }
        ctx.textBaseline = 'middle';
        ctx.fillStyle = COL.fosforo; fuenteAjustada(ctx, this.hudTitulo, 700, F_TIT, 30, 620);
        ctx.fillText(this.hudTitulo, xTxt, 46);
        ctx.fillStyle = COL.blancoVerde; fuenteAjustada(ctx, '> ' + this.hudObjetivo, 600, F_TXT, 30, 680);
        const txtObj = '> ' + this.hudObjetivo;
        ctx.fillText(txtObj, xTxt, 98);
        if (this.hudCursor) { // cursor de consola parpadeante
          ctx.fillStyle = COL.fosforo;
          ctx.fillRect(xTxt + ctx.measureText(txtObj).width + 8, 98 - 13, 14, 26);
        }

        if (this.hudTiempo != null) {
          ctx.textAlign = 'center';
          ctx.fillStyle = this.hudTiempo <= 10 ? COL.rojo : COL.menta;
          ctx.font = `900 54px ${F_TIT}`;
          ctx.fillText(mmss(this.hudTiempo), 830, 62);
          if (this.combo > 1) {
            ctx.fillStyle = COL.menta; ctx.font = `700 24px ${F_TIT}`;
            ctx.fillText(`COMBO x${this.combo}`, 830, 112);
          }
        }

        // ---------- Panel Derecho: Puntos y Barra de Vida del Jugador ----------
        const xDer = w - 430, anchoBarra = 396;

        // Puntos
        ctx.textAlign = 'left'; ctx.fillStyle = COL.gris; ctx.font = `700 24px ${F_TXT}`;
        ctx.fillText('PUNTOS', xDer, 46);
        ctx.textAlign = 'right'; ctx.fillStyle = COL.fosforo; ctx.font = `900 38px ${F_TIT}`;
        ctx.fillText(String(this.puntos), xDer + anchoBarra, 46);

        // Barra de Vida / Salud del Operador (activa en todas las fases jugables)
        if (this.fase !== 'menu' && this.fase !== 'informe') {
          const k = Math.max(0, Math.min(1, this.integridad / (this.integridadMax || 100)));
          const kFantasma = Math.max(0, Math.min(1, (this.integridadFantasma || this.integridad) / (this.integridadMax || 100)));
          const pct = Math.round(k * 100);
          const esCritico = k < 0.28;
          const colVida = k > 0.55 ? COL.menta : (k > 0.28 ? COL.ambar : COL.rojo);

          // Cabecera de salud con porcentaje numérico
          ctx.textAlign = 'left';
          ctx.fillStyle = '#b0cbe5';
          ctx.font = `700 19px ${F_TXT}`;
          ctx.fillText('SALUD / VIDA', xDer, 80);

          ctx.textAlign = 'right';
          ctx.fillStyle = esCritico && this.hudCursor ? COL.rojo : colVida;
          ctx.font = `900 21px ${F_TIT}`;
          ctx.fillText(`[ ${pct}% ]`, xDer + anchoBarra, 80);

          // Contenedor marco cyber
          const yB = 92, hB = 26;
          ctx.fillStyle = 'rgba(2, 6, 16, 0.92)';
          ctx.fillRect(xDer, yB, anchoBarra, hB);

          // Filete exterior luminoso
          ctx.lineWidth = 2;
          ctx.strokeStyle = esCritico && this.hudCursor ? COL.rojo : 'rgba(0, 229, 255, 0.55)';
          ctx.strokeRect(xDer, yB, anchoBarra, hB);

          // Barra fantasma roja de daño recibido
          if (kFantasma > k) {
            ctx.fillStyle = 'rgba(255, 42, 95, 0.55)';
            ctx.fillRect(xDer + 2, yB + 2, (anchoBarra - 4) * kFantasma, hB - 4);
          }

          // Relleno principal dinámico con gradiente
          if (k > 0) {
            const grad = ctx.createLinearGradient(xDer, yB, xDer + anchoBarra, yB);
            if (k > 0.55) {
              grad.addColorStop(0, '#0075b8'); grad.addColorStop(1, '#00e5ff');
            } else if (k > 0.28) {
              grad.addColorStop(0, '#c46a00'); grad.addColorStop(1, '#ffb703');
            } else {
              grad.addColorStop(0, '#9e0026'); grad.addColorStop(1, '#ff2a5f');
            }
            ctx.fillStyle = grad;
            ctx.shadowColor = colVida;
            ctx.shadowBlur = esCritico ? 16 : 8;
            ctx.fillRect(xDer + 2, yB + 2, (anchoBarra - 4) * k, hB - 4);
            ctx.shadowBlur = 0;
          }

          // 10 Segmentos tácticos para lectura inmediata de bloques de vida (cada uno = 10%)
          ctx.fillStyle = 'rgba(2, 6, 16, 0.75)';
          for (let s = 1; s < 10; s++) {
            ctx.fillRect(xDer + (anchoBarra / 10) * s - 1, yB, 2, hB);
          }
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
    sacudirCamara(intensidad = 0.09, duracion = 0.45) {
      this.tSacudida = duracion;
      this.durSacudida = duracion;
      this.intSacudida = intensidad;
    },
    recibirDano(cantidad) {
      this.integridad = Math.max(0, this.integridad - cantidad);
      this.flashDano();
      this.sacudirCamara(0.12, 0.5);
      Sonido.dano();
      this.vibrarAmbas(1.0, 320);
      this.marcarHUD();
      if (this.integridad <= 0) {
        Sonido.derrota();
        this.mostrarBanner('🚨 SISTEMA COMPROMETIDO', 'EL FIREWALL DE BOLÍVAR HA SIDO DERRIBADO', COL.rojo, 5.0);
        setTimeout(() => this.terminarFase1(), 1400);
      }
    },

    // Entorno para modo VR / pantalla (se oculta en realidad mixta)
    crearEntornoVirtual() {
      const ent = document.getElementById('entorno');
      if (!ent) return;
      const g = new THREE.Group();
      const piso = new THREE.Mesh(new THREE.PlaneGeometry(50, 50, 48, 48),
        new THREE.MeshBasicMaterial({ color: '#00e5ff', wireframe: true, transparent: true, opacity: 0.12 }));
      piso.rotation.x = -Math.PI / 2;
      const anillo1 = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.25, 64), matAditivo('#00e5ff', 0.75, { side: THREE.DoubleSide }));
      anillo1.rotation.x = -Math.PI / 2; anillo1.position.y = 0.01;
      const anillo2 = new THREE.Mesh(new THREE.RingGeometry(2.4, 2.44, 64), matAditivo('#ffcc29', 0.55, { side: THREE.DoubleSide }));
      anillo2.rotation.x = -Math.PI / 2; anillo2.position.y = 0.01;
      const n = 700, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const v = new V3(azar(-1, 1), azar(0.05, 1), azar(-1, 1)).normalize().multiplyScalar(50);
        pos.set([v.x, v.y, v.z], i * 3);
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const estrellas = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#80f3ff', size: 0.28, transparent: true, opacity: 0.65 }));
      g.add(piso, anillo1, anillo2, estrellas);
      this.entornoFondo = [piso];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const pilar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 8, 0.09), matAditivo(i % 2 ? '#00e5ff' : '#0075b8', 0.45));
        pilar.position.set(Math.cos(a) * 14, 4, Math.sin(a) * 14);
        g.add(pilar); this.entornoFondo.push(pilar);
      }
      ent.object3D.add(g);
      try {
        this.lluvia = Lluvia.cilindro();
        ent.object3D.add(this.lluvia);
      } catch (e) { console.warn('CiberEscudo: sin lluvia de código', e); this.lluvia = null; }
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
      Marca.cuando('logo', () => this.cubrirRotulosSala()); // marca real en lugar de los rótulos ficticios del kit
    },

    // Sustituye los rótulos ficticios «ASTRANOVA» del kit por la marca real (solo VR y pantalla: la sala no se ve en realidad mixta).
    // Frente y fondo: panel oscuro opaco con el logo de la Secretaría y un marco discreto, delante del decal y tapándolo por completo.
    // Consolas a ±60°: panel oscuro liso sobre el rótulo pequeño. Cada rótulo se comprueba contra los vértices de Decal_Cian;
    // si el GLB no coincide, ese rótulo se omite con un aviso. Los paneles cuelgan de la sala (se mueven y giran con ella).
    cubrirRotulosSala() {
      const sala = this.sala;
      if (!sala || this.marcaSala) return;
      const R = ROTULOS_SALA;
      const info = { cubiertos: [], omitidos: [] };
      this.marcaSala = info;
      // vértices del decal en el marco de la sala
      const verts = [];
      try {
        sala.updateMatrixWorld(true);
        const aSala = new THREE.Matrix4().copy(sala.matrixWorld).invert();
        sala.traverse(o => {
          const mats = o.isMesh ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
          if (!mats.some(m => m && m.name === 'Decal_Cian')) return;
          const pos = o.geometry.attributes.position;
          const m4 = new THREE.Matrix4().multiplyMatrices(aSala, o.matrixWorld);
          for (let i = 0; i < pos.count; i++) verts.push(new V3().fromBufferAttribute(pos, i).applyMatrix4(m4));
        });
      } catch (e) { console.warn('CiberEscudo: no se pudo leer el decal del kit', e); }
      const hayDecal = p => { const q = new V3(p[0], p[1], p[2]); return verts.some(v => v.distanceToSquared(q) < 0.03 * 0.03); };

      R.paredes.forEach(r => {
        if (!hayDecal(r.ancla)) { info.omitidos.push(r.id); console.warn('CiberEscudo: el rótulo', r.id, 'no está donde se esperaba; no se cubre'); return; }
        const { ancho, alto, logo, marco } = R.panel;
        const g = Marca.placa('logo', ancho, alto, logo);
        if (!g) return;
        // Marco arquitectónico de mando alrededor del panel (fuera del margen de seguridad del logo):
        // acero institucional oscuro (#182961) con filetes exteriores en cian (#00afef) y esquineros dorados (#ffcc29).
        const matAcero = new THREE.MeshBasicMaterial({ color: '#182961', toneMapped: false, fog: false });
        const matDorado = new THREE.MeshBasicMaterial({ color: '#ffcc29', toneMapped: false, fog: false });
        const matCian = new THREE.MeshBasicMaterial({ color: '#00afef', toneMapped: false, fog: false });
        const lis = (w, h, x, y, m = matAcero, z = 0) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, marco), m);
          mesh.position.set(x, y, z); g.add(mesh);
        };
        lis(ancho + 2 * marco, marco, 0, (alto + marco) / 2);
        lis(ancho + 2 * marco, marco, 0, -(alto + marco) / 2);
        lis(marco, alto, (ancho + marco) / 2, 0);
        lis(marco, alto, -(ancho + marco) / 2, 0);
        // Filetes luminosos institucionales en el borde exterior del marco
        lis(ancho * 0.65, 0.014, 0, alto / 2 + marco + 0.01, matDorado, 0.004);
        lis(ancho * 0.65, 0.014, 0, -(alto / 2 + marco + 0.01), matCian, 0.004);
        g.position.set(r.pos[0], r.pos[1], r.pos[2]);
        g.rotation.y = r.giro; // el plano mira a +Z; en el fondo gira 180° para mirar al centro de la sala
        g.name = 'marca_' + r.id;
        sala.add(g);
        info.cubiertos.push(r.id);
      });

      R.consolas.forEach(r => {
        if (!hayDecal(r.ancla)) { info.omitidos.push(r.id); console.warn('CiberEscudo: el rótulo', r.id, 'no está donde se esperaba; no se cubre'); return; }
        const ex = new V3(...r.ex), ey = new V3(...r.ey), ez = new V3().crossVectors(ex, ey);
        const c = new V3(...r.centro);
        if (ez.dot(c) > 0) ez.negate(); // la normal apunta hacia el centro de la sala (hacia el jugador)
        const m = new THREE.Mesh(new THREE.PlaneGeometry(R.consola.ancho, R.consola.alto), Marca.materialFondo(THREE.DoubleSide));
        m.position.copy(c).addScaledVector(ez, R.consola.avance);
        m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(ex, ey, new V3().crossVectors(ex, ey)));
        m.name = 'tapa_' + r.id;
        sala.add(m);
        info.cubiertos.push(r.id);
      });
    },

    // Sello de la plataforma y Pedestal de Mando Institucional (todos los modos, también realidad mixta):
    // En lugar de dejar el Escudo de Bolívar en el piso bajo los pies del jugador, el centro de la plataforma muestra
    // un anillo táctico de mando y el Escudo Oficial (marca/escudo.png, 1:1) se erige al frente en un atril/pedestal
    // inclinado hacia el operador sobre fondo oscuro 100 % opaco (#070a09) con margen de reserva y bisel institucional.
    montarSello() {
      if (!this.plataforma || this.sello) return;
      const g = new THREE.Group();
      // 1) Disco táctico bajo los pies (sin pisar el escudo institucional)
      const disco = new THREE.Mesh(new THREE.CircleGeometry(0.525, 64), Marca.materialFondo());
      disco.rotation.x = -Math.PI / 2;
      const aroFloor1 = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.49, 64),
        new THREE.MeshBasicMaterial({ color: '#00afef', toneMapped: false, fog: false, side: THREE.DoubleSide }));
      aroFloor1.rotation.x = -Math.PI / 2; aroFloor1.position.y = 0.002;
      const aroFloor2 = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.34, 64),
        new THREE.MeshBasicMaterial({ color: '#ffcc29', toneMapped: false, fog: false, side: THREE.DoubleSide }));
      aroFloor2.rotation.x = -Math.PI / 2; aroFloor2.position.y = 0.002;
      g.add(disco, aroFloor1, aroFloor2);

      // 2) Atril / Pedestal de Mando al borde frontal de la plataforma (z = -0.92 m, y = 0.34 m, inclinado hacia el jugador)
      const escudo = Marca.emblema('escudo', 0.34); // 0.34 × 0.34 m, proporción 1:1 intacta
      if (escudo) {
        const atril = new THREE.Group();
        atril.position.set(0, 0.34, -0.92);
        atril.rotation.x = -0.52; // inclinado ~30° para mirarlo de frente desde la posición de mando sin tapar drones
        // Respaldo 100 % opaco con margen de seguridad ≥ 14 % (0.46 × 0.46 m para escudo de 0.34 m)
        const placaBase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.018), Marca.materialFondo());
        const biselExt = new THREE.Mesh(new THREE.BoxGeometry(0.485, 0.485, 0.012),
          new THREE.MeshBasicMaterial({ color: '#182961', toneMapped: false, fog: false }));
        biselExt.position.z = -0.005;
        const filoOro = new THREE.Mesh(new THREE.BoxGeometry(0.495, 0.016, 0.02),
          new THREE.MeshBasicMaterial({ color: '#ffcc29', toneMapped: false, fog: false }));
        filoOro.position.set(0, 0.242, 0.002);
        const filoCian = new THREE.Mesh(new THREE.BoxGeometry(0.495, 0.016, 0.02),
          new THREE.MeshBasicMaterial({ color: '#00afef', toneMapped: false, fog: false }));
        filoCian.position.set(0, -0.242, 0.002);
        // Columna de soporte al piso de la plataforma
        const soporte = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.045, 0.36, 16),
          new THREE.MeshBasicMaterial({ color: '#122038', toneMapped: false, fog: false }));
        soporte.position.set(0, -0.18, -0.08);
        soporte.rotation.x = 0.52;
        escudo.position.z = 0.012;
        atril.add(biselExt, placaBase, filoOro, filoCian, escudo);
        atril.traverse(o => { o.raycast = () => {}; }); // nunca interfiere con disparos
        soporte.raycast = () => {};
        g.add(soporte, atril);
      }

      g.position.y = 0.012;
      g.name = 'sello_escudo';
      const f = this.frenteHorizontal();
      g.rotation.y = Math.atan2(-f.x, -f.z);
      this.sello = g;
      this.plataforma.add(g);
    },

    // Plataforma bajo el jugador (todos los modos) y sala centrada en el mismo punto (solo se ve fuera de AR)
    colocarEscenario() {
      const x = this.camPos.x, z = this.camPos.z;
      if (!this.plataforma) {
        const p = Modelos.clonar('plataforma_mando');
        if (p) { this.plataforma = p; this.raiz.add(p); Marca.cuando('escudo', () => this.montarSello()); }
      }
      if (this.plataforma) {
        this.plataforma.position.set(x, 0, z); this.plataforma.visible = true;
        // el escudo se lee derecho para quien mira al frente inicial (su parte superior apunta hacia delante)
        if (this.sello) { const f = this.frenteHorizontal(); this.sello.rotation.y = Math.atan2(-f.x, -f.z); }
      }
      if (this.lluvia) this.lluvia.position.set(x, LLUVIA.base + LLUVIA.alto / 2, z);
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
        const matE = new THREE.MeshStandardMaterial({ color: '#07180d', emissive: color, emissiveIntensity: 0.9, flatShading: true });
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
        ctx.fillStyle = 'rgba(0, 8, 3, 0.8)'; rr(ctx, 6, 6, w - 12, h - 12, 26); ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 4; rr(ctx, 6, 6, w - 12, h - 12, 26); ctx.stroke();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = color; ctx.shadowBlur = 22; ctx.fillStyle = color;
        fuenteAjustada(ctx, titulo, 900, F_TIT, 62, w - 60);
        ctx.fillText(titulo, w / 2, 76);
        ctx.shadowBlur = 0;
        if (detalle) {
          ctx.fillStyle = COL.blancoVerde; ctx.font = `700 42px ${F_TXT}`;
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
        marcoHUD(ctx, 8, 8, w - 16, h - 16, color, 'rgba(0, 10, 4, 0.92)');
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
      this.explosion(d.grupo.position.clone(), COL.menta, 40, false);
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

    // Goteo de código junto a los portales (solo realidad mixta): una malla, 3 tiras por portal
    montarGoteo() {
      this.quitarGoteo(true);
      if (!this.el.is('ar-mode') || !this.portales.length) return;
      try {
        this.goteo = Lluvia.goteo(this.portales);
        this.raiz.add(this.goteo);
        this.goteoCierra = false;
      } catch (e) { console.warn('CiberEscudo: sin goteo de código', e); this.goteo = null; }
    },
    quitarGoteo(ya) {
      if (!this.goteo) return;
      if (!ya) { this.goteoCierra = true; return; }
      this.raiz.remove(this.goteo); Lluvia.soltar(this.goteo); this.goteo = null;
    },
    actualizarLluvia(dt) {
      try {
        Lluvia.actualizar(dt);
        // Si el shader no compiló (three lo avisa en consola y no dibuja nada), se retira la lluvia y el juego sigue
        if (this.lluvia && !this.lluviaOk && this.lluvia.parent && this.lluvia.parent.visible) {
          this.lluviaT = (this.lluviaT || 0) + dt;
          if (this.lluviaT > 3 && this.el.renderer) {
            const pr = this.el.renderer.properties.get(this.lluvia.material), prog = pr && pr.currentProgram;
            if (!prog || (prog.diagnostics && prog.diagnostics.runnable === false)) {
              console.warn('CiberEscudo: el shader de la lluvia no compiló; el entorno sigue sin lluvia.');
              this.lluvia.visible = false;
            }
            this.lluviaOk = true;
          }
        }
        if (this.goteo) {
          const u = this.goteo.material.uniforms.uAparece;
          u.value = this.goteoCierra ? Math.max(0, u.value - dt * 2.5) : Math.min(1, u.value + dt * 0.8);
          if (this.goteoCierra && u.value <= 0) this.quitarGoteo(true);
        }
      } catch (e) { console.warn('CiberEscudo: error en la lluvia', e); }
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
      this.montarGoteo();
      Sonido.portal();
    },

    crearPortal(pos, normal) {
      const g = new THREE.Group();
      g.position.copy(pos);
      g.lookAt(pos.clone().add(normal));
      const marco = Modelos.clonar('portal_marco');
      const rv = marco ? 0.4 : 0.5; // con el marco GLB el hueco libre es de 0.83 m de diámetro
      const hueco = new THREE.Mesh(new THREE.CircleGeometry(rv, 48), new THREE.MeshBasicMaterial({ color: '#000302' }));
      const vortice = new THREE.Mesh(new THREE.CircleGeometry(rv, 48), new THREE.MeshBasicMaterial({
        map: texVortice(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      vortice.position.z = 0.005;
      let aro = marco && Modelos.nodo(marco, 'aro_exterior');
      let aro2 = marco && Modelos.nodo(marco, 'aro_interior');
      let marcas = marco && Modelos.nodo(marco, 'marcas');
      const brillo = crearGlow(COL.fosforo, 2.2, 0.5);
      brillo.position.z = -0.02;
      if (aro && aro2 && marcas) {
        g.add(brillo, hueco, vortice, marco); // los tres nodos giran sobre su eje Z local
      } else {
        aro = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.026, 8, 64), new THREE.MeshBasicMaterial({ color: COL.fosforo }));
        aro2 = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.008, 6, 64), matAditivo(COL.menta, 0.85));
        marcas = new THREE.Group();
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: COL.menta }));
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
    cerrarPortales() { this.portales.forEach(p => { p.cerrando = true; }); this.quitarGoteo(false); },

    // ---------- FASE 1: drones con mensajes (se ESCUCHAN; varios drones a la vez, pero solo habla UNO) ----------
    // Cada dron pasa por estos estados (d.estado):
    //   'aproximando' -> vuela de su portal a una casilla de espera (arco frente al jugador)
    //   'cola'        -> flota en su casilla, algo más pequeño; NO es seleccionable (sin hitbox, ni disparos ni capturas)
    //   'activo'      -> es su turno: vuela al punto de captura, habla su mensaje y el jugador decide
    //   'resuelto'    -> ya puntuó (solo se resuelve UNA vez; ver resolverDrone)
    // El dron activo tiene subestados (d.sub): 'vuelo' -> 'espera' (llegó; aguarda a que acabe la explicación hablada de un
    // error) -> 'habla' (suena su mensaje; ya se puede disparar/atrapar) -> 'decide' (ventanaDecision s tras el audio).
    // Turnos de audio: solo hay una voz a la vez. La explicación (retro) solo suena tras un ERROR y bloquea el inicio del
    // siguiente mensaje (retroRestante), pero el siguiente dron ya vuela a su posición mientras suena.
    maxVivos() { return Math.max(1, Math.min(MAX_DRONES_TOPE, Math.floor(CONFIG.maxDrones) || 1)); },

    siguienteCaso() {
      if (!this.mazo || !this.mazo.length) {
        this.mazo = barajar(CASOS_ESTAFA);
        if (this.primerMazo) {
          // la primera amenaza siempre es una estafa clara, para aprender a disparar
          const i = this.mazo.findIndex(c => c.esEstafa);
          this.mazo.push(this.mazo.splice(i, 1)[0]);
          this.primerMazo = false;
        } else if (this.mazo.length > 1 && this.mazo[this.mazo.length - 1].id === this.ultimoCasoId) {
          // mazo nuevo: que no empiece con el mismo caso con el que acabó el anterior
          const j = Math.floor(Math.random() * (this.mazo.length - 1)), u = this.mazo.length - 1;
          [this.mazo[j], this.mazo[u]] = [this.mazo[u], this.mazo[j]];
        }
      }
      const c = this.mazo.pop();
      this.ultimoCasoId = c.id;
      return c;
    },

    // --- Audio de la fase 1: se precarga por adelantado y se suelta al usarse ---
    cargarAudio(clave, url) {
      if (this.audios[clave]) return this.audios[clave].prom;
      const e = this.audios[clave] = { buf: undefined, prom: null }; // buf: undefined = cargando, null = falló
      e.prom = Sonido.cargar(url).then(b => { e.buf = b || null; return e.buf; }).catch(() => { e.buf = null; return null; });
      return e.prom;
    },
    bufAudio(clave) { const e = this.audios[clave]; return e ? e.buf : undefined; },
    soltarAudio(clave) { delete this.audios[clave]; },
    cargarDuraciones() {
      if (this.duraciones) return;
      this.duraciones = {};
      try {
        fetch('audio/duraciones.json').then(r => r.text())
          .then(t => { this.duraciones = JSON.parse(t.replace(/^﻿/, '')); })
          .catch(() => {});
      } catch (e) { /* sin duraciones: se estiman */ }
    },
    precargarCaso(c) {
      this.cargarAudio('m:' + c.id, `audio/mensajes/${c.id}.mp3`);
      this.cargarAudio('r:' + c.id, `audio/retro/${c.id}.mp3`);
    },
    // Casos ya sorteados (con el audio precargado) a la espera de salir de un portal: uno por cada dron que cabe vivo
    rellenarCasos() {
      while (this.casosListos.length < this.maxVivos()) { const c = this.siguienteCaso(); this.casosListos.push(c); this.precargarCaso(c); }
    },
    tomarCaso() {
      this.rellenarCasos();
      const c = this.casosListos.shift();
      this.rellenarCasos();
      return c;
    },
    duracionMensaje(c) {
      const b = this.bufAudio('m:' + c.id);
      if (b) return b.duration;
      return (this.duraciones && this.duraciones['mensajes/' + c.id]) || CONFIG.duracionMensajeEstimada;
    },
    duracionRetro(c) {
      const b = this.bufAudio('r:' + c.id);
      if (b) return b.duration;
      return (this.duraciones && this.duraciones['retro/' + c.id]) || CONFIG.duracionRetroEstimada;
    },

    // --- Casillas de espera: arco frente al jugador (respecto a la dirección en la que miraba al empezar la fase 1) ---
    angulosEspera() {
      const n = this.maxVivos(), clave = n + ':' + CONFIG.esperaArco;
      if (this._claveAng !== clave) {
        const a = [];
        for (let i = 0; i < n; i++) a.push(n === 1 ? 0 : -CONFIG.esperaArco + (2 * CONFIG.esperaArco * i) / (n - 1));
        a.sort((x, y) => Math.abs(y) - Math.abs(x)); // primero los extremos, el centro (donde está el HUD) al final
        this._claveAng = clave; this._angulos = a;
      }
      return this._angulos;
    },
    dronesEnEspera() { return this.drones.filter(d => !d.resuelto && (d.estado === 'aproximando' || d.estado === 'cola')); },
    casillaLibre() {
      const usadas = new Set(this.dronesEnEspera().map(d => d.casilla));
      const n = this.angulosEspera().length;
      for (let i = 0; i < n; i++) if (!usadas.has(i)) return i;
      return 0;
    },
    posEspera(d, salida) {
      const ang = (this.angulosEspera()[d.casilla] || 0) * Math.PI / 180;
      salida.copy(this.dirBase).applyAxisAngle(EJE_Y, ang).multiplyScalar(CONFIG.esperaDist).add(this.camPos);
      salida.y = this.camPos.y - CONFIG.esperaBajo;
      return salida;
    },

    // Punto de captura: delante del jugador (en horizontal) y a la altura del pecho; sigue al jugador si se mueve
    puntoLlegada(d, salida) {
      salida.copy(this.camPos).addScaledVector(d.dirLlegada || this.dirBase, CONFIG.llegadaDist);
      salida.y = this.camPos.y - CONFIG.llegadaBajo;
      return salida;
    },

    // Nace en un portal con su etiqueta corta y SIN hitbox: no es seleccionable hasta que le toca hablar
    lanzarDrone(caso) {
      if (!this.portales.length) return false;
      let idx = Math.floor(Math.random() * this.portales.length);
      if (idx === this.ultimoPortal && this.portales.length > 1) idx = (idx + 1) % this.portales.length;
      this.ultimoPortal = idx;
      const portal = this.portales[idx];
      portal.pulso = 1;

      const origen = portal.grupo.position.clone().addScaledVector(portal.normal, 0.2);
      const g = new THREE.Group();
      g.position.copy(origen);
      const brillo = crearGlow(COL.fosforo, 0.7, 0.8);
      const panel = new Panel(0.56, 0.15, 672, 180);
      panel.mesh.position.set(0, 0.3, 0);
      // dron GLB (el lente mira a +Z, que es hacia donde apunta lookAt); si no cargó, el dron procedural de siempre.
      // Amenazas y mensajes seguros usan EXACTAMENTE la misma carcasa.
      const modelo = Modelos.clonar('dron_mensaje');
      const anillo = modelo && Modelos.nodo(modelo, 'anillo');
      let nucleo = null, cascara = null, aro = null;
      // Hitbox sólida y generosa (0.9 × 0.9 × 0.8 m) para impacto garantizado al disparar
      const colision = this.zonaColision(0.9, 0.9, 0.8);
      if (modelo && anillo) {
        g.add(brillo, modelo, panel.mesh, colision);
      } else {
        nucleo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), new THREE.MeshStandardMaterial({
          color: '#051020', emissive: COL.fosforo, emissiveIntensity: 0.7, flatShading: true, metalness: 0.6, roughness: 0.3
        }));
        cascara = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1),
          new THREE.MeshBasicMaterial({ color: COL.cian, wireframe: true, transparent: true, opacity: 0.45 }));
        aro = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.007, 6, 40), new THREE.MeshBasicMaterial({ color: COL.fosforo }));
        g.add(brillo, nucleo, cascara, aro, panel.mesh, colision);
      }

      const d = this.crearObjetivo('drone', g, {
        caso, panel, texto: false, nucleo, cascara, aro, anillo: modelo ? anillo : null, origen,
        estado: 'aproximando', casilla: this.casillaLibre(), orden: ++this.nLanzados, escala: CONFIG.escalaEspera,
        sub: null, tSub: 0, tVuelo: 0, desde: null, dirLlegada: null, durMsg: 0,
        fase: azar(0, 6), resuelto: false, voz: null, captura: null
      }, true); // SIEMPRE VIVO Y SELECCIONABLE: DISPAROS CONECTAN DESDE EL PRIMER INSTANTE
      this.dibujarEtiquetaDrone(d);
      this.drones.push(d);
      Sonido.aparicion();
      return true;
    },

    // Etiqueta del dron: en cola muestra «app · remitente»; cuando está ACTIVO muestra además un extracto clave del mensaje
    // y una barra de progreso de voz/decisión para reforzar la comprensión en salones ruidosos (doble canal: auditivo + visual).
    dibujarEtiquetaDrone(d) {
      const c = d.caso;
      d.panel.dibujar((ctx, w, h) => {
        const esActivo = d.estado === 'activo';
        const enDecide = esActivo && d.sub === 'decide';
        const esAmenaza = c && c.esEstafa;
        const colorMarco = enDecide ? (esAmenaza ? COL.rojo : COL.menta) : (esActivo ? COL.fosforo : COL.cian);
        marcoHUD(ctx, 6, 6, w - 12, h - 12, colorMarco);
        ctx.textBaseline = 'middle'; ctx.textAlign = 'left';

        let linea = `> ${c.app} · ${c.remitente}`;
        if (enDecide) {
          linea = esAmenaza ? '⚠ ¡AMENAZA EN CURSO! ¡DISPARA!' : '✔ ¡MENSAJE LEGÍTIMO! ¡ATRÁPALO!';
        }
        ctx.fillStyle = colorMarco;
        if (!d.texto) {
          if (esActivo) {
            fuenteAjustada(ctx, linea, 700, F_TXT, enDecide ? 35 : 33, w - 56);
            ctx.textAlign = 'center';
            ctx.fillText(linea, w / 2, 48);
            const extracto = c.mensaje.length > 56 ? c.mensaje.slice(0, 54) + '…' : c.mensaje;
            ctx.fillStyle = enDecide && esAmenaza ? '#ffccd5' : COL.blancoVerde;
            fuenteAjustada(ctx, extracto, 600, F_TXT, 29, w - 48);
            ctx.fillText(extracto, w / 2, 104);
            // Barra de tiempo de escucha / ventana de decisión al pie del panel
            const bx = 42, by = h - 30, bw = w - 84, bh = 10;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.fillRect(bx, by, bw, bh);
            let prog = 1, colBarra = '#00afef';
            if (d.sub === 'habla' && d.durMsg > 0) {
              prog = Math.max(0, Math.min(1, d.tSub / d.durMsg));
              colBarra = '#00afef';
            } else if (d.sub === 'decide') {
              prog = Math.max(0, Math.min(1, 1 - d.tSub / CONFIG.ventanaDecision));
              colBarra = esAmenaza ? COL.rojo : COL.menta;
            }
            ctx.fillStyle = colBarra;
            ctx.fillRect(bx, by, bw * prog, bh);
          } else {
            fuenteAjustada(ctx, linea, 700, F_TXT, 46, w - 60);
            ctx.textAlign = 'center';
            ctx.fillText(linea, w / 2, h / 2 + 2);
          }
          return;
        }
        fuenteAjustada(ctx, linea, 700, F_TXT, 40, w - 72);
        ctx.fillText(linea, 36, 56);
        ctx.fillStyle = COL.blancoVerde; ctx.font = `600 40px ${F_TXT}`;
        lineas(ctx, c.mensaje, w - 72).slice(0, 6).forEach((l, i) => ctx.fillText(l, 36, 130 + i * 46));
      });
    },
    // Fallback sin audio: el panel pequeño se cambia por el del mensaje completo
    pasarATexto(d) {
      d.grupo.remove(d.panel.mesh); liberar(d.panel.mesh);
      d.panel = new Panel(0.95, 0.52, 760, 416);
      d.panel.mesh.position.set(0, 0.5, 0);
      d.grupo.add(d.panel.mesh);
      d.texto = true;
      this.dibujarEtiquetaDrone(d);
    },

    // --- Marcador del dron activo: un aro (1 llamada de dibujo) que se mueve de dron en dron. Igual para amenaza y seguro. ---
    ponerMarca(d) {
      if (!this.marca) {
        const m = new THREE.Mesh(new THREE.RingGeometry(0.29, 0.315, 48), matAditivo(COL.fosforo, 0.9, { side: THREE.DoubleSide }));
        m.geometry.userData.compartida = true; m.material.userData.compartida = true; // liberar() no lo destruye con el dron
        m.raycast = () => {}; // decorativo
        m.renderOrder = 4;
        this.marca = m;
      }
      if (this.marca.parent) this.marca.parent.remove(this.marca);
      d.grupo.add(this.marca);
    },
    quitarMarca(d) {
      const m = this.marca;
      if (m && m.parent && (!d || m.parent === d.grupo)) m.parent.remove(m);
    },
    animarMarca(d) {
      const m = this.marca;
      if (!m || m.parent !== d.grupo) return;
      let esc = 1 + Math.sin(d.t * 6) * 0.04;
      if (d.sub === 'decide') esc *= 1 - 0.3 * Math.min(1, d.tSub / CONFIG.ventanaDecision); // el aro se cierra mientras se agota la ventana
      m.scale.setScalar(esc);
      const urgente = d.sub === 'decide' && CONFIG.ventanaDecision - d.tSub < 1; // último segundo: ámbar (igual para todos los drones)
      if (m.userData.urgente !== urgente) { m.userData.urgente = urgente; m.material.color.set(urgente ? COL.ambar : COL.fosforo); }
      m.material.opacity = (d.sub === 'habla' || d.sub === 'decide') ? 0.9 : 0.5;
    },

    // --- Gestión de la fase: lanzamientos y turnos ---
    // Llamada cada fotograma en la fase 1 (restante = s que quedan de la fase)
    gestionarFase1(dt, restante) {
      if (restante < CONFIG.cierreLanzamiento) this.sinMasDrones = true; // ya no cabe ningún dron completo
      this.tLanzar = Math.max(0, this.tLanzar - dt);
      if (!this.sinMasDrones && this.tLanzar <= 0) {
        const vivos = this.drones.reduce((n, d) => n + (d.resuelto ? 0 : 1), 0);
        if (vivos < this.maxVivos()) {
          if (this.lanzarDrone(this.tomarCaso())) this.tLanzar = CONFIG.intervaloLanzamiento;
          else this.sinMasDrones = true; // sin portales
        }
      }
      if (restante <= 0) this.disolverEnEspera();
      this.pasarTurno();
      const n = this.dronesEnEspera().length;
      if (n !== this.hudCola) { // HUD: «COLA: n» = drones esperando su turno
        this.hudCola = n;
        this.hudObjetivo = `COLA: ${n} · ` + this.hudControles();
        this.marcarHUD();
      }
    },

    // Si nadie tiene el turno, lo toma el dron que lleva más tiempo esperando (si todavía cabe en el tiempo que queda)
    pasarTurno() {
      if (this.fase !== 'fase1' || this.dronActivo) return;
      let sig = null;
      this.drones.forEach(d => {
        if (!d.resuelto && (d.estado === 'cola' || d.estado === 'aproximando') && (!sig || d.orden < sig.orden)) sig = d;
      });
      if (!sig) return;
      const restante = CONFIG.duracionFase1 - this.tFase;
      const necesario = CONFIG.vueloActivo * this.factorNivel() + this.retroRestante + this.duracionMensaje(sig.caso) + CONFIG.ventanaDecision;
      if (restante < necesario) { // no cabe su turno completo: no se activa nadie más y los que esperan se disuelven
        this.sinMasDrones = true;
        this.disolverEnEspera();
        return;
      }
      this.activarDrone(sig);
    },
    // Los drones que no llegaron a tener turno desaparecen sin puntuar (ni cuentan en el informe)
    disolverEnEspera() {
      this.dronesEnEspera().forEach(d => { this.absorber(d.grupo.position.clone(), COL.menta); this.quitarDrone(d); });
    },

    // Niveles de velocidad de los drones según el tiempo de la ronda: lento al empezar, luego más rápido.
    // Factor > 1 = más lento. Se fija por dron al lanzarlo (ver tAprox y tVuelo).
    factorNivel() {
      const t = this.tFase || 0;
      const niveles = CONFIG.nivelesVelocidad;
      for (const n of niveles) if (t < n.hasta) return n.factor;
      return niveles[niveles.length - 1].factor;
    },

    activarDrone(d) {
      d.estado = 'activo'; d.sub = 'vuelo'; d.tSub = 0;
      this.dronActivo = d;
      d.desde = d.grupo.position.clone();
      d.dirLlegada = this.frenteHorizontal();
      const dest = this.puntoLlegada(d, new V3());
      const f = d.factorVuelo ?? this.factorNivel();
      d.tVuelo = Math.min(3.0 * f, Math.max(CONFIG.vueloActivo * f, d.desde.distanceTo(dest) / 1.5)); // ≈ 2 s desde la casilla (× nivel)
      this.ponerMarca(d);
      this.dibujarEtiquetaDrone(d);
    },

    // El dron activo llegó al punto de captura: su mensaje empieza cuando no suena ninguna explicación.
    // Con voz: audio espacial desde el dron. Sin voz (MP3 sin cargar o AudioContext parado): el mensaje completo en un panel.
    intentarHablar(d) {
      if (this.retroRestante > 0) return; // cola de voces: primero termina la explicación del error
      const clave = 'm:' + d.caso.id, e = this.audios[clave];
      if (e && e.buf === undefined && Sonido.listo() && d.tSub < 1.5) return; // el MP3 aún se está cargando: espera un momento
      const buf = this.bufAudio(clave);
      const conVoz = !!buf && Sonido.listo();
      d.durMsg = this.duracionMensaje(d.caso);
      if (conVoz) d.voz = Sonido.voz(buf, () => d.grupo.position);
      else this.pasarATexto(d);
      d.grupo.add(this.zonaColision(0.5, 0.5, 0.4)); // la hitbox solo existe mientras el dron es seleccionable
      this.habilitar(d); // desde ahora se puede disparar o atrapar
      d.sub = 'habla'; d.tSub = 0;
    },

    actualizarDrones(dt) {
      const tmp = this._tmpD || (this._tmpD = new V3());
      const casilla = this._tmpC || (this._tmpC = new V3());
      for (let i = this.drones.length - 1; i >= 0; i--) {
        const d = this.drones[i];
        d.t += dt;
        if (d.captura) {
          // atrapado: el dron se encoge hacia la mano
          const c = d.captura; c.t += dt;
          const k = Math.min(1, c.t / 0.35);
          if (c.mano) this.posMano(c.mano, tmp);
          else tmp.copy(this.camPos).addScaledVector(this.camDir, 0.3).add(new V3(0, -0.15, 0));
          d.grupo.position.lerpVectors(c.desde, tmp, sueve(k));
          d.grupo.scale.setScalar(Math.max(0.001, 1 - k * 0.95));
          if (k >= 1) this.quitarDrone(d);
          continue;
        }
        if (d.resuelto) continue;

        if (d.estado === 'activo') {
          d.tSub += dt;
          this.puntoLlegada(d, tmp);
          if (d.sub === 'vuelo') {
            const k = Math.min(1, d.tSub / d.tVuelo);
            // Trayectoria parabólica curva hacia el operador
            const arcoY = Math.sin(k * Math.PI) * 0.16;
            d.grupo.position.lerpVectors(d.desde, tmp, sueve(k));
            d.grupo.position.y += arcoY;
            if (k >= 1) { d.sub = 'espera'; d.tSub = 0; }
          } else {
            // EL DRON ACTIVO NUNCA SE DETIENE: levitación activa continua con micro-maniobras aéreas y deriva física
            const tH = d.t * 3.2 + d.fase;
            const oscX = Math.cos(tH * 0.85) * 0.085 + Math.sin(tH * 0.4) * 0.035;
            const oscY = Math.sin(tH * 1.1) * 0.065 + Math.cos(tH * 1.8) * 0.022;
            const oscZ = Math.sin(tH * 1.3) * 0.052;
            d.grupo.position.set(tmp.x + oscX, tmp.y + oscY, tmp.z + oscZ);

            // Inclinación aerodinámica calculada según la oscilación
            d._tiltZ = -oscX * 2.8;
            d._tiltX = oscZ * 2.2;
          }
          if (d.sub === 'espera') this.intentarHablar(d);
          else if (d.sub === 'habla') {
            if (d.tSub >= d.durMsg) {
              d.sub = 'decide';
              d.tSub = 0;
              d.inicioCarga = d.grupo.position.clone();
            }
            const pasoBarra = Math.floor(d.tSub * 8);
            if (!d.texto && pasoBarra !== d._pasoBarra) { d._pasoBarra = pasoBarra; this.dibujarEtiquetaDrone(d); }
          } else if (d.sub === 'decide') {
            const c = d.caso;
            if (c && c.esEstafa) {
              // AMENAZA EN CURSO: El dron NO se queda quieto; inicia embestida directa acelerada contra la cara del jugador
              const kCarga = Math.min(1, d.tSub / CONFIG.ventanaDecision);
              const targetCam = this.camPos.clone().add(new V3(0, -0.08, 0));
              d.grupo.position.lerpVectors(d.inicioCarga || tmp, targetCam, sueve(kCarga));
              d._tiltX = 0.52; // picado aerodinámico amenazante
              if (d.anillo) d.anillo.rotation.y += dt * 14;

              // Si alcanza la proximidad del visor (< 0.44 m) o concluye la embestida: ¡EXPLOSIÓN E IMPACTO!
              if (d.grupo.position.distanceTo(this.camPos) <= 0.44 || kCarga >= 1) {
                this.impactarJugador(d);
                continue;
              }
            } else {
              // MENSAJE LEGÍTIMO: se desplaza suavemente al flanco izquierdo para atraparlo con la mano
              const kG = Math.min(1, d.tSub / 0.7);
              const flanco = this.camPos.clone().addScaledVector(this.frenteHorizontal(), 0.75).add(new V3(-0.35, -0.15, 0));
              d.grupo.position.lerpVectors(tmp, flanco, sueve(kG));
              if (d.tSub >= CONFIG.ventanaDecision) {
                this.llegaDrone(d); // expira pacíficamente sin dañar
                continue;
              }
            }
            const pasoBarra = 1000 + Math.floor(d.tSub * 10);
            if (!d.texto && pasoBarra !== d._pasoBarra) { d._pasoBarra = pasoBarra; this.dibujarEtiquetaDrone(d); }
          }
          this.animarMarca(d);
        } else {
          // aproximando -> cola: vuela a su casilla y patrulla con suavidad
          if (d.estado === 'aproximando' && d.tAprox === undefined) d.tAprox = CONFIG.tiempoAproximacion * this.factorNivel();
          const k = d.estado === 'aproximando' ? Math.min(1, d.t / d.tAprox) : 1;
          const s = sueve(k);
          this.posEspera(d, casilla);
          d.grupo.position.lerpVectors(d.origen, casilla, s);
          // Patrullaje activo en espera: nunca estático
          const tQ = d.t * 1.8 + d.fase;
          d.grupo.position.y += Math.sin(tQ * 1.9) * 0.062 * s;
          d.grupo.position.x += Math.sin(tQ * 1.1) * 0.075 * s;
          d.grupo.position.z += Math.cos(tQ * 1.3) * 0.048 * s;
          d._tiltZ = Math.sin(tQ * 1.4) * 0.18;
          d._tiltX = Math.cos(tQ * 1.2) * 0.12;
          if (k >= 1) d.estado = 'cola';
        }

        d.grupo.lookAt(this.camPos);
        if (d._tiltZ !== undefined) {
          d.grupo.rotateZ(d._tiltZ);
          d.grupo.rotateX(d._tiltX);
        }
        d.escala += ((d.estado === 'activo' ? 1 : CONFIG.escalaEspera) - d.escala) * Math.min(1, dt * 6);
        d.grupo.scale.setScalar(Math.max(0.001, rebote(d.t / 0.6)) * d.escala * (d.apuntado ? 1.05 : 1));
        if (d.anillo) {
          d.anillo.rotation.y += dt * (d.apuntado ? 8.5 : 3.8); // propulsor giroscópico girando continuamente
          d.anillo.rotation.x = Math.sin(d.t * 5 + d.fase) * 0.25;
        } else {
          d.cascara.rotation.x += dt * 1.2; d.cascara.rotation.y += dt * 1.5;
          d.aro.rotation.z += dt * (d.apuntado ? 8 : 3.5);
          d.aro.material.color.set(d.apuntado ? COL.cian : COL.menta);
          d.nucleo.rotation.y -= dt * 2.2;
        }
      }
    },

    quitarDrone(d) {
      const i = this.drones.indexOf(d);
      if (i >= 0) this.drones.splice(i, 1);
      if (d.voz) { d.voz.detener(); d.voz = null; }
      if (this.dronActivo === d) this.dronActivo = null;
      this.quitarMarca(d);
      this.retirar(d);
    },

    // Explosión e impacto directo de amenaza contra la cara/visor del jugador
    impactarJugador(d) {
      if (d.resuelto) return;
      d.resuelto = true;
      d.estado = 'resuelto';
      this.desactivar(d);
      this.quitarMarca(d);
      if (this.dronActivo === d) this.dronActivo = null;
      if (d.voz) { d.voz.detener(); d.voz = null; }

      const c = d.caso, s = this.stats;
      const pos = d.grupo.position.clone();
      s.amenazasTotal++;
      s.amenazasRecibidas++;
      s.errores++;

      // 1. Violenta explosión en la cara del jugador
      Sonido.explosion();
      this.explosion(pos, COL.rojo, 90);
      this.explosion(this.camPos, COL.ambar, 45, false);

      // 2. Sacudida física de pantalla y cámara
      this.sacudirCamara(0.14, 0.55);

      // 3. Destello de daño en la retina del jugador
      this.flashDano();

      // 4. Haptic rumble máximo en los mandos de Quest
      this.vibrarAmbas(1.0, 350);

      // 5. Restar vida con la nueva barra de vida del jugador
      this.fallar();
      this.sumar(-CONFIG.penalAtaque);
      this.recibirDano(CONFIG.danoEstafa);

      this.textoFlotante(pos, `⚠ ¡IMPACTO CRÍTICO! −${CONFIG.danoEstafa}% SALUD`, c.retro, COL.rojo);
      this.reproducirRetro(c);
      this.quitarDrone(d);
      this.pasarTurno();
    },

    // Único punto donde se puntúa un dron: disparo, captura o llegada
    resolverDrone(d, via, mano) {
      if (d.resuelto) return false;
      d.resuelto = true; d.estado = 'resuelto';
      this.desactivar(d);
      this.quitarMarca(d);
      if (this.dronActivo === d) this.dronActivo = null;
      if (d.voz) { d.voz.detener(); d.voz = null; }
      const c = d.caso, amenaza = c.esEstafa, s = this.stats;
      const pos = d.grupo.position.clone();
      let conservar = false;
      let error = false;
      if (amenaza) s.amenazasTotal++; else s.segurosTotal++;

      if (via === 'disparo') {
        if (amenaza) {
          const total = CONFIG.puntosBloqueo + this.acertar();
          this.sumar(total);
          s.amenazasNeutralizadas++;
          Sonido.explosion(); Sonido.acierto();
          this.explosion(pos, COL.fosforo, 65);
          this.explosion(pos, COL.menta, 35, false);
          this.textoFlotante(pos, `✔ +${total} NEUTRALIZADA` + (this.combo > 1 ? ` x${this.combo}` : ''), c.retro, COL.menta);
        } else {
          error = true;
          this.fallar();
          this.sumar(-CONFIG.penalLegitimo);
          this.recibirDano(CONFIG.danoFuegoAmigo);
          s.segurosDisparados++; s.errores++;
          Sonido.explosion(); Sonido.error();
          this.explosion(pos, COL.rojo, 45);
          this.textoFlotante(pos, `✖ −${CONFIG.penalLegitimo} · ¡FUEGO AMIGO! ERA SEGURO`, c.retro, COL.rojo);
        }
        if (mano) this.vibrar(mano, 0.85, 100);
      } else if (via === 'captura') {
        if (amenaza) {
          error = true;
          const donde = mano ? this.posMano(mano) : pos.clone();
          this.fallar();
          this.sumar(-CONFIG.penalAtrapada);
          this.recibirDano(CONFIG.danoEstafa);
          s.amenazasAtrapadas++; s.errores++;
          Sonido.explosion(); Sonido.error();
          this.explosion(donde, COL.rojo, 65);
          this.textoFlotante(donde, `✖ −${CONFIG.penalAtrapada} · ¡DETONÓ EN TU MANO!`, c.retro, COL.rojo);
          if (mano) this.vibrar(mano, 1, 260);
        } else {
          const total = CONFIG.puntosAtrapar + this.acertar();
          this.sumar(total);
          s.segurosAtrapados++;
          Sonido.captura(); Sonido.acierto();
          const donde = mano ? this.posMano(mano) : pos.clone();
          this.absorber(donde, COL.menta);
          this.textoFlotante(pos, `✔ +${total} ATRAPADO` + (this.combo > 1 ? ` x${this.combo}` : ''), c.retro, COL.menta);
          if (mano) this.vibrar(mano, 1, 130);
          d.captura = { t: 0, mano, desde: pos.clone() };
          conservar = true;
        }
      } else { // llegada (la ventana de decisión se agotó)
        if (amenaza) {
          this.impactarJugador(d);
          return true;
        } else {
          this.fallar();
          this.sumar(-CONFIG.penalPerdido);
          s.segurosPerdidos++;
          Sonido.error();
          this.absorber(pos, COL.gris);
          this.textoFlotante(pos, `✖ SE TE PASÓ EL MENSAJE`, c.retro, COL.rojo);
        }
      }
      this.marcarHUD();
      if (error) this.reproducirRetro(c);
      else { this.soltarAudio('m:' + c.id); this.soltarAudio('r:' + c.id); } // acierto: sin voz, solo efecto y puntos
      if (!conservar) this.quitarDrone(d);
      this.pasarTurno(); // el siguiente de la cola vuela ya al punto de captura (su mensaje espera a la explicación)
      return true;
    },

    // Explicación hablada de un ERROR («Amenaza: …» / «Seguro: …»). Mientras suena, el siguiente mensaje espera (retroRestante).
    // Sin audio no suena nada, pero el tiempo de espera se respeta para mantener el mismo ritmo.
    reproducirRetro(c) {
      const b = this.bufAudio('r:' + c.id);
      if (b && Sonido.listo()) Sonido.voz(b);
      this.retroRestante = this.duracionRetro(c);
      this.soltarAudio('m:' + c.id); this.soltarAudio('r:' + c.id); // libera lo ya usado
    },

    llegaDrone(d) { return this.resolverDrone(d, 'llegada', null); },
    dispararDrone(d, mano) { return this.resolverDrone(d, 'disparo', mano); },
    atraparDrone(d, mano) { return this.resolverDrone(d, 'captura', mano); },

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
        relleno = matAditivo(COL.menta, 0.3);
        malla = new THREE.MeshBasicMaterial({ color: COL.menta, wireframe: true, transparent: true, opacity: 0.75 });
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
        base1 = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.47, 48), matAditivo(COL.menta, 0.8, { side: THREE.DoubleSide }));
        base1.rotation.x = -Math.PI / 2; base1.position.y = 0.01;
        g.add(base1);
      }
      const luz = crearGlow(COL.menta, 1.6, 0.35); luz.position.y = 1.0;
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
          new THREE.MeshBasicMaterial({ color: COL.protegido, wireframe: true, transparent: true, opacity: 0 }));
        escudoRelleno = new THREE.Mesh(new THREE.SphereGeometry(0.98, 32, 16), matAditivo(COL.protegido, 0));
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
        const color = a.protegido ? COL.protegido : (a.animo > 0.5 ? COL.menta : COL.rojo);
        marcoHUD(ctx, 4, 4, w - 8, h - 8, color);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color; ctx.font = `900 34px ${F_TIT}`;
        ctx.fillText(a.protegido ? '[ MATEO · PROTEGIDO ]' : '> MATEO · 11°B', w / 2, 48);
        ctx.fillStyle = COL.blancoVerde; ctx.font = `600 22px ${F_TXT}`;
        ctx.fillText(a.protegido ? 'ESCUDO COMUNITARIO ACTIVO' : `ÁNIMO: ${Math.round(Math.max(0, a.animo) * 100)}%`, w / 2, 82);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.18)'; ctx.fillRect(60, 108, w - 120, 20);
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10;
        ctx.fillRect(60, 108, (w - 120) * Math.max(0, a.animo), 20);
      });
    },

    actualizarAmigo(dt) {
      const a = this.amigo;
      if (!a) return;
      a.t += dt;
      a.golpe = Math.max(0, a.golpe - dt * 2);
      a.grupo.scale.y = Math.max(0.001, sueve(a.t / 1.2));
      const triste = 1 - a.animo;
      const color = new THREE.Color(COL.menta).lerp(new THREE.Color(COL.rojo), a.protegido ? 0 : triste);
      if (a.protegido) color.set(COL.protegido);
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
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = COL.blancoVerde;
        fuenteAjustada(ctx, `> ${texto}`, 700, F_TXT, 46, w - 50);
        ctx.fillText(`> ${texto}`, w / 2, h / 2);
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
      this.textoFlotante(a.grupo.position.clone().add(new V3(0, 1.4, 0)), '✖ LE DOLIÓ',
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
      this.explosion(pos, COL.menta, 20, false);
      const consejos = [
        'No lo difundas: el acoso vive del público.',
        'Bloquear corta el ataque.',
        'Tu amigo nota que no está solo/a.',
        'Ser testigo activo hace la diferencia.'
      ];
      this.textoFlotante(pos, `+${CONFIG.puntosAcoso} BLOQUEADO`, consejos[this.stats.acosoBloqueado % consejos.length], COL.menta);
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
        const brillo = crearGlow(COL.menta, 1.0, 0.3); brillo.position.z = -0.04;
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
      const color = d.estado === 'correcta' ? COL.menta : d.estado === 'incorrecta' ? COL.rojo : COL.menta;
      if (d.marcoMats && d.estado !== 'activa') {
        // el marco GLB toma el tinte verde / rojo según la respuesta
        d.marcoMats.forEach(m => { m.emissive.set(color); });
      }
      d.panel.dibujar((ctx, w, h) => {
        if (d.marcoMats) {
          // el marco ya lo da el modelo 3D: aquí solo va el fondo y el texto
          ctx.fillStyle = 'rgba(0, 10, 4, 0.94)'; rr(ctx, 2, 2, w - 4, h - 4, 14); ctx.fill();
        } else {
          marcoHUD(ctx, 6, 6, w - 12, h - 12, color, 'rgba(0, 10, 4, 0.92)');
        }
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = COL.blancoVerde;
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
        this.explosion(pos, COL.menta, 30, false);
        this.textoFlotante(pos, '✔ ¡ESO AYUDA!', d.accion.retro, COL.menta);
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
            this.absorber(destino, COL.protegido);
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
      this.hudTitulo = 'CIBERESCUDO · CÓDIGO VERDE'; this.hudObjetivo = 'dispara al botón para comenzar'; this.hudTiempo = null;
      this.puntos = 0; this.combo = 0;
      this.dibujarHUD();
      this.mostrarBanner('CIBERESCUDO · CÓDIGO VERDE', this.textoControles(), COL.fosforo, 0);
      this.mostrarPlacaInicio(true); // marca institucional bajo el banner (si el logo ya cargó)
      // el botón baja un poco (antes -0.62) para dejar sitio a la placa de marca sin taparla
      this.crearBoton('> INICIAR MISIÓN', this.puntoFrente(2.1, -0.82), COL.menta, () => this.comenzarPartida());

      // Saludo inicial de bienvenida hablado
      setTimeout(() => {
        if (this.fase === 'inicio') {
          const b = this.bufAudio('bienvenida');
          if (b) Sonido.voz(b); else Sonido.voz('audio/bienvenida.mp3');
        }
      }, 500);
    },

    // Textos de los controles según el modo (casco o pantalla)
    textoControles() {
      return this.modo === 'pantalla'
        ? 'ESCUCHA cada mensaje. AMENAZA: clic izquierdo para disparar. SEGURO: clic derecho (o tecla C) para atraparlo.'
        : 'ESCUCHA cada mensaje. AMENAZA: dispárale con el gatillo DERECHO. SEGURO: atrápalo con la mano IZQUIERDA (gatillo o agarre).';
    },
    hudControles() {
      return this.modo === 'pantalla'
        ? 'ESCUCHA · amenaza: clic izq. dispara · seguro: clic der. o C atrapa'
        : 'ESCUCHA · amenaza: dispara (derecha) · seguro: atrapa (izquierda)';
    },

    comenzarPartida() {
      this.limpiarTodo();
      this.agente = leerJSON(CLAVE_AGENTES, 0) + 1;
      guardarJSON(CLAVE_AGENTES, this.agente);
      this.puntos = 0; this.combo = 0;
      this.integridadMax = CONFIG.integridadInicial;
      this.integridad = CONFIG.integridadInicial;
      this.integridadFantasma = CONFIG.integridadInicial;
      this.tSacudida = 0; this.intSacudida = 0;
      this.stats = {
        amenazasNeutralizadas: 0, amenazasRecibidas: 0, amenazasAtrapadas: 0, amenazasTotal: 0,
        segurosAtrapados: 0, segurosDisparados: 0, segurosPerdidos: 0, segurosTotal: 0, errores: 0,
        acosoBloqueado: 0, acosoRecibido: 0, acosoTotal: 0,
        accionesCorrectas: 0, accionesErradas: 0
      };
      this.mazo = null; this.primerMazo = true; this.mazoAcoso = null;
      // audio de las dinámicas: duraciones y archivos se precargan ya
      this.cargarDuraciones();
      this.t0Carga = performance.now();
      this.cargarAudio('instr', 'audio/instrucciones.mp3');
      this.cargarAudio('din_acoso', 'audio/dinamica_acoso.mp3');
      this.cargarAudio('din_decision', 'audio/dinamica_decision.mp3');
      this.cargarAudio('cierre_solidario', 'audio/cierre_solidario.mp3');
      this.ultimoCasoId = null;
      this.rellenarCasos();
      this.visor.visible = true; this.visorListo = false;
      this.colocarEscenario();
      this.cambiarFase('cuenta');
      this.abrirPortales();
      Sonido.musica.iniciar('accion');
    },

    cambiarFase(fase) {
      this.fase = fase; this.tFase = 0; this.paso = 0;
      const titulos = {
        cuenta: ['NIVEL 1 · NODO ESCOLAR', this.hudControles()],
        fase1: ['NIVEL 1 · INTERCEPTA SEÑALES', this.hudControles()],
        transicion1: ['NIVEL 2 · ALERTA EN RED DE BOLÍVAR', 'detectando ataque coordinado…'],
        acoso: ['NIVEL 2 · PROTEGE A MATEO (11°B)', 'Destruye las burbujas de agresión con tu blaster'],
        decision: ['NIVEL 3 · ESCUDO SOLIDARIO', 'Dispara SOLO a las acciones que ayudan a Mateo'],
        cierre: ['¡MISIÓN CUMPLIDA!', 'Red Escolar de Bolívar asegurada'],
        final: ['BITÁCORA GUARDIA DIGITAL', 'Dispara a SIGUIENTE OPERADOR']
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
        // Suena instrucciones.mp3 (Nivel 1); el primer dron sale al terminar.
        if (this.paso === 0) {
          const e = this.audios.instr;
          if ((e && e.buf !== undefined) || performance.now() - this.t0Carga > 2500) {
            this.paso = 1;
            const b = e && e.buf;
            const conVoz = !!b && Sonido.listo();
            this.durCuenta = conVoz ? b.duration + 0.5 : ((this.duraciones && this.duraciones.instrucciones) || 14.5);
            this.tCuenta0 = t;
            if (conVoz) Sonido.voz(b);
            this.soltarAudio('instr');
            this.mostrarBanner('NIVEL 1 · INTERCEPTA SEÑALES', this.textoControles(), COL.fosforo, 0);
          }
        } else if (t - this.tCuenta0 >= this.durCuenta) {
          this.cambiarFase('fase1');
          // la cola de drones se reparte en un arco frente a donde mira el jugador ahora
          this.dronActivo = null; this.tLanzar = 0.3; this.retroRestante = 0; this.sinMasDrones = false;
          this.dirBase = this.frenteHorizontal(); this.nLanzados = 0; this.hudCola = -1;
          this.rellenarCasos();
          Sonido.cuenta(0);
          this.mostrarBanner('¡COMENZAR!', '', COL.menta, 1.4);
        }
      } else if (this.fase === 'fase1') {
        // Hasta maxDrones a la vez; un solo dron habla por turno (ver gestionarFase1). Termina cuando no queda ninguno vivo
        // (y ya no se lanzan más o se acabó el tiempo), con el firewall en 0, o -graciaFinal s después del tiempo como seguro.
        const restante = CONFIG.duracionFase1 - t;
        this.retroRestante = Math.max(0, this.retroRestante - dt);
        this.gestionarFase1(dt, restante);
        this.tiempoHUD(restante);
        const libre = !this.drones.some(d => !d.resuelto) && this.retroRestante <= 0;
        if (this.integridad <= 0 || (libre && (this.sinMasDrones || restante <= 0)) || restante < -CONFIG.graciaFinal) this.terminarFase1();
      } else if (this.fase === 'transicion1') {
        if (this.paso === 0 && t >= 2.0) {
          this.paso = 1;
          Sonido.alerta();
          Sonido.musica.modo = 'tension';
          const buf = this.bufAudio('din_acoso');
          if (buf) Sonido.voz(buf);
          else Sonido.voz('audio/dinamica_acoso.mp3');
          const durAcoso = (this.duraciones && this.duraciones.dinamica_acoso) || 13.0;
          this.durTransicion1 = durAcoso + 0.8;
          this.mostrarBanner('¡NIVEL 2: ALERTA DE CIBERACOSO!',
            'Tu compañero Mateo (11°B) sufre un ataque coordinado en redes sociales. ¡Apunta y destruye las burbujas de agresión con tu blaster antes de que lo alcancen!', COL.rojo, durAcoso + 0.5);
          this.crearAmigo();
        }
        if (this.paso === 1 && t >= 2.0 + (this.durTransicion1 || 13.5)) {
          this.cambiarFase('acoso');
          this.tSpawn = 0.5;
        }
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
          const bufDec = this.bufAudio('din_decision');
          if (bufDec) Sonido.voz(bufDec);
          else Sonido.voz('audio/dinamica_decision.mp3');
          const durDec = (this.duraciones && this.duraciones.dinamica_decision) || 12.0;
          this.mostrarBanner('¡NIVEL 3: ESCUDO SOLIDARIO!',
            'No seas un espectador pasivo. Dispara ÚNICAMENTE a las acciones que ayudan y protegen a Mateo para activar su escudo comunitario.', COL.menta, durDec);
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
          const bufCierre = this.bufAudio('cierre_solidario');
          if (bufCierre) Sonido.voz(bufCierre);
          else Sonido.voz('audio/cierre_solidario.mp3');
          const durCierre = (this.duraciones && this.duraciones.cierre_solidario) || 23.5;
          this.durCierreTotal = durCierre + 3.0; // ~26.5 segundos en pantalla
          this.mostrarBanner('¡MATEO PROTEGIDO! · EN BOLÍVAR NO ESTÁS SOLO',
            `«En Bolívar el ciberacoso no se vive a solas: guarda evidencia, bloquea al agresor y cuéntale de inmediato a un adulto de confianza. Comunícate gratis a la Línea 106 o al CAI Virtual 123. Secretaría de las TIC · Gobernación de Bolívar»`, COL.protegido, this.durCierreTotal);
        }
      } else if (this.fase === 'cierre') {
        if (t >= (this.durCierreTotal || 26.5)) this.mostrarResultados();
      }
    },

    tiempoHUD(restante) {
      const s = Math.max(0, Math.ceil(restante));
      if (s !== this.hudTiempo) { this.hudTiempo = s; this.marcarHUD(); }
    },

    terminarFase1() {
      const caido = this.integridad <= 0;
      this.drones.slice().forEach(d => { this.absorber(d.grupo.position.clone(), COL.menta); this.quitarDrone(d); });
      Sonido.detenerVoces();
      this.dronActivo = null; this.casosListos = []; this.audios = {}; this.retroRestante = 0;
      this.cerrarPortales();
      this.cambiarFase('transicion1');
      if (caido) {
        Sonido.dano();
        this.mostrarBanner('FIREWALL CAÍDO', 'Las amenazas entraron... pero aún puedes ayudar a alguien.', COL.rojo, 2.7);
      } else {
        Sonido.victoria();
        this.mostrarBanner('FASE 1 · COMPLETA', `Neutralizaste ${this.stats.amenazasNeutralizadas} amenazas y atrapaste ${this.stats.segurosAtrapados} mensajes seguros`, COL.menta, 2.7);
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

      // Panel de 1.6 × 1.28 m (800 px/m): las primeras 800 px son el informe de siempre; debajo, la franja de marca institucional.
      const p = new Panel(1.6, 1.28, 1280, 1024);
      const pintar = () => p.dibujar((ctx, w, hTotal) => {
        const h = 800; // alto de la zona del informe (el diseño original)
        marcoHUD(ctx, 8, 8, w - 16, hTotal - 16, COL.fosforo, 'rgba(0, 8, 3, 0.92)');
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center'; ctx.fillStyle = COL.fosforo; ctx.font = `900 40px ${F_TIT}`;
        ctx.shadowColor = COL.fosforo; ctx.shadowBlur = 20;
        fuenteAjustada(ctx, `> INFORME DE MISIÓN · OPERADOR #${this.agente}`, 900, F_TIT, 40, w - 120);
        ctx.fillText(`> INFORME DE MISIÓN · OPERADOR #${this.agente}`, w / 2, 70);
        ctx.shadowBlur = 0;

        // Columna izquierda: puntaje y estadísticas
        ctx.textAlign = 'left';
        ctx.fillStyle = COL.gris; ctx.font = `700 30px ${F_TXT}`; ctx.fillText('PUNTAJE', 60, 150);
        ctx.fillStyle = COL.menta; ctx.font = `900 96px ${F_TIT}`;
        ctx.shadowColor = COL.menta; ctx.shadowBlur = 24; ctx.fillText(String(this.puntos), 56, 230); ctx.shadowBlur = 0;
        ctx.fillStyle = COL.menta; fuenteAjustada(ctx, rango, 700, F_TIT, 34, 700);
        ctx.fillText(rango, 60, 310);
        const filas = [
          `> Amenazas neutralizadas: ${s.amenazasNeutralizadas} / ${s.amenazasTotal}`,
          `> Mensajes seguros atrapados: ${s.segurosAtrapados} / ${s.segurosTotal}`,
          `> Errores: ${s.errores}`,
          `> Ataques de acoso bloqueados: ${s.acosoBloqueado} / ${s.acosoBloqueado + s.acosoRecibido}`,
          `> Acciones de ayuda correctas: ${s.accionesCorrectas} / ${ACCIONES_ACOSO.filter(a => a.correcta).length}`
        ];
        ctx.fillStyle = COL.blancoVerde; ctx.font = `600 36px ${F_TXT}`;
        filas.forEach((f, i) => ctx.fillText(f, 60, 390 + i * 54));

        // Columna derecha: ranking
        const x0 = 800;
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x0 - 30, 130); ctx.lineTo(x0 - 30, 640); ctx.stroke();
        ctx.fillStyle = COL.fosforo; ctx.font = `900 34px ${F_TIT}`; ctx.fillText('TOP 5', x0, 150);
        ranking.slice(0, 5).forEach((r, i) => {
          const yo = r.agente === this.agente;
          ctx.fillStyle = yo ? COL.menta : COL.blancoVerde;
          ctx.font = `${yo ? 700 : 600} 38px ${F_TXT}`;
          ctx.fillText(`${i + 1}. Operador #${r.agente}`, x0, 220 + i * 62);
          ctx.textAlign = 'right'; ctx.fillText(String(r.puntos), w - 60, 220 + i * 62); ctx.textAlign = 'left';
        });
        if (puesto > 5) {
          ctx.fillStyle = COL.gris; ctx.font = `600 32px ${F_TXT}`;
          ctx.fillText(`Tu puesto: #${puesto}`, x0, 560);
        }

        ctx.textAlign = 'center'; ctx.fillStyle = COL.menta; ctx.font = `700 34px ${F_TXT}`;
        ctx.fillText(LINEAS_AYUDA, w / 2, h - 60);

        // Franja de marca institucional: recuadro oscuro opaco con el logo (380 × 152 px, margen ≥ 14 %) y sello de misión a su derecha.
        // Se dibuja al final, sin sombras, sin glitch ni texto encima; si el logo aún no cargó, se pinta cuando cargue.
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(0, 175, 239, 0.45)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(60, h + 2); ctx.lineTo(w - 60, h + 2); ctx.stroke();
        const caja = Marca.dibujar(ctx, 'logo', 82, h + 16, 380); // 380 × 152 px + margen opaco y bisel exterior
        if (caja) {
          const x = caja.x + caja.w + 38;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillStyle = '#ffcc29'; ctx.font = `700 22px ${F_TIT}`;
          ctx.fillText('◆ GUARDIA DIGITAL JUVENIL · DEPARTAMENTO DE BOLÍVAR', x, caja.y + 38);
          ctx.fillStyle = '#e6ffee'; ctx.font = `600 34px ${F_TXT}`;
          const ls = lineas(ctx, Marca.LEYENDA, w - 60 - x);
          ls.forEach((l, i) => ctx.fillText(l, x, caja.y + 92 + i * 40));
          ctx.fillStyle = '#00afef'; ctx.font = `700 22px ${F_MONO}`;
          ctx.fillText('> CERTIFICADO POR LA UNIDAD DE CIBERDEFENSA ESCOLAR', x, caja.y + caja.h - 22);
        }
      });
      pintar();
      if (!Marca.listo('logo')) Marca.cuando('logo', () => { if (this.resultados === p) pintar(); });
      // sube 1 cm el centro: borde superior a +0.80 m e inferior a -0.48 m, así la franja de marca queda por encima del botón
      p.mesh.position.copy(this.puntoFrente(2.4, 0.16));
      p.mesh.lookAt(this.camPos);
      this.raiz.add(p.mesh);
      this.resultados = p;
      this.crearBoton('> SIGUIENTE OPERADOR', this.puntoFrente(2.2, -0.62), COL.menta, () => this.comenzarPartida());
      this.explosion(p.mesh.position.clone().add(new V3(0, 0.25, 0)), COL.menta, 80, false); // lejos de la franja de marca
      Sonido.victoria();
    },

    limpiarTodo() {
      Sonido.detenerVoces();
      this.dronActivo = null; this.casosListos = []; this.audios = {}; this.sinMasDrones = false; this.retroRestante = 0;
      this.retirarBotones();
      this.drones.slice().forEach(d => this.quitarDrone(d));
      this.quitarMarca();
      this.burbujas.slice().forEach(b => this.quitarBurbuja(b));
      this.acciones.slice().forEach(a => this.retirar(a)); this.acciones = [];
      this.objetivos.slice().forEach(o => this.retirar(o));
      this.portales.forEach(p => { this.raiz.remove(p.grupo); liberar(p.grupo); }); this.portales = [];
      this.quitarGoteo(true);
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
      this.actualizarArmasPC(t, dt);
      if (!this.vinetaMontada && this.el.camera) { this.el.camera.add(this.vineta); this.vinetaMontada = true; }
      if (this.vinetaT > 0) {
        this.vinetaT = Math.max(0, this.vinetaT - dt * 1.5);
        this.vineta.material.opacity = this.vinetaT * 0.85;
      }
      // Actualizar barra fantasma de salud (efecto visual de daño que drena fluidamente)
      if (this.integridadFantasma > this.integridad) {
        this.integridadFantasma = Math.max(this.integridad, this.integridadFantasma - dt * 28);
        this.hudSucio = true;
      }
      // Actualizar sacudida física de cámara e impacto háptico
      if (this.tSacudida > 0) {
        this.tSacudida = Math.max(0, this.tSacudida - dt);
        const k = this.durSacudida > 0 ? this.tSacudida / this.durSacudida : 0;
        const amp = this.intSacudida * k;
        const rig = document.getElementById('rig');
        if (rig && rig.object3D) {
          rig.object3D.position.x = (Math.random() - 0.5) * amp;
          rig.object3D.position.z = (Math.random() - 0.5) * amp;
          rig.object3D.position.y = (Math.random() - 0.5) * amp * 0.5;
        }
      } else {
        const rig = document.getElementById('rig');
        if (rig && rig.object3D && (rig.object3D.position.x !== 0 || rig.object3D.position.z !== 0 || rig.object3D.position.y !== 0)) {
          rig.object3D.position.set(0, 0, 0);
        }
      }
      if (this.fase === 'menu') return;
      this.actualizarApuntado();
      this.actualizarFase(dt);
      this.actualizarDrones(dt);
      this.actualizarMano(dt);
      Sonido.actualizarEscucha(this.camPos, this.camDir);
      this.actualizarBurbujas(dt);
      this.actualizarAcciones(dt);
      this.actualizarAmigo(dt);
      this.actualizarPortales(dt);
      this.actualizarLluvia(dt);
      this.actualizarBotones(dt);
      this.actualizarEfectos(dt);
      this.actualizarVisor(dt);
      const fase = Math.floor(t / 600) % 2 === 0;
      if (fase !== this.hudCursor) { this.hudCursor = fase; this.hudSucio = true; }
      if (this.hudSucio && t - (this.ultimoHud || 0) > 120) { this.ultimoHud = t; this.dibujarHUD(); }
    }
  });
})();
