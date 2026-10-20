// CiberDetective · Instrumentos sintetizados (melódicos y percusión) sobre las voces del motor.
import { nota, fm, ruido, azar } from './motor.js';

// ---------- Melódicos ----------
export const I = {
  // Pad amplio: tres sierras desafinadas abiertas en estéreo, filtro que respira despacio.
  pad(dest, f, t, dur, vel, pan = 0, brillo = 1) {
    return nota(dest, {
      f, t, dur, tipo: 'sawtooth', unisono: 3, detune: 11, ancho: 0.8, pan,
      a: 1.4, d: 1.5, s: 0.8, r: 2.4, pico: vel, envio: 0.6,
      filtro: { f: 520 * brillo, env: 760 * brillo, a: 1.9, d: 2.2, sost: 0.4, q: 0.6 }
    });
  },

  // Pad suave de triángulos (noir y finales).
  padSuave(dest, f, t, dur, vel, pan = 0) {
    return nota(dest, {
      f, t, dur, tipo: 'triangle', unisono: 2, detune: 7, ancho: 0.7, pan,
      a: 1.2, d: 1, s: 0.85, r: 2.5, pico: vel, envio: 0.65,
      filtro: { f: 1500, q: 0.5 }
    });
  },

  // Sub grave sostenido.
  bajoSub(dest, f, t, dur, vel) {
    nota(dest, { f, t, dur, tipo: 'sine', a: 0.5, d: 0.6, s: 0.9, r: 1.2, pico: vel, envio: 0 });
    return nota(dest, {
      f, t, dur, tipo: 'triangle', a: 0.6, d: 0.6, s: 0.8, r: 1.2, pico: vel * 0.35, envio: 0.05,
      filtro: { f: 260, q: 0.6 }
    });
  },

  // Bajo suave y redondo (exploración).
  bajo(dest, f, t, dur, vel) {
    nota(dest, {
      f, t, dur, tipo: 'triangle', a: 0.008, d: 0.25, s: 0.55, r: 0.12, pico: vel, envio: 0.03,
      filtro: { f: 380, env: 520, d: 0.16, q: 0.9 }
    });
    return nota(dest, { f, t, dur, tipo: 'sine', a: 0.01, d: 0.3, s: 0.7, r: 0.12, pico: vel * 0.8, envio: 0 });
  },

  // Bajo pulsante de sierra filtrada (tensión).
  bajoPulso(dest, f, t, dur, vel, corte) {
    return nota(dest, {
      f, t, dur, tipo: 'sawtooth', unisono: 2, detune: 6, ancho: 0.3,
      a: 0.004, d: 0.08, s: 0.4, r: 0.06, pico: vel, envio: 0.05,
      filtro: { f: corte, env: corte * 1.4, d: 0.07, q: 3 }
    });
  },

  // Contrabajo pizzicato (investigación).
  contrabajo(dest, f, t, dur, vel) {
    nota(dest, {
      f, t, dur, tipo: 'triangle', a: 0.006, d: 0.45, s: 0.25, r: 0.25, pico: vel, envio: 0.12,
      filtro: { f: 350, env: 700, d: 0.12, q: 1.2 }
    });
    return nota(dest, { f, t, dur, tipo: 'sine', a: 0.008, d: 0.6, s: 0.4, r: 0.25, pico: vel * 0.7, envio: 0 });
  },

  // Campana FM para arpegios lentos.
  campana(dest, f, t, vel, pan = 0) {
    return fm(dest, {
      f, t, ratio: 3.5, indice: 1.6, indiceFin: 0.08, decIndice: 0.6,
      a: 0.003, r: 1.8, pico: vel, pan, envio: 0.6
    });
  },

  // Marimba: fundamental + parcial 4:1 corto + golpe de baqueta.
  marimba(dest, f, t, vel, pan = 0) {
    nota(dest, { f: f * 4, t, tipo: 'sine', a: 0.001, dur: 0, r: 0.09, pico: vel * 0.3, pan, envio: 0.2 });
    ruido(dest, { t, a: 0.001, r: 0.015, pico: vel * 0.12, filtro: { f: 2600, q: 1.5 }, pan, envio: 0.1 });
    return nota(dest, { f, t, tipo: 'sine', a: 0.002, dur: 0, r: 0.6, pico: vel, pan, envio: 0.28 });
  },

  // Kalimba: FM breve + parcial inarmónico metálico.
  kalimba(dest, f, t, vel, pan = 0) {
    nota(dest, { f: f * 5.4, t, tipo: 'sine', a: 0.001, dur: 0, r: 0.06, pico: vel * 0.22, pan, envio: 0.2 });
    return fm(dest, {
      f, t, ratio: 1, indice: 0.9, indiceFin: 0, decIndice: 0.08,
      a: 0.002, r: 1.0, pico: vel, pan, envio: 0.32
    });
  },

  // Steelpan: FM con índice que cae + segundo armónico, toque caribeño.
  steelpan(dest, f, t, vel, pan = 0) {
    nota(dest, { f: f * 2, t, tipo: 'sine', a: 0.004, dur: 0, r: 0.35, pico: vel * 0.22, pan, envio: 0.3 });
    return fm(dest, {
      f, t, ratio: 1, indice: 2.2, indiceFin: 0.35, decIndice: 0.25,
      a: 0.004, d: 0.3, s: 0.3, dur: 0.08, r: 0.75, pico: vel, pan, envio: 0.35
    });
  },

  // Piano eléctrico (Rhodes) FM: cuerpo cálido + "tine" breve.
  epiano(dest, f, t, dur, vel, pan = 0) {
    fm(dest, {
      f, t, ratio: 14, indice: 0.12, indiceFin: 0, decIndice: 0.05,
      a: 0.001, dur: 0, r: 0.25, pico: vel * 0.25, pan, envio: 0.3
    });
    return fm(dest, {
      f, t, dur, ratio: 1, indice: 1.4, indiceFin: 0.15, decIndice: 0.9,
      a: 0.004, d: 1.4, s: 0.35, r: 0.6, pico: vel, pan, envio: 0.4
    });
  },

  // Vibráfono con trémolo de motor.
  vibrafono(dest, f, t, dur, vel, pan = 0) {
    nota(dest, { f: f * 4, t, tipo: 'sine', a: 0.001, dur: 0, r: 0.12, pico: vel * 0.18, pan, envio: 0.4 });
    return nota(dest, {
      f, t, dur, tipo: 'sine', a: 0.003, d: 1.2, s: 0.3, r: 0.9, pico: vel, pan, envio: 0.55,
      tremolo: { vel: 4.8, prof: 0.45 }
    });
  },

  // Lead aireado tipo ocarina/flauta.
  lead(dest, f, t, dur, vel, pan = 0) {
    nota(dest, { f: f * 2, t, dur, tipo: 'sine', a: 0.3, d: 0.4, s: 0.6, r: 0.8, pico: vel * 0.18, pan, envio: 0.7 });
    ruido(dest, { t, a: 0.15, dur: dur * 0.6, r: 0.5, pico: vel * 0.05, filtro: { f: f * 2, q: 6 }, pan, envio: 0.6 });
    return nota(dest, {
      f, t, dur, tipo: 'triangle', a: 0.25, d: 0.5, s: 0.75, r: 0.8, pico: vel, pan, envio: 0.65,
      vibrato: { vel: 5.2, cents: 14, retardo: 0.45 }, filtro: { f: 2400, q: 0.5 }
    });
  },

  // Metales sintéticos para fanfarrias.
  metal(dest, f, t, dur, vel, pan = 0) {
    return nota(dest, {
      f, t, dur, tipo: 'sawtooth', unisono: 3, detune: 9, ancho: 0.6, pan,
      a: 0.03, d: 0.25, s: 0.8, r: 0.3, pico: vel, envio: 0.45,
      filtro: { f: 550, env: 2600, a: 0.06, d: 0.35, sost: 0.35, q: 1 },
      vibrato: { vel: 5.5, cents: 8, retardo: 0.3 }
    });
  },

  // Pulsación synthwave para arpegios rápidos.
  pluck(dest, f, t, vel, pan = 0) {
    return nota(dest, {
      f, t, tipo: 'square', a: 0.003, dur: 0, r: 0.22, pico: vel, pan, envio: 0.35,
      filtro: { f: 700, env: 1900, d: 0.12, q: 2 }
    });
  },

  // ---------- Percusión ----------
  bombo(dest, t, vel) {
    ruido(dest, { t, a: 0.001, r: 0.014, pico: vel * 0.25, filtro: { tipo: 'lowpass', f: 3000 }, envio: 0 });
    return nota(dest, { f: 125, glide: { f: 44, t: 0.09 }, t, tipo: 'sine', a: 0.002, dur: 0, r: 0.38, pico: vel, envio: 0.04 });
  },

  palmada(dest, t, vel, pan = 0) {
    for (let i = 0; i < 3; i++) {
      ruido(dest, { t: t + i * 0.011, a: 0.001, r: 0.03, pico: vel * 0.7, filtro: { f: 1350, q: 1.4 }, pan, envio: 0.4 });
    }
    return ruido(dest, { t: t + 0.033, a: 0.001, r: 0.2, pico: vel, filtro: { f: 1250, q: 1.1 }, pan, envio: 0.55 });
  },

  aro(dest, t, vel, pan = 0) {
    nota(dest, { f: 1650, t, tipo: 'triangle', a: 0.001, dur: 0, r: 0.035, pico: vel * 0.7, pan, envio: 0.25 });
    return ruido(dest, { t, a: 0.001, r: 0.025, pico: vel * 0.5, filtro: { f: 3200, q: 2 }, pan, envio: 0.25 });
  },

  hat(dest, t, vel, abierto = false, pan = 0.25) {
    return ruido(dest, {
      t, a: 0.001, r: abierto ? 0.24 : 0.045, pico: vel, pan, envio: 0.12,
      filtros: [{ tipo: 'highpass', f: 7200, q: 0.7 }, { tipo: 'peaking', f: 10000, q: 1, g: 5 }]
    });
  },

  shaker(dest, t, vel, pan = -0.3) {
    return ruido(dest, { t, a: 0.014, r: 0.07, pico: vel, filtro: { f: 6200, q: 0.9 }, pan, envio: 0.15 });
  },

  conga(dest, t, f, vel, pan = 0) {
    ruido(dest, { t, a: 0.001, r: 0.022, pico: vel * 0.3, filtro: { f: f * 6, q: 1.2 }, pan, envio: 0.2 });
    return nota(dest, { f: f * 1.6, glide: { f, t: 0.025 }, t, tipo: 'sine', a: 0.002, dur: 0, r: 0.3, pico: vel, pan, envio: 0.25 });
  },

  taiko(dest, t, vel) {
    ruido(dest, { t, tipo: 'rosa', a: 0.002, r: 0.28, pico: vel * 0.6, filtro: { tipo: 'lowpass', f: 420 }, envio: 0.7 });
    return nota(dest, { f: 88, glide: { f: 46, t: 0.28 }, t, tipo: 'sine', a: 0.003, dur: 0, r: 1.5, pico: vel, envio: 0.7 });
  },

  tom(dest, t, f, vel, pan = 0) {
    ruido(dest, { t, a: 0.001, r: 0.05, pico: vel * 0.25, filtro: { f: f * 4, q: 1 }, pan, envio: 0.3 });
    return nota(dest, { f: f * 1.4, glide: { f, t: 0.08 }, t, tipo: 'sine', a: 0.002, dur: 0, r: 0.45, pico: vel, pan, envio: 0.35 });
  },

  // Bloque de madera (tic-tac).
  tic(dest, t, f, vel, pan = 0) {
    ruido(dest, { t, a: 0.0005, r: 0.012, pico: vel * 0.5, filtro: { f, q: 4 }, pan, envio: 0.25 });
    return nota(dest, { f, t, tipo: 'triangle', a: 0.001, dur: 0, r: 0.04, pico: vel, pan, envio: 0.25 });
  },

  escobilla(dest, t, vel, pan = 0.2) {
    return ruido(dest, { t, tipo: 'rosa', a: 0.06, r: 0.2, pico: vel, filtro: { f: 3600, q: 0.5 }, pan, envio: 0.3 });
  },

  platillo(dest, t, vel, dur = 1.6) {
    return ruido(dest, {
      t, a: 0.002, r: dur, pico: vel, envio: 0.5,
      filtros: [{ tipo: 'highpass', f: 5200, q: 0.5 }, { tipo: 'peaking', f: 8500, q: 0.8, g: 4 }]
    });
  },

  // Platillo invertido que crece hasta el golpe.
  oleaje(dest, t, dur, vel) {
    return ruido(dest, {
      t, a: dur, dur, r: 0.06, pico: vel, envio: 0.4,
      filtro: { tipo: 'highpass', f: 1800, fFin: 7000, t: dur, q: 0.5 }
    });
  },

  timbal(dest, t, vel, f = 98) {
    ruido(dest, { t, tipo: 'rosa', a: 0.001, r: 0.12, pico: vel * 0.3, filtro: { tipo: 'lowpass', f: 700 }, envio: 0.5 });
    return nota(dest, { f: f * 1.06, glide: { f, t: 0.06 }, t, tipo: 'sine', a: 0.002, dur: 0, r: 1.3, pico: vel, envio: 0.55 });
  },

  redoble(dest, t, dur, vel, f = 98) {
    const n = Math.max(2, Math.floor(dur * 22));
    for (let i = 0; i < n; i++) {
      const x = i / (n - 1);
      this.timbal(dest, t + (i * dur) / n + azar(0, 0.006), vel * (0.25 + 0.75 * x * x), f);
    }
    return t + dur;
  }
};
