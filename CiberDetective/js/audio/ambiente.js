// CiberDetective · Ambiente de ciudad costera caribeña en bucle infinito:
// olas, viento, tráfico lejano, gaviotas, murmullo urbano y algún barco a lo lejos.
import { M, azar, elegir, prob, crearGrupo, crearPan, nota, ruido } from './motor.js';

const ENTRADA = 3.5;   // fundido de entrada (s)
const SALIDA = 2.5;    // fundido de salida (s)

let amb = null;        // instancia activa

// Fuente de ruido continua en bucle, con offset aleatorio para que las capas no se correlacionen.
function fuente(tipo) {
  const s = M.ctx.createBufferSource();
  s.buffer = M.ruido[tipo];
  s.loop = true;
  return s;
}

function lfo(frec, prof, destino, tipo = 'sine') {
  const o = M.ctx.createOscillator();
  o.type = tipo;
  o.frequency.value = frec;
  const g = M.ctx.createGain();
  g.gain.value = prof;
  o.connect(g); g.connect(destino);
  return o;
}

function biquad(tipo, f, q = 0.707) {
  const b = M.ctx.createBiquadFilter();
  b.type = tipo; b.frequency.value = f; b.Q.value = q;
  return b;
}

function ganancia(v) { const g = M.ctx.createGain(); g.gain.value = v; return g; }

// Construye las capas continuas. Devuelve la lista de fuentes para detenerlas luego.
function capasContinuas(G) {
  const ctx = M.ctx;
  const fuentes = [];
  const arrancar = (n, tipo) => { n.start(ctx.currentTime, tipo ? Math.random() * (M.ruido[tipo].duration - 0.1) : 0); fuentes.push(n); };
  const aDestino = (nodo, pan, envio) => {
    const p = crearPan(pan); nodo.connect(p); p.connect(G.seco);
    if (envio) { const s = ganancia(envio); p.connect(s); s.connect(G.rev); }
    return p;
  };

  // 1) Mar de fondo: dos capas rosas filtradas, abiertas en estéreo, que respiran a ritmos distintos.
  for (const [pan, vel, ph] of [[-0.65, 0.061, 0], [0.65, 0.047, 1]]) {
    const n = fuente('rosa');
    const lp = biquad('lowpass', 480, 0.4);
    const g = ganancia(0.32);
    n.connect(lp); lp.connect(g);
    aDestino(g, pan, 0.25);
    const l1 = lfo(vel, 0.13, g.gain);
    const l2 = lfo(vel * 1.7, 160, lp.frequency);
    arrancar(n, 'rosa'); l1.start(ctx.currentTime + ph * 3); l2.start(); fuentes.push(l1, l2);
  }

  // 2) Viento suave: banda que se desplaza lentamente y paneo errante.
  {
    const n = fuente('rosa');
    const bp = biquad('bandpass', 520, 0.7);
    const g = ganancia(0.09);
    n.connect(bp); bp.connect(g);
    const p = aDestino(g, 0, 0.3);
    const l1 = lfo(0.043, 260, bp.frequency);
    const l2 = lfo(0.027, 0.05, g.gain);
    const l3 = lfo(0.071, 0.025, g.gain);
    arrancar(n, 'rosa'); for (const l of [l1, l2, l3]) { l.start(); fuentes.push(l); }
    if (p.pan) { const l4 = lfo(0.019, 0.55, p.pan); l4.start(); fuentes.push(l4); }
  }

  // 3) Tráfico lejano: zumbido grave filtrado con ondulación lenta.
  {
    const n = fuente('marron');
    const lp = biquad('lowpass', 150, 0.5);
    const g = ganancia(0.42);
    n.connect(lp); lp.connect(g);
    aDestino(g, 0.15, 0.1);
    const l1 = lfo(0.033, 0.12, g.gain);
    const l2 = lfo(0.051, 25, lp.frequency);
    arrancar(n, 'marron'); for (const l of [l1, l2]) { l.start(); fuentes.push(l); }
  }

  // 4) Murmullo urbano: dos formantes de voz con fluctuación silábica irregular.
  for (const [f, q, pan, v] of [[520, 2.2, -0.35, 0.05], [1450, 3, 0.35, 0.03]]) {
    const n = fuente('rosa');
    const bp = biquad('bandpass', f, q);
    const lp = biquad('lowpass', 2200, 0.5);
    const g = ganancia(v);
    n.connect(bp); bp.connect(lp); lp.connect(g);
    aDestino(g, pan, 0.4);
    const l1 = lfo(azar(3.1, 3.9), v * 0.35, g.gain);
    const l2 = lfo(azar(5.0, 5.8), v * 0.25, g.gain);
    const l3 = lfo(azar(0.05, 0.09), v * 0.4, g.gain);
    const l4 = lfo(azar(0.6, 0.9), f * 0.12, bp.frequency);
    arrancar(n, 'rosa'); for (const l of [l1, l2, l3, l4]) { l.start(); fuentes.push(l); }
  }
  return fuentes;
}

// ---------- Eventos ocasionales ----------
function ola(G, t) {
  const dur = azar(5.5, 8.5);
  const pan = azar(-0.55, 0.55);
  const cresta = azar(0.35, 0.5) * dur;
  // Cuerpo de la ola
  ruido(G, {
    t, tipo: 'rosa', a: cresta, dur: cresta, r: dur - cresta, pico: azar(0.2, 0.32), pan, panFin: pan * -0.4,
    envio: 0.35, filtro: { tipo: 'lowpass', f: 260, fFin: azar(1300, 2300), t: cresta, q: 0.5 }
  });
  // Espuma al romper
  ruido(G, {
    t: t + cresta * 0.85, a: 0.4, dur: 0.6, r: azar(1.5, 2.6), pico: azar(0.035, 0.06),
    pan: pan * 0.8, envio: 0.4, filtros: [{ tipo: 'highpass', f: 2400, q: 0.5 }, { tipo: 'lowpass', f: 7000, q: 0.5 }]
  });
}

function auto(G, t) {
  const dur = azar(3.5, 6);
  const izq = prob(0.5);
  const pan = izq ? -0.9 : 0.9;
  const f = azar(55, 85);
  // Motor (sierra filtrada con caída Doppler) que cruza el campo estéreo
  nota(G, {
    f, t, dur: dur * 0.5, tipo: 'sawtooth', glide: { f: f * 0.88, t: dur }, unisono: 2, detune: 9,
    a: dur * 0.5, d: 0.1, s: 1, r: dur * 0.5, pico: azar(0.05, 0.09), pan, panFin: -pan, tPan: dur, envio: 0.25,
    filtro: { f: 280, q: 0.6 }
  });
  // Armónico del motor, más tenue
  nota(G, {
    f: f * 2.01, t, dur: dur * 0.5, tipo: 'triangle', glide: { f: f * 1.77, t: dur },
    a: dur * 0.5, d: 0.1, s: 1, r: dur * 0.5, pico: 0.015, pan, panFin: -pan, tPan: dur, envio: 0.25,
    filtro: { f: 400, q: 0.5 }
  });
  // Rodadura de llantas
  ruido(G, {
    t, tipo: 'rosa', a: dur * 0.5, dur: dur * 0.5, r: dur * 0.5, pico: azar(0.04, 0.07), pan, panFin: -pan, tPan: dur,
    envio: 0.25, filtro: { f: 850, q: 0.6 }
  });
}

function bocina(G, t) {
  const par = elegir([[392, 494], [349, 440], [415, 523]]);
  const pan = azar(-0.7, 0.7);
  const veces = prob(0.4) ? 2 : 1;
  for (let i = 0; i < veces; i++) {
    const ti = t + i * 0.32;
    for (const f of par) {
      nota(G, {
        f, t: ti, dur: 0.22, tipo: 'square', a: 0.01, d: 0.05, s: 0.9, r: 0.08, pico: 0.012, pan, envio: 0.6,
        filtro: { f: 1100, q: 0.8 }
      });
    }
  }
}

function gaviotas(G, t) {
  const llamadas = Math.floor(azar(1, 5));
  const pan = azar(-0.8, 0.8);
  const base = azar(0.9, 1.15);
  const lejos = azar(0.02, 0.045);
  let ti = t;
  for (let i = 0; i < llamadas; i++) {
    const largo = azar(0.22, 0.38);
    const f0 = 1050 * base, f1 = azar(1900, 2400) * base, f2 = 950 * base;
    // Graznido: subida rápida y caída, con aspereza por FM
    const ctx = M.ctx;
    const out = crearPan(pan + azar(-0.1, 0.1));
    const env = ctx.createGain(); env.gain.value = 0;
    const bp = biquad('bandpass', 1900 * base, 1.6);
    const lp = biquad('lowpass', 3800, 0.5);
    const osc = ctx.createOscillator(); osc.type = 'sawtooth';
    const rasp = ctx.createOscillator(); rasp.frequency.value = azar(38, 55);
    const rg = ganancia(azar(40, 80));
    rasp.connect(rg); rg.connect(osc.frequency);
    osc.frequency.setValueAtTime(f0, ti);
    osc.frequency.exponentialRampToValueAtTime(f1, ti + 0.06);
    osc.frequency.exponentialRampToValueAtTime(f2, ti + largo);
    env.gain.setValueAtTime(0, ti);
    env.gain.linearRampToValueAtTime(lejos, ti + 0.025);
    env.gain.setTargetAtTime(lejos * 0.6, ti + 0.06, 0.06);
    env.gain.setTargetAtTime(0, ti + largo * 0.8, 0.04);
    osc.connect(bp); bp.connect(lp); lp.connect(env); env.connect(out); out.connect(G.seco);
    const s = ganancia(0.45); out.connect(s); s.connect(G.rev);
    const fin = ti + largo + 0.3;
    osc.start(ti); rasp.start(ti); osc.stop(fin); rasp.stop(fin);
    osc.onended = () => { try { env.disconnect(); out.disconnect(); s.disconnect(); } catch (e) { /* nada */ } };
    ti += largo + azar(0.08, 0.35);
  }
}

function barco(G, t) {
  // Sirena grave de barco a lo lejos, muy sutil
  const dur = azar(2.2, 3.2);
  for (const f of [98, 147.5]) {
    nota(G, {
      f, t, dur, tipo: 'sawtooth', unisono: 2, detune: 5, a: 0.5, d: 0.3, s: 0.9, r: 1.4,
      pico: 0.022, pan: azar(-0.4, 0.4), envio: 0.8, filtro: { f: 420, q: 0.7 }
    });
  }
}

// ---------- Planificador de eventos ----------
const EVENTOS = {
  ola: { fn: ola, cada: [4.2, 8.5] },
  auto: { fn: auto, cada: [5, 13] },
  gaviotas: { fn: gaviotas, cada: [9, 24] },
  bocina: { fn: bocina, cada: [28, 70] },
  barco: { fn: barco, cada: [70, 150] }
};

function planificarEventos(a) {
  const ahora = M.ctx.currentTime;
  const hasta = ahora + 1.5;
  for (const [k, ev] of Object.entries(EVENTOS)) {
    if (a.prox[k] < ahora - 2) a.prox[k] = ahora + azar(0.1, 1);   // tras una pausa larga, no ráfagas
    while (a.prox[k] < hasta) {
      try { ev.fn(a.grupo, Math.max(a.prox[k], ahora + 0.02)); } catch (e) { /* ignorar */ }
      a.prox[k] += azar(ev.cada[0], ev.cada[1]);
    }
  }
}

export function activarAmbiente(activo) {
  if (!M.ctx) return;
  if (activo) {
    if (amb) {
      if (amb.saliendo) { clearTimeout(amb.limpieza); amb.saliendo = false; amb.grupo.fundido(1, 1.5); }
      return;
    }
    const grupo = crearGrupo('ambiente', 0);
    const t = M.ctx.currentTime;
    const a = {
      grupo, saliendo: false, limpieza: null,
      fuentes: capasContinuas(grupo),
      prox: {
        ola: t + 0.5, auto: t + azar(2, 6), gaviotas: t + azar(3, 8),
        bocina: t + azar(20, 45), barco: t + azar(25, 60)
      },
      reloj: null
    };
    grupo.fundido(1, ENTRADA);
    a.reloj = setInterval(() => { if (amb === a && !a.saliendo) planificarEventos(a); }, 250);
    planificarEventos(a);
    amb = a;
  } else if (amb && !amb.saliendo) {
    const a = amb;
    a.saliendo = true;
    a.grupo.fundido(0, SALIDA);
    a.limpieza = setTimeout(() => {
      clearInterval(a.reloj);
      for (const f of a.fuentes) { try { f.stop(); } catch (e) { /* ya detenida */ } }
      setTimeout(() => a.grupo.desconectar(), 4000);
      if (amb === a) amb = null;
    }, (SALIDA + 0.3) * 1000);
  }
}
