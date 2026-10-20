// CiberDetective · Motor de audio: contexto, buses, compresor, reverb por convolución y voces base.
// Todo sintetizado con Web Audio API, sin archivos externos.

export const M = {
  ctx: null,
  bus: {},          // { musica, ambiente, sfx } → { seco, rev, nivel }
  ruido: {},        // buffers de ruido en bucle: blanco, rosa, marron
  entrada: null,    // suma previa al compresor
  salida: null,     // ganancia de volumen general
  reverbIn: null,
  volumen: 0.8
};

// Niveles de bus: los SFX mandan, la música por debajo y el ambiente más bajo aún.
export const NIVELES = { musica: 0.3, ambiente: 0.26, sfx: 0.72 };

// ---------- Utilidades ----------
export const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
export const azar = (a, b) => a + Math.random() * (b - a);
export const elegir = arr => arr[Math.floor(Math.random() * arr.length)];
export const prob = p => Math.random() < p;
export const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
export const ahora = () => (M.ctx ? M.ctx.currentTime : 0);
const curva = v => { const x = limitar(Number(v) || 0, 0, 1); return x * x; };

export function elegirDistinto(arr, actual) {
  if (arr.length < 2) return arr[0];
  let x;
  do { x = elegir(arr); } while (x === actual);
  return x;
}

// Congela un parámetro en su valor actual antes de programar una nueva rampa (sin saltos).
export function sostener(param, t) {
  if (typeof param.cancelAndHoldAtTime === 'function') {
    param.cancelAndHoldAtTime(t);
  } else {
    const v = param.value;
    param.cancelScheduledValues(t);
    param.setValueAtTime(v, t);
  }
}

// ---------- Construcción del grafo maestro ----------
function compresor(ctx, umbral, rodilla, ratio, ataque, liberacion) {
  const c = ctx.createDynamicsCompressor();
  c.threshold.value = umbral; c.knee.value = rodilla; c.ratio.value = ratio;
  c.attack.value = ataque; c.release.value = liberacion;
  return c;
}

function filtro(ctx, tipo, f, q = 0.707, ganancia = 0) {
  const b = ctx.createBiquadFilter();
  b.type = tipo; b.frequency.value = f; b.Q.value = q; b.gain.value = ganancia;
  return b;
}

// Respuesta de impulso sintética: ruido estéreo con decaimiento exponencial,
// cola que se oscurece con el tiempo y algunas reflexiones tempranas.
function impulso(ctx, segundos, caida) {
  const sr = ctx.sampleRate;
  const len = Math.max(1, Math.floor(sr * segundos));
  const buf = ctx.createBuffer(2, len, sr);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const x = i / len;
      const coef = 0.92 - 0.8 * x;                 // filtro de un polo cada vez más oscuro
      lp += coef * ((Math.random() * 2 - 1) - lp);
      d[i] = lp * Math.exp(-caida * x * 2.3);
    }
    for (let k = 0; k < 14; k++) {                 // reflexiones tempranas distintas por canal
      const idx = Math.floor(sr * azar(0.004, 0.09));
      if (idx < len) d[idx] += azar(-0.7, 0.7) * (1 - k / 16);
    }
    const fade = Math.min(len, Math.floor(sr * 0.002));
    for (let i = 0; i < fade; i++) d[i] *= i / fade;
  }
  return buf;
}

// Buffers de ruido aptos para bucle infinito (sin deriva de continua en el punto de unión).
function bufferRuido(ctx, tipo, segundos) {
  const len = Math.floor(ctx.sampleRate * segundos);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (tipo === 'blanco') {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  if (tipo === 'rosa') {                            // Paul Kellet
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;    b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;    b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else {                                          // marrón
    let ult = 0;
    for (let i = 0; i < len; i++) {
      ult = (ult + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = ult * 3.5;
    }
  }
  const delta = d[len - 1] - d[0];                  // une extremos para un bucle sin clic
  for (let i = 0; i < len; i++) d[i] -= delta * (i / (len - 1));
  return buf;
}

function crearBus(nivel) {
  const ctx = M.ctx;
  const seco = ctx.createGain(); seco.gain.value = nivel; seco.connect(M.entrada);
  const rev = ctx.createGain(); rev.gain.value = nivel; rev.connect(M.reverbIn);
  return { seco, rev, nivel };
}

export function crearMotor() {
  if (M.ctx) return M.ctx;
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (typeof AC !== 'function') return null;
  let ctx = null;
  try { ctx = new AC({ latencyHint: 'interactive' }); } catch (e) {
    try { ctx = new AC(); } catch (e2) { return null; }
  }
  M.ctx = ctx;

  // Cadena maestra: suma → paso alto → estante suave → compresor → volumen → limitador
  const entrada = ctx.createGain(); entrada.gain.value = 0.85;
  const hp = filtro(ctx, 'highpass', 24, 0.6);
  const brillo = filtro(ctx, 'highshelf', 9000, 0.707, -1.5);
  const comp = compresor(ctx, -18, 12, 3.5, 0.008, 0.25);
  const vol = ctx.createGain(); vol.gain.value = curva(M.volumen);
  const lim = compresor(ctx, -2, 0, 20, 0.002, 0.1);
  entrada.connect(hp); hp.connect(brillo); brillo.connect(comp);
  comp.connect(vol); vol.connect(lim); lim.connect(ctx.destination);
  M.entrada = entrada; M.salida = vol;

  // Reverb por convolución con IR generada
  const revIn = ctx.createGain();
  const pre = ctx.createDelay(0.2); pre.delayTime.value = 0.022;
  const revHp = filtro(ctx, 'highpass', 220, 0.5);
  const conv = ctx.createConvolver();
  conv.normalize = true;
  conv.buffer = impulso(ctx, 3.4, 3.0);
  const revLp = filtro(ctx, 'lowpass', 6500, 0.5);
  const revOut = ctx.createGain(); revOut.gain.value = 0.5;
  revIn.connect(pre); pre.connect(revHp); revHp.connect(conv);
  conv.connect(revLp); revLp.connect(revOut); revOut.connect(entrada);
  M.reverbIn = revIn;

  for (const [k, v] of Object.entries(NIVELES)) M.bus[k] = crearBus(v);
  M.ruido.blanco = bufferRuido(ctx, 'blanco', 2);
  M.ruido.rosa = bufferRuido(ctx, 'rosa', 5);
  M.ruido.marron = bufferRuido(ctx, 'marron', 5);
  return ctx;
}

export function fijarVolumen(v) {
  M.volumen = limitar(Number(v) || 0, 0, 1);
  if (!M.ctx) return;
  const t = M.ctx.currentTime;
  sostener(M.salida.gain, t);
  M.salida.gain.setTargetAtTime(curva(M.volumen), t, 0.05);
}

// Baja la música un momento para que un SFX importante se oiga limpio.
export function agacharMusica(factor = 0.5, dur = 1.2) {
  if (!M.ctx) return;
  const b = M.bus.musica, t = M.ctx.currentTime;
  for (const g of [b.seco.gain, b.rev.gain]) {
    sostener(g, t);
    g.setTargetAtTime(b.nivel * factor, t, 0.05);
    g.setTargetAtTime(b.nivel, t + dur, 0.45);
  }
}

// Subgrupo (por modo musical o capa de ambiente) con fundido que afecta seco y reverb.
export function crearGrupo(bus, nivel = 1) {
  const ctx = M.ctx, b = M.bus[bus];
  const seco = ctx.createGain(), rev = ctx.createGain();
  seco.gain.value = nivel; rev.gain.value = nivel;
  seco.connect(b.seco); rev.connect(b.rev);
  return {
    seco, rev,
    fundido(valor, dur, t = ctx.currentTime) {
      for (const g of [seco.gain, rev.gain]) {
        sostener(g, t);
        g.linearRampToValueAtTime(valor, t + Math.max(0.01, dur));
      }
    },
    desconectar() { try { seco.disconnect(); rev.disconnect(); } catch (e) { /* ya desconectado */ } }
  };
}

// ---------- Voces ----------
export function crearPan(v = 0) {
  const ctx = M.ctx;
  if (typeof ctx.createStereoPanner === 'function') {
    const p = ctx.createStereoPanner();
    p.pan.value = limitar(v, -1, 1);
    return p;
  }
  return ctx.createGain();
}

// Salida de una voz: ganancia → paneo → destino seco (+ envío a reverb).
export function salida(dest, pan = 0, envio = 0) {
  const ctx = M.ctx;
  const g = ctx.createGain();
  const p = crearPan(pan);
  g.connect(p); p.connect(dest.seco);
  let s = null;
  if (envio > 0 && dest.rev) {
    s = ctx.createGain(); s.gain.value = envio;
    p.connect(s); s.connect(dest.rev);
  }
  return {
    entrada: g, pan: p,
    limpiar() { try { g.disconnect(); p.disconnect(); if (s) s.disconnect(); } catch (e) { /* nada */ } }
  };
}

// Envolvente ADSR. Devuelve el instante en que la voz ya es inaudible.
export function adsr(param, t, dur, a, d, s, r, pico) {
  param.setValueAtTime(0, t);
  param.linearRampToValueAtTime(pico, t + a);
  const tr = t + Math.max(a, dur);
  if (s < 0.999 && tr > t + a + 0.001) param.setTargetAtTime(pico * s, t + a, Math.max(0.001, d / 3));
  param.setTargetAtTime(0, tr, Math.max(0.002, r / 5));
  return tr + r * 1.2 + 0.02;
}

function tiempo(t) {
  const n = M.ctx.currentTime;
  return (typeof t === 'number' && isFinite(t) && t > n) ? t : n;
}

function aplicarFiltro(ctx, fo, t, a, durTotal) {
  const fl = ctx.createBiquadFilter();
  fl.type = fo.tipo || 'lowpass';
  fl.Q.value = fo.q ?? 0.707;
  if (fo.g) fl.gain.value = fo.g;                 // para 'peaking' y estantes
  const base = fo.f;
  fl.frequency.setValueAtTime(base, t);
  if (fo.env) {
    const fa = fo.a ?? Math.max(a, 0.003);
    fl.frequency.linearRampToValueAtTime(Math.min(18000, base + fo.env), t + fa);
    fl.frequency.setTargetAtTime(base + (fo.sost ?? 0) * fo.env, t + fa, Math.max(0.005, (fo.d ?? 0.25) / 3));
  } else if (fo.fFin) {
    fl.frequency.exponentialRampToValueAtTime(Math.max(20, fo.fFin), t + (fo.t ?? durTotal));
  }
  return fl;
}

/**
 * Voz de oscilador con unísono desafinado (abierto en estéreo), filtro con envolvente,
 * vibrato, trémolo y glissando opcionales.
 */
export function nota(dest, o) {
  const ctx = M.ctx;
  const t = tiempo(o.t);
  const f = o.f, dur = o.dur ?? 0.2;
  const a = o.a ?? 0.005, d = o.d ?? 0.1, s = o.s ?? 0.7, r = o.r ?? 0.15, pico = o.pico ?? 0.2;
  const uni = Math.max(1, o.unisono ?? 1), det = o.detune ?? 0, ancho = o.ancho ?? 0.5;
  const sal = salida(dest, o.pan ?? 0, o.envio ?? 0.15);
  const vca = ctx.createGain(); vca.gain.value = 0;
  let cola = vca;
  if (o.tremolo) {
    const tg = ctx.createGain(); tg.gain.value = 1 - o.tremolo.prof / 2;
    const tl = ctx.createOscillator(); tl.frequency.value = o.tremolo.vel ?? 5;
    const tlg = ctx.createGain(); tlg.gain.value = o.tremolo.prof / 2;
    tl.connect(tlg); tlg.connect(tg.gain);
    vca.connect(tg); cola = tg;
    tl.start(t); tl.stop(t + Math.max(a, dur) + r * 1.2 + 0.05);
  }
  if (o.filtro) {
    const fl = aplicarFiltro(ctx, o.filtro, t, a, Math.max(a, dur) + r);
    cola.connect(fl); fl.connect(sal.entrada);
  } else {
    cola.connect(sal.entrada);
  }
  const fin = adsr(vca.gain, t, dur, a, d, s, r, pico);
  if (o.panFin !== undefined && sal.pan.pan) {
    sal.pan.pan.setValueAtTime(limitar(o.pan ?? 0, -1, 1), t);
    sal.pan.pan.linearRampToValueAtTime(limitar(o.panFin, -1, 1), t + (o.tPan ?? (fin - t)));
  }

  let vib = null;
  if (o.vibrato) {
    const lfo = ctx.createOscillator(); lfo.frequency.value = o.vibrato.vel ?? 5.5;
    vib = ctx.createGain();
    vib.gain.setValueAtTime(0, t);
    vib.gain.linearRampToValueAtTime(o.vibrato.cents ?? 10, t + (o.vibrato.retardo ?? 0.2) + 0.01);
    lfo.connect(vib); lfo.start(t); lfo.stop(fin);
  }

  let primera = null;
  for (let i = 0; i < uni; i++) {
    const osc = ctx.createOscillator();
    osc.type = o.tipo || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.glide) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.glide.f), t + Math.max(0.005, o.glide.t));
    const k = uni > 1 ? (i / (uni - 1)) * 2 - 1 : 0;
    osc.detune.value = k * det + azar(-2, 2);        // leve desafinado "humano"
    if (vib) vib.connect(osc.detune);
    const g = ctx.createGain(); g.gain.value = 1 / Math.sqrt(uni);
    osc.connect(g);
    if (uni > 1) { const p = crearPan(k * ancho); g.connect(p); p.connect(vca); } else g.connect(vca);
    osc.start(t); osc.stop(fin);
    if (!primera) primera = osc;
  }
  primera.onended = () => sal.limpiar();
  return fin;
}

/** Voz FM de dos operadores (campanas, marimba, piano eléctrico, steelpan). */
export function fm(dest, o) {
  const ctx = M.ctx;
  const t = tiempo(o.t);
  const f = o.f, dur = o.dur ?? 0;
  const a = o.a ?? 0.002, d = o.d ?? 0.2, s = o.s ?? 0, r = o.r ?? 0.6, pico = o.pico ?? 0.15;
  const ratio = o.ratio ?? 1, ind = o.indice ?? 2, indFin = o.indiceFin ?? 0;
  const sal = salida(dest, o.pan ?? 0, o.envio ?? 0.25);
  const vca = ctx.createGain(); vca.gain.value = 0;
  if (o.filtro) {
    const fl = aplicarFiltro(ctx, o.filtro, t, a, Math.max(a, dur) + r);
    vca.connect(fl); fl.connect(sal.entrada);
  } else vca.connect(sal.entrada);
  const fin = adsr(vca.gain, t, dur, a, d, s, r, pico);

  const car = ctx.createOscillator(); car.type = 'sine';
  car.frequency.setValueAtTime(f, t);
  car.detune.value = o.detune ?? azar(-3, 3);
  const mod = ctx.createOscillator(); mod.type = 'sine';
  mod.frequency.setValueAtTime(f * ratio, t);
  const mg = ctx.createGain();
  mg.gain.setValueAtTime(ind * f * ratio, t);
  mg.gain.setTargetAtTime(indFin * f * ratio, t, Math.max(0.003, (o.decIndice ?? 0.3) / 3));
  mod.connect(mg); mg.connect(car.frequency);
  car.connect(vca);
  car.start(t); mod.start(t); car.stop(fin); mod.stop(fin);
  car.onended = () => sal.limpiar();
  return fin;
}

/** Ráfaga de ruido filtrado con envolvente, barridos de filtro y de paneo. */
export function ruido(dest, o) {
  const ctx = M.ctx;
  const t = tiempo(o.t);
  const a = o.a ?? 0.002, d = o.d ?? 0.05, s = o.s ?? 1, r = o.r ?? 0.1, pico = o.pico ?? 0.1;
  const dur = o.dur ?? a;
  const total = Math.max(a, dur) + r;
  const sal = salida(dest, o.pan ?? 0, o.envio ?? 0.1);
  const src = ctx.createBufferSource();
  src.buffer = M.ruido[o.tipo || 'blanco'];
  src.loop = true;
  if (o.vel) src.playbackRate.value = o.vel;
  const vca = ctx.createGain(); vca.gain.value = 0;
  let nodo = src;
  const filtros = o.filtros || (o.filtro ? [o.filtro] : []);
  for (const fo of filtros) {
    const fl = aplicarFiltro(ctx, { tipo: 'bandpass', q: 0.8, ...fo }, t, a, total);
    nodo.connect(fl); nodo = fl;
  }
  nodo.connect(vca); vca.connect(sal.entrada);
  if (o.panFin !== undefined && sal.pan.pan) {
    sal.pan.pan.setValueAtTime(limitar(o.pan ?? 0, -1, 1), t);
    sal.pan.pan.linearRampToValueAtTime(limitar(o.panFin, -1, 1), t + (o.tPan ?? total));
  }
  const fin = adsr(vca.gain, t, dur, a, d, s, r, pico);
  src.start(t, Math.random() * Math.max(0, src.buffer.duration - 0.05));
  src.stop(fin);
  src.onended = () => sal.limpiar();
  return fin;
}
