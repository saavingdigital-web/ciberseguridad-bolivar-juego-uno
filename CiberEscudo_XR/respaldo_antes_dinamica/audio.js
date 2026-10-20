/* CiberEscudo XR - Sonido sintetizado (Web Audio, sin archivos: funciona sin conexión) */
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
    clic() { tono({ tipo: 'sine', f0: 1000, dur: 0.06, vol: 0.1 }); }
  };

  // ===== Música (secuenciador sencillo, estilo synthwave) =====
  const NOTA = n => 440 * Math.pow(2, (n - 69) / 12);
  const PROGRESIONES = {
    accion: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],   // Am F C G
    tension: [[50, 53, 57], [46, 50, 53], [53, 57, 60], [52, 56, 59]],  // Dm Bb F E
    calma: [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]]     // C G Am F
  };
  const musica = {
    activa: false, modo: 'accion', paso: 0, proximo: 0, timer: null, bpm: 118,
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
      // Bombo
      if (tension ? enCompas % 8 === 0 : enCompas % 4 === 0) {
        tono({ tipo: 'sine', f0: 150, f1: 45, dur: 0.25, vol: 0.55, cuando, destino: musicaGain });
      }
      // Platillo
      if (enCompas % 4 === 2) golpeRuido({ dur: 0.05, vol: 0.12, f: 7000, tipo: 'highpass', cuando, destino: musicaGain });
      // Bajo (corcheas)
      if (enCompas % 2 === 0) {
        const raiz = acorde[0] - 24 + (enCompas % 8 === 6 ? 12 : 0);
        tono({ tipo: 'sawtooth', f0: NOTA(raiz), dur: d * 1.8, vol: 0.2, cuando, destino: musicaGain, filtro: { tipo: 'lowpass', f: 500, q: 4 } });
      }
      // Arpegio
      if (this.modo !== 'calma' || enCompas % 2 === 0) {
        const nota = acorde[enCompas % 3] + 12 + (enCompas % 6 === 5 ? 12 : 0);
        tono({ tipo: 'square', f0: NOTA(nota), dur: d * 0.9, vol: 0.05, cuando, destino: musicaGain, filtro: { tipo: 'lowpass', f: 2400 } });
      }
      // Pad al inicio de cada compás
      if (enCompas === 0) {
        acorde.forEach(n => tono({ tipo: 'triangle', f0: NOTA(n), dur: d * 15, vol: 0.05, ataque: 0.3, cuando, destino: musicaGain }));
      }
    }
  };

  return Object.assign({ iniciar, musica }, efectos);
})();
