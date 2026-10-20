/* CiberEscudo · Código Verde - Sonido sintetizado (Web Audio, sin archivos: funciona sin conexión) */
const Sonido = (() => {
  let ctx = null, master = null, sfx = null, musicaGain = null, ruido = null;

  function iniciar() {
    try {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
        sfx = ctx.createGain(); sfx.gain.value = 0.55; sfx.connect(master);
        musicaGain = ctx.createGain(); musicaGain.gain.value = 0.0; musicaGain.connect(master);
        // Buffer de ruido blanco (explosiones, platillos)
        ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = ruido.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }

  function tono({ tipo = 'sine', f0 = 440, f1 = null, dur = 0.2, vol = 0.3, ataque = 0.005, destino = sfx, cuando = 0, filtro = null }) {
    if (!ctx) return;
    const t = ctx.currentTime + cuando;
    const o = ctx.createOscillator(); o.type = tipo;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let ultimo = o;
    if (filtro) {
      const f = ctx.createBiquadFilter(); f.type = filtro.tipo; f.frequency.value = filtro.f; f.Q.value = filtro.q || 1;
      o.connect(f); ultimo = f;
    }
    ultimo.connect(g); g.connect(destino);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function golpeRuido({ dur = 0.3, vol = 0.4, f = 1200, tipo = 'lowpass', cuando = 0, destino = sfx, barrido = null }) {
    if (!ctx) return;
    const t = ctx.currentTime + cuando;
    const s = ctx.createBufferSource(); s.buffer = ruido;
    const fl = ctx.createBiquadFilter(); fl.type = tipo; fl.frequency.setValueAtTime(f, t);
    if (barrido) fl.frequency.exponentialRampToValueAtTime(barrido, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(destino);
    s.start(t); s.stop(t + dur + 0.05);
  }

  // ===== Efectos =====
  const efectos = {
    disparo() {
      tono({ tipo: 'sawtooth', f0: 1800, f1: 180, dur: 0.16, vol: 0.22, filtro: { tipo: 'lowpass', f: 3000 } });
      tono({ tipo: 'square', f0: 900, f1: 120, dur: 0.1, vol: 0.08 });
    },
    explosion() {
      golpeRuido({ dur: 0.6, vol: 0.5, f: 2500, barrido: 120 });
      tono({ tipo: 'sine', f0: 140, f1: 40, dur: 0.45, vol: 0.5 });
    },
    acierto() {
      [880, 1175, 1568].forEach((f, i) => tono({ tipo: 'triangle', f0: f, dur: 0.18, vol: 0.18, cuando: i * 0.06 }));
    },
    error() {
      tono({ tipo: 'sawtooth', f0: 220, f1: 70, dur: 0.5, vol: 0.25, filtro: { tipo: 'lowpass', f: 900 } });
      tono({ tipo: 'square', f0: 110, dur: 0.35, vol: 0.12, cuando: 0.05 });
    },
    dano() {
      golpeRuido({ dur: 0.5, vol: 0.45, f: 600, barrido: 80 });
      tono({ tipo: 'sawtooth', f0: 160, f1: 50, dur: 0.6, vol: 0.3 });
      [0, 0.18].forEach(c => tono({ tipo: 'square', f0: 620, dur: 0.12, vol: 0.12, cuando: c }));
    },
    escaneo() {
      tono({ tipo: 'square', f0: 600, f1: 1400, dur: 0.12, vol: 0.12 });
      tono({ tipo: 'sine', f0: 1400, dur: 0.15, vol: 0.12, cuando: 0.1 });
    },
    portal() {
      golpeRuido({ dur: 1.2, vol: 0.25, f: 200, tipo: 'bandpass', barrido: 3000 });
      tono({ tipo: 'sine', f0: 60, f1: 220, dur: 1.0, vol: 0.25 });
    },
    aparicion() {
      tono({ tipo: 'sine', f0: 300, f1: 900, dur: 0.35, vol: 0.08 });
    },
    alerta() {
      [0, 0.35, 0.7].forEach(c => {
        tono({ tipo: 'sawtooth', f0: 520, f1: 780, dur: 0.3, vol: 0.14, cuando: c, filtro: { tipo: 'lowpass', f: 2000 } });
      });
    },
    escudo() {
      [523, 659, 784, 1047].forEach((f, i) => tono({ tipo: 'sine', f0: f, dur: 0.6, vol: 0.14, cuando: i * 0.07 }));
    },
    cuenta(n) {
      tono({ tipo: 'square', f0: n > 0 ? 660 : 1320, dur: n > 0 ? 0.15 : 0.4, vol: 0.15 });
    },
    victoria() {
      const notas = [523, 659, 784, 1047, 784, 1047, 1319];
      notas.forEach((f, i) => tono({ tipo: 'triangle', f0: f, dur: 0.3, vol: 0.16, cuando: i * 0.11 }));
    },
    clic() { tono({ tipo: 'sine', f0: 1000, dur: 0.06, vol: 0.1 }); },
    // «tecleo» corto con un chispazo de glitch: se oye al aparecer un banner (suave, para no tapar la voz)
    tecleo() {
      const n = 6 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const c = i * 0.045 + Math.random() * 0.012;
        golpeRuido({ dur: 0.025, vol: 0.16, f: 2600 + Math.random() * 2600, tipo: 'bandpass', cuando: c });
        tono({ tipo: 'square', f0: 1500 + Math.random() * 900, dur: 0.02, vol: 0.025, cuando: c });
      }
      golpeRuido({ dur: 0.12, vol: 0.1, f: 5200, tipo: 'highpass', barrido: 900, cuando: 0.02 });
      tono({ tipo: 'sawtooth', f0: 90 + Math.random() * 60, f1: 30, dur: 0.14, vol: 0.07, cuando: 0.05, filtro: { tipo: 'lowpass', f: 500 } });
    },
    captura() {
      tono({ tipo: 'sine', f0: 300, f1: 1200, dur: 0.22, vol: 0.2 });
      tono({ tipo: 'triangle', f0: 1568, dur: 0.2, vol: 0.14, cuando: 0.14 });
    }
  };

  // ===== Voces (archivos MP3 con la voz del juego) =====
  // Los buffers los guarda quien los pide (así se pueden soltar); aquí solo se decodifican y se reproducen.
  const voces = [];            // voces sonando: { src, panner, posicion, fin }
  let nVoces = 0;

  function cargar(url) {
    if (!ctx) return Promise.resolve(null);
    return fetch(url)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((ok, mal) => {
        const p = ctx.decodeAudioData(ab, ok, mal);
        if (p && p.catch) p.catch(mal);
      }))
      .catch(() => null);
  }

  function listo() { return !!ctx && ctx.state === 'running'; }

  // Baja la música mientras habla una voz
  function ducking() {
    if (!ctx || !musicaGain || !musica.activa) return;
    musicaGain.gain.setTargetAtTime(nVoces > 0 ? 0.1 : 0.32, ctx.currentTime, 0.25);
  }

  // Reproduce un AudioBuffer (o una URL). posicionFn() -> THREE.Vector3 mundial: voz espacial desde ese punto.
  // Devuelve una promesa que se resuelve (true/false = terminó / no pudo sonar); p.detener() la corta.
  function voz(fuente, posicionFn) {
    let fin = null, v = null, cortada = false;
    const p = new Promise(res => { fin = res; });
    const terminar = ok => {
      if (!v) { fin(ok); return; }
      const i = voces.indexOf(v);
      if (i >= 0) { voces.splice(i, 1); nVoces = Math.max(0, nVoces - 1); ducking(); }
      try { v.src.disconnect(); if (v.panner) v.panner.disconnect(); v.ganancia.disconnect(); } catch (e) { /* ya suelto */ }
      v = null; fin(ok);
    };
    const sonar = buf => {
      if (cortada || !ctx || !buf) { fin(false); return; }
      try {
        const src = ctx.createBufferSource(); src.buffer = buf;
        const ganancia = ctx.createGain(); ganancia.gain.value = 1.0;
        let panner = null;
        if (posicionFn && ctx.createPanner) {
          panner = ctx.createPanner();
          panner.panningModel = 'HRTF'; panner.distanceModel = 'inverse';
          panner.refDistance = 1; panner.maxDistance = 30; panner.rolloffFactor = 0.4;
          src.connect(panner); panner.connect(ganancia);
        } else src.connect(ganancia);
        ganancia.connect(master);
        v = { src, panner, ganancia, posicion: posicionFn || null };
        voces.push(v); nVoces++; ducking();
        posicionarVoz(v);
        src.onended = () => terminar(true);
        src.start();
      } catch (e) { v = null; fin(false); }
    };
    if (typeof fuente === 'string') cargar(fuente).then(sonar); else sonar(fuente);
    p.detener = () => {
      cortada = true;
      if (v) { try { v.src.onended = null; v.src.stop(); } catch (e) { /* ya parada */ } terminar(false); }
    };
    return p;
  }

  function posicionarVoz(v) {
    if (!v.panner || !v.posicion) return;
    const q = v.posicion();
    if (!q) return;
    if (v.panner.positionX) {
      v.panner.positionX.value = q.x; v.panner.positionY.value = q.y; v.panner.positionZ.value = q.z;
    } else if (v.panner.setPosition) v.panner.setPosition(q.x, q.y, q.z);
  }

  // El oyente es la cámara. Llamar cada fotograma.
  function actualizarEscucha(pos, dir) {
    if (!ctx || !voces.length) return;
    const l = ctx.listener;
    try {
      if (l.positionX) {
        l.positionX.value = pos.x; l.positionY.value = pos.y; l.positionZ.value = pos.z;
        l.forwardX.value = dir.x; l.forwardY.value = dir.y; l.forwardZ.value = dir.z;
        l.upX.value = 0; l.upY.value = 1; l.upZ.value = 0;
      } else {
        l.setPosition(pos.x, pos.y, pos.z); l.setOrientation(dir.x, dir.y, dir.z, 0, 1, 0);
      }
    } catch (e) { /* sin oyente espacial */ }
    voces.forEach(posicionarVoz);
  }

  function detenerVoces() {
    voces.slice().forEach(v => { try { v.src.onended = null; v.src.stop(); } catch (e) { /* ya parada */ } });
    voces.slice().forEach(v => {
      try { v.src.disconnect(); if (v.panner) v.panner.disconnect(); v.ganancia.disconnect(); } catch (e) { /* suelto */ }
    });
    voces.length = 0; nVoces = 0; ducking();
  }

  // ===== Música (secuenciador sencillo, oscuro: modo menor, graves, pulsos de sub-bajo y arpegio escaso) =====
  const NOTA = n => 440 * Math.pow(2, (n - 69) / 12);
  const PROGRESIONES = {
    accion: [[45, 48, 52], [46, 50, 53], [45, 48, 52], [43, 46, 50]],   // Am Bb Am Gm (frigio, sombrío)
    tension: [[38, 41, 45], [37, 41, 44], [34, 38, 41], [33, 37, 40]],  // Dm C#dim Bb A (más grave y tenso)
    calma: [[45, 48, 52], [41, 45, 48], [43, 47, 50], [40, 44, 47]]     // Am F G E (se aclara un poco al ganar)
  };
  const musica = {
    activa: false, modo: 'accion', paso: 0, proximo: 0, timer: null, bpm: 100,
    iniciar(modo = 'accion') {
      if (!ctx) return;
      this.modo = modo;
      if (this.activa) return;
      this.activa = true; this.paso = 0; this.proximo = ctx.currentTime + 0.1;
      musicaGain.gain.cancelScheduledValues(ctx.currentTime);
      musicaGain.gain.setTargetAtTime(0.32, ctx.currentTime, 0.5);
      this.timer = setInterval(() => this.programar(), 25);
    },
    detener() {
      if (!ctx || !this.activa) return;
      this.activa = false;
      musicaGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
      clearInterval(this.timer);
    },
    programar() {
      const dur16 = 60 / this.bpm / 4;
      while (this.proximo < ctx.currentTime + 0.12) {
        this.tocarPaso(this.paso, this.proximo, dur16);
        this.proximo += dur16;
        this.paso = (this.paso + 1) % 64;
      }
    },
    tocarPaso(paso, t, d) {
      const prog = PROGRESIONES[this.modo];
      const acorde = prog[Math.floor(paso / 16) % 4];
      const enCompas = paso % 16;
      const cuando = t - ctx.currentTime;
      const tension = this.modo === 'tension';
      const calma = this.modo === 'calma';
      // Bombo seco y grave
      if (tension ? enCompas % 8 === 0 : enCompas % 4 === 0) {
        tono({ tipo: 'sine', f0: 120, f1: 38, dur: 0.28, vol: 0.5, cuando, destino: musicaGain });
      }
      // Pulso de sub-bajo (una nota larga y casi inaudible en altavoces pequeños; se siente en el casco)
      if (enCompas === 0 || enCompas === 10) {
        tono({ tipo: 'sine', f0: NOTA(acorde[0] - 12), dur: d * (enCompas === 0 ? 9 : 5), vol: 0.34, ataque: 0.03, cuando, destino: musicaGain });
      }
      // Hi-hat escaso (clic de ruido) y un golpe de «datos» ocasional
      if (enCompas % 8 === 4) golpeRuido({ dur: 0.04, vol: 0.09, f: 7500, tipo: 'highpass', cuando, destino: musicaGain });
      if (enCompas === 13 && !calma) golpeRuido({ dur: 0.03, vol: 0.07, f: 3800, tipo: 'bandpass', cuando, destino: musicaGain });
      // Bajo: pocas notas, filtro cerrado (oscuro)
      if (enCompas === 0 || enCompas === 6 || enCompas === 11) {
        const raiz = acorde[0] - (enCompas === 6 ? 0 : 12);
        tono({ tipo: 'sawtooth', f0: NOTA(raiz), dur: d * 2.4, vol: 0.17, cuando, destino: musicaGain, filtro: { tipo: 'lowpass', f: 360, q: 5 } });
      }
      // Arpegio escaso: solo en 3 pasos del compás, apagado y agudo-medio
      if (enCompas === 3 || enCompas === 7 || (enCompas === 14 && !calma)) {
        const nota = acorde[(enCompas >> 1) % 3] + 24;
        tono({ tipo: 'triangle', f0: NOTA(nota), dur: d * 1.4, vol: 0.05, cuando, destino: musicaGain, filtro: { tipo: 'lowpass', f: 1500 } });
      }
      // Pad oscuro al inicio de cada compás
      if (enCompas === 0) {
        acorde.forEach(n => tono({ tipo: 'sine', f0: NOTA(n + 12), dur: d * 15, vol: 0.05, ataque: 0.5, cuando, destino: musicaGain }));
      }
    }
  };

  return Object.assign({ iniciar, musica, cargar, listo, voz, actualizarEscucha, detenerVoces }, efectos);
})();
