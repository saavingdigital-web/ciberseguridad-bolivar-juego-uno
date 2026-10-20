// CiberDetective · Efectos de sonido: interfaz holográfica con guiño a la estrategia clásica.
// Cada función recibe (D, t) y devuelve el instante en que termina de sonar.
import { M, azar, elegir, nota, fm, ruido, agacharMusica } from './motor.js';
import { I } from './instrumentos.js';

const max = (...xs) => Math.max(...xs);

export const SFX = {
  // Tic seco y breve, con micro-variación de tono.
  click(D, t) {
    const k = azar(0.97, 1.03);
    ruido(D, { t, a: 0.0005, r: 0.012, pico: 0.1, filtro: { tipo: 'highpass', f: 4200 }, envio: 0 });
    return nota(D, { f: 2100 * k, glide: { f: 1250 * k, t: 0.025 }, t, tipo: 'sine', a: 0.001, dur: 0, r: 0.05, pico: 0.2, envio: 0.04 });
  },

  // Destello casi imperceptible, afinado en pentatónica para no molestar al repetirse.
  hover(D, t) {
    const f = elegir([1568, 1760, 1976, 2349]);
    return nota(D, { f, t, tipo: 'sine', a: 0.004, dur: 0, r: 0.07, pico: 0.045, pan: azar(-0.15, 0.15), envio: 0.12 });
  },

  // Selección de unidad: golpe grave + dos tonos ascendentes con brillo holográfico.
  seleccion(D, t) {
    nota(D, { f: 180, glide: { f: 90, t: 0.08 }, t, tipo: 'sine', a: 0.002, dur: 0, r: 0.14, pico: 0.14, envio: 0.05 });
    nota(D, { f: 659, t, tipo: 'triangle', a: 0.003, dur: 0, r: 0.14, pico: 0.1, pan: -0.15, envio: 0.2 });
    fm(D, { f: 988, t: t + 0.06, ratio: 2, indice: 1.2, indiceFin: 0.1, decIndice: 0.15, a: 0.003, r: 0.32, pico: 0.09, pan: 0.15, envio: 0.3 });
    return ruido(D, { t, a: 0.03, r: 0.12, pico: 0.03, filtro: { f: 3000, fFin: 7000, t: 0.15, q: 2 }, envio: 0.2 });
  },

  // Orden confirmada: "dut-dit" afirmativo + clic de madera.
  orden(D, t) {
    I.tic(D, t, 900, 0.07, 0);
    nota(D, { f: 392, t, tipo: 'square', a: 0.003, dur: 0.04, d: 0.03, s: 0.6, r: 0.06, pico: 0.07, envio: 0.12, filtro: { f: 1400, q: 0.8 } });
    nota(D, { f: 587, t: t + 0.075, tipo: 'square', a: 0.003, dur: 0.06, d: 0.04, s: 0.6, r: 0.12, pico: 0.07, envio: 0.2, filtro: { f: 1800, q: 0.8 } });
    return ruido(D, { t, a: 0.04, r: 0.1, pico: 0.025, filtro: { f: 900, fFin: 2600, t: 0.14, q: 1.2 }, pan: -0.2, panFin: 0.2, envio: 0.1 });
  },

  // Alarma: cuerno grave que crece + pitidos digitales alternos.
  alerta(D, t) {
    agacharMusica(0.55, 1.2);
    nota(D, {
      f: 220, t, dur: 0.55, tipo: 'sawtooth', unisono: 3, detune: 10, a: 0.12, d: 0.2, s: 0.85, r: 0.25, pico: 0.09, envio: 0.35,
      filtro: { f: 400, env: 1200, a: 0.2, d: 0.4, sost: 0.4, q: 1.5 }
    });
    let fin = t;
    for (let i = 0; i < 6; i++) {
      fin = nota(D, {
        f: i % 2 ? 660 : 880, t: t + i * 0.12, tipo: 'square', a: 0.004, dur: 0.08, d: 0.03, s: 0.8, r: 0.03,
        pico: 0.055, pan: i % 2 ? 0.3 : -0.3, envio: 0.25, filtro: { f: 2400, q: 1 }
      });
    }
    return max(fin, t + 0.8);
  },

  // Caso nuevo: alerta reconocible de dos notas (cuarta ascendente Mi–La) con campana y cuerpo.
  'caso-nuevo'(D, t) {
    agacharMusica(0.5, 1.6);
    ruido(D, { t, a: 0.12, dur: 0.12, r: 0.06, pico: 0.03, filtro: { f: 2000, fFin: 6000, t: 0.18, q: 1 }, envio: 0.3 });
    const nota1 = (f, ti, pan, largo) => {
      fm(D, { f, t: ti, ratio: 2, indice: 2.2, indiceFin: 0.25, decIndice: 0.4, a: 0.003, r: largo, pico: 0.13, pan, envio: 0.45 });
      nota(D, { f: f * 2, t: ti, tipo: 'sine', a: 0.003, dur: 0, r: largo * 0.6, pico: 0.04, pan: -pan, envio: 0.5 });
      return nota(D, { f: f / 2, t: ti, tipo: 'square', a: 0.005, dur: 0.12, d: 0.1, s: 0.5, r: 0.25, pico: 0.035, pan, envio: 0.2, filtro: { f: 900, q: 0.7 } });
    };
    nota1(659.3, t + 0.1, -0.2, 0.7);
    nota1(880, t + 0.32, 0.2, 1.2);
    return t + 1.6;
  },

  // Escaneo: barrido de banda estrecha + ráfaga de datos + zumbido con trémolo.
  analizar(D, t) {
    ruido(D, { t, a: 0.1, dur: 0.55, r: 0.15, pico: 0.06, filtro: { f: 500, fFin: 4500, t: 0.7, q: 7 }, pan: -0.6, panFin: 0.6, envio: 0.2 });
    nota(D, { f: 110, t, dur: 0.55, tipo: 'sawtooth', a: 0.05, d: 0.1, s: 0.8, r: 0.2, pico: 0.035, envio: 0.1, tremolo: { vel: 14, prof: 0.8 }, filtro: { f: 500, q: 1 } });
    const notas = [1047, 1175, 1319, 1568, 1760, 2093];
    let fin = t;
    for (let i = 0; i < 10; i++) {
      fin = nota(D, {
        f: elegir(notas), t: t + 0.05 + i * 0.06, tipo: 'square', a: 0.002, dur: 0, r: 0.045, pico: 0.03,
        pan: azar(-0.5, 0.5), envio: 0.2, filtro: { f: 3000, q: 0.7 }
      });
    }
    return max(fin, t + 0.85);
  },

  // Pista encontrada: destello ascendente de campanitas.
  pista(D, t) {
    const fs = [1047, 1319, 1568, 2093];
    let fin = t;
    fs.forEach((f, i) => {
      fin = fm(D, { f, t: t + i * 0.055, ratio: 3, indice: 1, indiceFin: 0.05, decIndice: 0.2, a: 0.002, r: 0.55, pico: 0.07, pan: -0.45 + i * 0.3, envio: 0.45 });
    });
    ruido(D, { t: t + 0.1, a: 0.05, r: 0.4, pico: 0.02, filtro: { tipo: 'highpass', f: 8000 }, envio: 0.5 });
    return fin;
  },

  // Acierto: "ding-ding" brillante en quinta ascendente.
  acierto(D, t) {
    nota(D, { f: 784, t, tipo: 'triangle', a: 0.003, dur: 0, r: 0.25, pico: 0.1, pan: -0.15, envio: 0.25 });
    fm(D, { f: 784, t, ratio: 3, indice: 0.8, decIndice: 0.1, a: 0.002, r: 0.3, pico: 0.05, pan: -0.15, envio: 0.3 });
    nota(D, { f: 1047, t: t + 0.09, tipo: 'triangle', a: 0.003, dur: 0, r: 0.45, pico: 0.12, pan: 0.15, envio: 0.3 });
    return fm(D, { f: 1047, t: t + 0.09, ratio: 3, indice: 0.9, decIndice: 0.12, a: 0.002, r: 0.5, pico: 0.06, pan: 0.15, envio: 0.35 });
  },

  // Error: zumbido grave descendente, breve y sin estridencias.
  error(D, t) {
    nota(D, { f: 120, glide: { f: 70, t: 0.1 }, t, tipo: 'sine', a: 0.002, dur: 0, r: 0.15, pico: 0.12, envio: 0.05 });
    nota(D, { f: 220, t, dur: 0.09, tipo: 'square', unisono: 2, detune: 18, a: 0.004, d: 0.05, s: 0.7, r: 0.04, pico: 0.07, envio: 0.1, filtro: { f: 900, q: 0.8 } });
    return nota(D, { f: 165, t: t + 0.13, dur: 0.16, tipo: 'square', unisono: 2, detune: 18, a: 0.004, d: 0.08, s: 0.6, r: 0.08, pico: 0.07, envio: 0.12, filtro: { f: 800, q: 0.8 } });
  },

  // Caso resuelto: arpegio de metales en Do mayor que cierra en acorde con timbal y brillo.
  resuelto(D, t) {
    agacharMusica(0.45, 1.8);
    [523, 659, 784].forEach((f, i) => I.metal(D, f, t + i * 0.08, 0.07, 0.06, -0.3 + i * 0.3));
    const tc = t + 0.26;
    [262, 523, 659, 784, 1047].forEach((f, i) => I.metal(D, f, tc, 0.6, i === 4 ? 0.06 : 0.04, -0.4 + i * 0.2));
    I.timbal(D, tc, 0.2, 65);
    I.platillo(D, tc, 0.04, 1.2);
    fm(D, { f: 2093, t: tc, ratio: 3.5, indice: 1.2, indiceFin: 0.05, decIndice: 0.4, a: 0.002, r: 1.2, pico: 0.05, envio: 0.6 });
    [1568, 2093, 2637].forEach((f, i) => I.kalimba(D, f, tc + 0.12 + i * 0.07, 0.04, 0.4 - i * 0.4));
    return tc + 1.6;
  },

  // Nueva era: fanfarria de 2,5 s (tresillo de anacrusa, Do mayor, cadencia plagal y resolución).
  era(D, t) {
    agacharMusica(0.25, 3.2);
    I.redoble(D, t, 0.45, 0.16, 65);
    I.oleaje(D, t, 0.45, 0.05);
    [0, 0.13, 0.26].forEach(dt => I.metal(D, 392, t + dt, 0.08, 0.08, 0));
    const t1 = t + 0.45;
    I.metal(D, 523, t1, 0.75, 0.1, 0);
    [262, 330, 392].forEach((f, i) => I.metal(D, f, t1, 0.75, 0.05, -0.4 + i * 0.4));
    I.bajoSub(D, 65.4, t1, 0.75, 0.2);
    I.timbal(D, t1, 0.26, 65);
    I.platillo(D, t1, 0.05, 1.4);
    const t2 = t + 1.3;
    I.metal(D, 587, t2, 0.25, 0.09, 0);
    [349, 440, 523].forEach((f, i) => I.metal(D, f, t2, 0.25, 0.045, -0.4 + i * 0.4));
    const t3 = t + 1.6;
    I.metal(D, 659, t3, 0.9, 0.11, 0);
    [262, 392, 523, 784].forEach((f, i) => I.metal(D, f, t3, 0.9, 0.045, -0.45 + i * 0.3));
    I.bajoSub(D, 65.4, t3, 0.9, 0.22);
    I.timbal(D, t3, 0.3, 65);
    I.taiko(D, t3, 0.3);
    I.platillo(D, t3, 0.07, 2);
    [1047, 1319, 1568, 2093].forEach((f, i) => I.marimba(D, f, t3 + 0.1 + i * 0.06, 0.05, -0.45 + i * 0.3));
    return t3 + 2.2;
  },

  // Tecnología investigada: barrido de energía ascendente que cristaliza en un acorde de La mayor.
  tecnologia(D, t) {
    agacharMusica(0.6, 1.4);
    nota(D, {
      f: 220, glide: { f: 880, t: 0.5 }, t, dur: 0.45, tipo: 'sawtooth', unisono: 2, detune: 12, a: 0.05, d: 0.2, s: 0.9, r: 0.1,
      pico: 0.06, envio: 0.3, filtro: { f: 400, fFin: 5000, t: 0.5, q: 3 }
    });
    ruido(D, { t, a: 0.45, dur: 0.45, r: 0.05, pico: 0.035, filtro: { f: 800, fFin: 8000, t: 0.5, q: 2 }, pan: -0.5, panFin: 0.5, envio: 0.3 });
    const tc = t + 0.5;
    nota(D, { f: 110, glide: { f: 55, t: 0.25 }, t: tc, tipo: 'sine', a: 0.002, dur: 0, r: 0.5, pico: 0.13, envio: 0.3 });
    let fin = tc;
    [880, 1109, 1319, 1760].forEach((f, i) => {
      fin = fm(D, { f, t: tc + i * 0.025, ratio: 2, indice: 1.4, indiceFin: 0.1, decIndice: 0.4, a: 0.002, r: 1.1, pico: 0.055, pan: -0.45 + i * 0.3, envio: 0.55 });
    });
    return fin;
  },

  // Notificación: "pop" suave de dos tonos.
  notificacion(D, t) {
    nota(D, { f: 880, t, tipo: 'sine', a: 0.004, dur: 0, r: 0.16, pico: 0.08, pan: -0.1, envio: 0.2 });
    ruido(D, { t, a: 0.001, r: 0.01, pico: 0.03, filtro: { f: 3000, q: 1 }, envio: 0 });
    return nota(D, { f: 1319, t: t + 0.085, tipo: 'sine', a: 0.004, dur: 0, r: 0.3, pico: 0.08, pan: 0.1, envio: 0.3 });
  },

  // Abrir panel: soplo ascendente + blip.
  abrir(D, t) {
    ruido(D, { t, tipo: 'rosa', a: 0.14, dur: 0.14, r: 0.12, pico: 0.1, filtro: { f: 400, fFin: 3200, t: 0.26, q: 1.5 }, pan: -0.2, panFin: 0.2, envio: 0.2 });
    return nota(D, { f: 600, glide: { f: 1200, t: 0.08 }, t: t + 0.1, tipo: 'sine', a: 0.003, dur: 0, r: 0.12, pico: 0.06, envio: 0.2 });
  },

  // Cerrar panel: soplo descendente + blip inverso.
  cerrar(D, t) {
    ruido(D, { t, tipo: 'rosa', a: 0.05, dur: 0.1, r: 0.12, pico: 0.09, filtro: { f: 3200, fFin: 400, t: 0.22, q: 1.5 }, pan: 0.2, panFin: -0.2, envio: 0.15 });
    return nota(D, { f: 1100, glide: { f: 520, t: 0.08 }, t, tipo: 'sine', a: 0.003, dur: 0, r: 0.1, pico: 0.055, envio: 0.15 });
  }
};

// Límites de polifonía por efecto: máximo simultáneo y separación mínima entre disparos.
export const LIMITES = {
  hover: { max: 2, sep: 0.04 },
  click: { max: 3, sep: 0.03 },
  _defecto: { max: 4, sep: 0.02 }
};
export const POLIFONIA_TOTAL = 14;

export function bus() { return M.bus.sfx; }
