// CiberDetective · Música procedural por modos con secuenciador de planificación anticipada.
import { M, mtof, azar, elegir, elegirDistinto, prob, limitar, crearGrupo } from './motor.js';
import { I } from './instrumentos.js';

const TICK_MS = 25;          // frecuencia del planificador
const ANTICIPO = 0.12;       // s programados por delante (pestaña visible)
const ANTICIPO_OCULTO = 1.3; // en segundo plano los temporizadores se ralentizan
const FUNDIDO = 1.6;         // crossfade entre modos (s)

// =====================================================================
// MENÚ · Re menor, épico y misterioso: pads amplios, arpegio lento de campanas,
// taiko lejano y percusión caribeña suave (conga en tresillo + shaker).
// =====================================================================
const MENU_AC = {
  Dm: { b: 38, pad: [50, 57, 60, 64, 65], arp: [62, 65, 69, 72, 74, 77] },
  Bb: { b: 34, pad: [46, 53, 57, 62, 65], arp: [58, 62, 65, 69, 70, 74] },
  F:  { b: 41, pad: [53, 57, 60, 64, 67], arp: [65, 69, 72, 76, 77, 81] },
  C:  { b: 36, pad: [48, 55, 62, 64, 67], arp: [60, 64, 67, 72, 74, 76] },
  Gm: { b: 43, pad: [55, 58, 62, 65, 69], arp: [62, 67, 70, 74, 77, 79] },
  A:  { b: 45, pad: [57, 61, 64, 67, 69], arp: [61, 64, 69, 73, 76, 79] }
};
const MENU_PROG = [['Dm', 'Bb', 'F', 'C'], ['Dm', 'Gm', 'Bb', 'A'], ['Bb', 'C', 'Dm', 'Dm'], ['Dm', 'F', 'Gm', 'A']];
const ARP_PAT = [[0, 1, 2, 3, 4, 3, 2, 1], [0, 2, 1, 3, 2, 4, 3, 5], [0, 1, 2, 4, 5, 4, 2, 1], [5, 4, 3, 2, 1, 2, 3, 4], [0, 2, 4, 2, 1, 3, 5, 3]];

const menu = {
  bpm: 70, swing: 0,
  iniciar(e) { e.prog = MENU_PROG[0]; e.frase = 0; e.pat = ARP_PAT[0]; e.capas = { perc: false, lead: false, arp: true }; },
  paso(s, t, n) {
    const e = s.e, d = s.dur16, D = s.dest;
    const compas = Math.floor(n / 16), p = n % 16, cf = compas % 8;
    if (p === 0 && cf === 0) {
      if (compas > 0) { e.frase++; e.prog = elegirDistinto(MENU_PROG, e.prog); }
      e.capas.perc = e.frase >= 1 && prob(0.75);
      e.capas.lead = e.frase >= 2 && prob(0.55);
      e.capas.arp = e.frase === 0 || prob(0.85);
    }
    const ac = MENU_AC[e.prog[Math.floor(cf / 2)]];
    if (p === 0 && cf % 2 === 0) {
      ac.pad.forEach((m, i) => I.pad(D, mtof(m), t + i * 0.035, d * 32 - 0.3, 0.045, (i / (ac.pad.length - 1)) * 1.2 - 0.6));
      I.bajoSub(D, mtof(ac.b), t, d * 32 - 0.4, 0.15);
      if (cf === 0) I.taiko(D, t, 0.42);
      else if (cf === 4 && e.frase > 0) I.taiko(D, t, 0.26);
      if (cf % 4 === 0) e.pat = elegir(ARP_PAT);
    }
    if (e.capas.arp && p % 2 === 0 && !prob(0.12)) {
      const m = ac.arp[e.pat[(p / 2) % 8] % ac.arp.length] + (prob(0.08) ? 12 : 0);
      I.campana(D, mtof(m), t, p % 8 === 0 ? 0.055 : 0.04, (p % 4 === 0) ? -0.35 : 0.35);
    }
    if (e.capas.perc) {
      if (p % 4 === 2) I.shaker(D, t, 0.03 * azar(0.7, 1));
      if (p === 0 || p === 6 || p === 12) I.conga(D, t, p === 0 ? 196 : 262, 0.07, p === 0 ? -0.2 : 0.25);
      if (p === 14 && prob(0.35)) I.conga(D, t, 330, 0.045, 0.3);
    }
    if (e.capas.lead && p === 8 && cf % 2 === 0 && prob(0.7)) {
      const m = elegir(ac.arp.filter(x => x <= 79));
      I.lead(D, mtof(m), t, d * 14, 0.06, azar(-0.3, 0.3));
    }
  }
};

// =====================================================================
// EXPLORACIÓN · Sol mayor, synthwave tranquila con aire caribeño:
// marimba/kalimba/steelpan con motivos que mutan, bajo en tresillo, pad suave.
// =====================================================================
const EXP_AC = {
  G:  { b: 43, pad: [55, 59, 62, 66], t: [67, 71, 74, 78] },
  Em: { b: 40, pad: [52, 55, 59, 62], t: [64, 67, 71, 74] },
  C:  { b: 36, pad: [48, 55, 59, 64], t: [64, 67, 71, 72] },
  D:  { b: 38, pad: [50, 57, 62, 66], t: [62, 66, 69, 74] },
  Am: { b: 45, pad: [57, 60, 64, 67], t: [64, 67, 69, 72] },
  Bm: { b: 47, pad: [54, 59, 62, 66], t: [62, 66, 69, 74] }
};
const EXP_PROG = [['G', 'Em', 'C', 'D'], ['C', 'D', 'Bm', 'Em'], ['Em', 'C', 'G', 'D'], ['G', 'Bm', 'C', 'D'], ['Am', 'D', 'G', 'Em'], ['C', 'G', 'Am', 'D']];
const PENTA = [62, 64, 67, 69, 71, 74, 76, 79, 81];
const RIT_MEL = [[0, 3, 6, 8, 10, 12, 14], [0, 2, 6, 8, 11, 14], [0, 3, 6, 10, 12], [2, 4, 6, 10, 12, 14], [0, 6, 8, 10, 14], [0, 3, 6, 8, 9, 12]];
const RIT_BAJO = [[0, 6, 8, 12], [0, 3, 6, 8, 14], [0, 6, 10, 12], [0, 8, 11, 14]];
const INSTR_MEL = ['marimba', 'kalimba', 'steelpan'];

function motivo() {
  const ritmo = elegir(RIT_MEL);
  let g = Math.floor(azar(2, 6));
  return ritmo.map(p => {
    g = limitar(g + elegir([-2, -1, -1, 0, 1, 1, 2, 3, -3]), 0, PENTA.length - 1);
    return { p, g };
  });
}
function mutar(mot) {
  return mot.map(x => (prob(0.3) ? { p: x.p, g: limitar(x.g + elegir([-2, -1, 1, 2]), 0, PENTA.length - 1) } : x))
    .filter(() => !prob(0.1));
}
function haciaAcorde(m, tonos) {   // acerca la nota al tono de acorde más cercano
  let mejor = m, dist = 99;
  for (const x of tonos) for (const o of [-12, 0, 12]) {
    const dd = Math.abs(x + o - m);
    if (dd < dist && x + o >= 60 && x + o <= 84) { dist = dd; mejor = x + o; }
  }
  return mejor;
}

const exploracion = {
  bpm: 96, swing: 0.1,
  iniciar(e) {
    e.prog = EXP_PROG[0]; e.frase = 0; e.mot = motivo(); e.var = mutar(e.mot);
    e.instr = 'marimba'; e.estilo = 'ligero'; e.bajo = RIT_BAJO[0]; e.arp = false;
  },
  paso(s, t, n) {
    const e = s.e, d = s.dur16, D = s.dest;
    const compas = Math.floor(n / 16), p = n % 16, cf = compas % 8;
    if (p === 0 && cf === 0 && compas > 0) {
      e.frase++;
      e.prog = elegirDistinto(EXP_PROG, e.prog);
      if (prob(0.6)) e.mot = motivo();
      e.var = mutar(e.mot);
      e.instr = elegirDistinto(INSTR_MEL, e.instr);
      e.estilo = elegir(['completo', 'completo', 'ligero', 'ligero', 'sin']);
      e.bajo = elegir(RIT_BAJO);
      e.arp = e.estilo === 'completo' && prob(0.5);
    }
    const ac = EXP_AC[e.prog[cf % 4]];

    if (p === 0) {
      ac.pad.forEach((m, i) => I.pad(D, mtof(m), t + i * 0.02, d * 15, 0.03, i % 2 ? 0.4 : -0.4, 1.3));
    }
    // Bajo en tresillo
    const ib = e.bajo.indexOf(p);
    if (ib >= 0) {
      let m = ac.b;
      if (ib > 0 && prob(0.3)) m += 7;
      if (p === 14 && prob(0.4)) m += 12;
      I.bajo(D, mtof(m), t, d * (p === 0 ? 3 : 1.6), 0.2);
    }
    // Melodía: compases 0-1 motivo, 2 variación, 3 respuesta o silencio
    const sub = cf % 4;
    const fuente = sub === 2 ? e.var : (sub === 3 ? (prob(0.5) ? null : e.var) : e.mot);
    if (fuente && !(sub === 3 && p > 8)) {
      for (const x of fuente) if (x.p === p) {
        let m = PENTA[x.g];
        if (p === 0 || p === 8) m = haciaAcorde(m, ac.t);
        const vel = (p % 4 === 0 ? 0.11 : 0.08) * azar(0.85, 1);
        I[e.instr](D, mtof(m), t, vel, azar(-0.35, 0.35));
        if (e.instr === 'marimba' && prob(0.15)) I.marimba(D, mtof(m + 12), t + d, vel * 0.5, 0.4);
      }
    }
    // Arpegio synthwave opcional
    if (e.arp && p % 2 === 1) {
      const m = ac.t[(p >> 1) % ac.t.length] - 12;
      I.pluck(D, mtof(m), t, 0.018, (p % 4 === 1) ? -0.5 : 0.5);
    }
    // Batería
    if (e.estilo === 'completo') {
      if (p === 0 || p === 8 || (p === 10 && prob(0.3))) I.bombo(D, t, 0.22);
      if (p === 4 || p === 12) I.palmada(D, t, 0.06, 0.1);
      if (p % 4 === 2) I.hat(D, t, 0.03 * azar(0.7, 1));
    }
    if (e.estilo !== 'sin' || p % 2 === 0) I.shaker(D, t, (p % 4 === 2 ? 0.028 : 0.016) * azar(0.6, 1));
    if (e.estilo === 'ligero' && (p === 0 || p === 6 || p === 12)) I.conga(D, t, p === 0 ? 220 : 294, 0.05, 0.3);
  }
};

// =====================================================================
// TENSIÓN · La menor / frigio: bajo pulsante en semicorcheas con filtro que se abre,
// bombo, toms, tic metálico, drones y golpes disonantes.
// =====================================================================
const TEN_AC = {
  Am: { b: 45, pad: [57, 60, 64], st: [69, 72, 76] },
  Bb: { b: 46, pad: [58, 62, 65], st: [70, 74, 77] },
  G:  { b: 43, pad: [55, 59, 62], st: [67, 71, 74] },
  F:  { b: 41, pad: [53, 57, 60], st: [69, 72, 77] },
  E:  { b: 40, pad: [56, 59, 64], st: [68, 71, 76] },
  Dm: { b: 38, pad: [53, 57, 62], st: [65, 69, 74] }
};
const TEN_PROG = [['Am', 'Am', 'F', 'E'], ['Am', 'Bb', 'Am', 'G'], ['Am', 'F', 'Dm', 'E'], ['Dm', 'Bb', 'Am', 'E']];
const ACENTOS = [[1, 0.5, 0.7, 0.5, 0.9, 0.5, 0.7, 0.5], [1, 0.4, 0.4, 0.9, 0.4, 0.4, 0.9, 0.5], [1, 0.6, 0.8, 0.6, 1, 0.6, 0.8, 0.9]];
const OCTAVAS = [[3, 7, 11, 15], [6, 14], [2, 10, 13], []];

const tension = {
  bpm: 112, swing: 0,
  iniciar(e) { e.prog = TEN_PROG[0]; e.int = 2; e.ac = ACENTOS[0]; e.oct = OCTAVAS[0]; },
  paso(s, t, n) {
    const e = s.e, d = s.dur16, D = s.dest;
    const compas = Math.floor(n / 16), p = n % 16, cf = compas % 8;
    if (p === 0 && cf === 0 && compas > 0) {
      e.prog = elegirDistinto(TEN_PROG, e.prog);
      e.int = elegir([1, 2, 2, 3, 3]);
      e.ac = elegir(ACENTOS); e.oct = elegir(OCTAVAS);
    }
    const ac = TEN_AC[e.prog[Math.floor(cf / 2)]];
    const avance = (cf * 16 + p) / 128;            // el filtro se abre a lo largo de la frase
    const corte = 260 + 1100 * avance * (0.6 + 0.2 * e.int);

    if (p === 0 && cf % 2 === 0) {
      ac.pad.forEach((m, i) => I.pad(D, mtof(m - 12), t, d * 31, 0.035, (i - 1) * 0.6, 0.7));
    }
    const m = ac.b + (e.oct.includes(p) ? 12 : 0);
    I.bajoPulso(D, mtof(m), t, d * 0.6, 0.09 * e.ac[p % 8], corte);

    if (e.int >= 2) {
      if (p === 0 || p === 8 || (e.int === 3 && p === 10)) I.bombo(D, t, 0.3);
      I.hat(D, t, (p % 2 ? 0.012 : 0.022) * azar(0.7, 1), p === 14 && prob(0.3));
    }
    if (p === 12 || (e.int === 3 && p === 4)) I.palmada(D, t, 0.05, -0.15);
    if (p % 4 === 0 && (e.int !== 2 || cf % 2 === 1)) I.tic(D, t, 3100, 0.02, 0.45);
    if (cf === 7 && p >= 8 && (p % 2 === 0)) I.tom(D, t, [196, 165, 147, 110][(p - 8) >> 1], 0.12, (p - 11) * 0.12);
    if (e.int === 3 && p === 14 && (cf === 3 || cf === 7)) {
      ac.st.forEach((x, i) => I.metal(D, mtof(x), t, d * 1.2, 0.03, (i - 1) * 0.4));
    }
    if (cf === 0 && p === 0) I.taiko(D, t, 0.3);
  }
};

// =====================================================================
// INVESTIGACIÓN · Do menor, noir minimalista: piano eléctrico, contrabajo,
// vibráfono ocasional, escobillas y un tic-tac sutil constante.
// =====================================================================
const INV_AC = {
  Cm9:    { b: 36, ep: [51, 55, 58, 62] },
  Abmaj7: { b: 44, ep: [56, 60, 63, 67] },
  Fm9:    { b: 41, ep: [53, 56, 63, 67] },
  G7b9:   { b: 43, ep: [53, 56, 59, 62] },
  Ebmaj7: { b: 39, ep: [51, 55, 58, 62] },
  Dm7b5:  { b: 38, ep: [50, 53, 56, 60] },
  Bb7:    { b: 46, ep: [56, 62, 65, 67] }
};
const INV_PROG = [['Cm9', 'Abmaj7', 'Fm9', 'G7b9'], ['Cm9', 'Cm9', 'Dm7b5', 'G7b9'], ['Fm9', 'Bb7', 'Ebmaj7', 'G7b9'], ['Cm9', 'Ebmaj7', 'Abmaj7', 'G7b9']];
const BLUES = [60, 63, 65, 66, 67, 70, 72, 75];

const investigacion = {
  bpm: 64, swing: 0.2,
  iniciar(e) { e.prog = INV_PROG[0]; e.frase = 0; e.mel = []; },
  paso(s, t, n) {
    const e = s.e, d = s.dur16, D = s.dest;
    const compas = Math.floor(n / 16), p = n % 16, cf = compas % 8;
    if (p === 0 && cf === 0 && compas > 0) { e.frase++; e.prog = elegirDistinto(INV_PROG, e.prog); }
    const ac = INV_AC[e.prog[Math.floor(cf / 2)]];
    const sig = INV_AC[e.prog[(Math.floor(cf / 2) + 1) % 4]];

    // Tic-tac: la firma de este modo
    if (p % 4 === 0) I.tic(D, t, (p % 8 === 0) ? 2350 : 1750, 0.02, (p % 8 === 0) ? -0.3 : 0.3);

    if (p === 0 && cf % 2 === 0) {
      ac.ep.forEach((m, i) => I.epiano(D, mtof(m), t + i * 0.018, d * 26, 0.06, (i - 1.5) * 0.25));
      I.padSuave(D, mtof(ac.b + 12), t, d * 31, 0.02);
    }
    if (p === 6 && cf % 2 === 1 && prob(0.5)) {
      ac.ep.forEach((m, i) => I.epiano(D, mtof(m), t + i * 0.012, d * 6, 0.035, (i - 1.5) * 0.25));
    }
    // Contrabajo
    if (p === 0) I.contrabajo(D, mtof(ac.b), t, d * 6, 0.22);
    if (p === 8) I.contrabajo(D, mtof(ac.b + (prob(0.6) ? 7 : 12)), t, d * 5, 0.17);
    if (p === 12 && cf % 2 === 1 && prob(0.6)) I.contrabajo(D, mtof(sig.b + elegir([-1, 1])), t, d * 3, 0.14);
    if (p === 12 && cf % 2 === 0 && prob(0.3)) I.contrabajo(D, mtof(ac.b + 10), t, d * 3, 0.12);
    // Escobillas
    if (e.frase > 0 && (p === 4 || p === 12)) I.escobilla(D, t, 0.025);
    // Frase de vibráfono ocasional
    if (p === 0) {
      e.mel = (e.frase > 0 && prob(0.4))
        ? [2, 6, 8, 11, 14].filter(() => prob(0.55)).map(x => ({ p: x, m: elegir(BLUES) + (prob(0.3) ? 12 : 0) }))
        : [];
    }
    for (const x of e.mel) if (x.p === p) I.vibrafono(D, mtof(x.m), t, d * 3, 0.055, azar(-0.4, 0.4));
  }
};

// =====================================================================
// VICTORIA · Do mayor, fanfarria breve que resuelve (no se repite).
// =====================================================================
const C = (D, t, notas, dur, vel) => notas.forEach((m, i) => I.metal(D, mtof(m), t, dur, vel, (i / Math.max(1, notas.length - 1)) * 0.8 - 0.4));
const VICTORIA = {
  0:  (D, t, d) => { I.metal(D, mtof(67), t, d * 0.8, 0.09); I.redoble(D, t, d * 4, 0.12); I.oleaje(D, t, d * 4, 0.05); },
  1:  (D, t, d) => I.metal(D, mtof(72), t, d * 0.8, 0.09),
  2:  (D, t, d) => I.metal(D, mtof(76), t, d * 0.8, 0.09),
  4:  (D, t, d) => {
    I.metal(D, mtof(79), t, d * 5.5, 0.1); C(D, t, [60, 64, 67], d * 5.5, 0.05);
    I.bajoSub(D, mtof(36), t, d * 5.5, 0.16); I.timbal(D, t, 0.22, 65); I.platillo(D, t, 0.06, 1.6);
  },
  10: (D, t, d) => { I.metal(D, mtof(77), t, d * 1.8, 0.09); C(D, t, [57, 60, 65], d * 3.8, 0.045); I.bajoSub(D, mtof(41), t, d * 3.8, 0.14); },
  12: (D, t, d) => I.metal(D, mtof(81), t, d * 1.8, 0.09),
  14: (D, t, d) => {
    I.metal(D, mtof(79), t, d * 3.8, 0.1); C(D, t, [60, 62, 67], d * 1.8, 0.045);
    I.bajoSub(D, mtof(43), t, d * 3.8, 0.14); I.oleaje(D, t, d * 4, 0.05); I.redoble(D, t + d, d * 3, 0.1);
  },
  16: (D, t, d) => C(D, t, [59, 62, 67], d * 1.8, 0.045),
  18: (D, t, d) => {
    I.metal(D, mtof(84), t, d * 14, 0.11); C(D, t, [48, 55, 60, 64, 67], d * 14, 0.045);
    I.bajoSub(D, mtof(36), t, d * 16, 0.18); I.timbal(D, t, 0.26, 65); I.taiko(D, t, 0.3);
    I.platillo(D, t, 0.08, 2.4);
    [84, 88, 91, 96].forEach((m, i) => I.marimba(D, mtof(m), t + i * d, 0.06, -0.4 + i * 0.27));
  },
  22: (D, t, d) => { I.conga(D, t, 262, 0.08, -0.2); I.conga(D, t + d * 0.5, 330, 0.07, 0.2); I.conga(D, t + d, 392, 0.08, 0.3); },
  26: (D, t) => [91, 88, 96].forEach((m, i) => I.steelpan(D, mtof(m), t + i * 0.13, 0.05, 0.3 - i * 0.3)),
  32: (D, t, d) => [60, 64, 67, 74].forEach((m, i) => I.padSuave(D, mtof(m), t, d * 14, 0.025, (i - 1.5) * 0.4))
};
const victoria = {
  bpm: 120, swing: 0, pasosTotales: 56,
  iniciar() {},
  paso(s, t, n) { const ev = VICTORIA[n]; if (ev) ev(s.dest, t, s.dur16); }
};

const PIEZAS = { menu, exploracion, tension, investigacion, victoria };

// =====================================================================
// Secuenciador
// =====================================================================
class Instancia {
  constructor(nombre, pieza, entrada) {
    this.nombre = nombre;
    this.pieza = pieza;
    this.grupo = crearGrupo('musica', 0);
    this.dest = this.grupo;
    this.e = {};
    pieza.iniciar(this.e);
    this.n = 0;
    this.t = M.ctx.currentTime + 0.06;
    this.vivo = true;
    this.saliendo = false;
    this.finEn = Infinity;
    this.grupo.fundido(1, entrada);
  }
  get dur16() { return 60 / this.pieza.bpm / 4; }
  planificar(hasta) {
    const ahora = M.ctx.currentTime;
    if (this.t < ahora - 0.05) this.t = ahora + 0.05;   // nos quedamos atrás: resincroniza sin ráfagas
    while (this.vivo && this.t < hasta) {
      const sw = (this.n % 2 === 1) ? this.dur16 * (this.pieza.swing || 0) : 0;
      try { this.pieza.paso(this, this.t + sw, this.n); } catch (err) { /* una nota fallida no detiene la música */ }
      this.t += this.dur16;
      this.n++;
      if (this.pieza.pasosTotales && this.n >= this.pieza.pasosTotales) this.vivo = false;
    }
  }
  salir(dur) {
    if (this.saliendo) return;
    this.saliendo = true;
    this.grupo.fundido(0, dur);
    this.finEn = M.ctx.currentTime + dur + 0.05;
    const g = this.grupo;
    setTimeout(() => g.desconectar(), (dur + 6) * 1000);   // deja sonar las colas antes de soltar
  }
}

let modoActual = null;
let instancias = [];
let reloj = null;

function oculto() {
  return typeof document !== 'undefined' && document.hidden === true;
}

function tick() {
  if (!M.ctx) return;
  const ahora = M.ctx.currentTime;
  const hasta = ahora + (oculto() ? ANTICIPO_OCULTO : ANTICIPO);
  instancias = instancias.filter(inst => !(inst.saliendo && ahora > inst.finEn));
  for (const inst of instancias) if (!inst.saliendo || ahora < inst.finEn) inst.planificar(Math.min(hasta, inst.finEn));
  if (!instancias.some(i => i.vivo) && reloj) { clearInterval(reloj); reloj = null; }
}

export function cambiarMusica(modo) {
  if (!M.ctx) return;
  if (modo !== null && modo !== undefined && !PIEZAS[modo]) return;   // modo desconocido: se ignora
  modo = modo || null;
  if (modo === modoActual) return;
  modoActual = modo;
  const salida = modo === 'victoria' ? 1.0 : FUNDIDO;
  for (const inst of instancias) inst.salir(salida);
  if (modo) instancias.push(new Instancia(modo, PIEZAS[modo], modo === 'victoria' ? 0.08 : FUNDIDO));
  if (!reloj && instancias.length) reloj = setInterval(tick, TICK_MS);
  tick();
}

export function musicaActual() { return modoActual; }
