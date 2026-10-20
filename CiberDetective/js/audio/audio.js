// CiberDetective: Puerto Nexo · Audio (contrato de ARQUITECTURA.md §7)
// 100 % sintetizado con Web Audio API: sin archivos, sin librerías.
//
//   audio.iniciar()          crea/reanuda el AudioContext (tras un gesto del usuario); idempotente
//   audio.volumen(0..1)      volumen general
//   audio.ambiente(activo)   ciudad costera: olas, viento, tráfico lejano, gaviotas, murmullo
//   audio.musica(modo)       'menu' | 'exploracion' | 'tension' | 'investigacion' | 'victoria' | null
//   audio.sfx(nombre)        'click','hover','seleccion','orden','alerta','caso-nuevo','analizar','pista',
//                            'acierto','error','resuelto','era','tecnologia','notificacion','abrir','cerrar'
//
// Antes de iniciar() nada suena ni lanza errores: ambiente y música se recuerdan
// y se aplican al iniciar; los SFX previos se descartan.

import { M, crearMotor, fijarVolumen } from './motor.js';
import { cambiarMusica } from './musica.js';
import { activarAmbiente } from './ambiente.js';
import { SFX, LIMITES, POLIFONIA_TOTAL } from './sfx.js';

const pendiente = { ambiente: false, musica: null };
const sonando = {};      // nombre → [{ ini, fin }]

function listo() {
  return !!(M.ctx && M.ctx.state !== 'closed');
}

function reanudar() {
  try {
    if (M.ctx && M.ctx.state === 'suspended') {
      const p = M.ctx.resume();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  } catch (e) { /* sin audio */ }
}

function puedeSonar(nombre, t) {
  const lim = LIMITES[nombre] || LIMITES._defecto;
  let total = 0;
  for (const k in sonando) {
    sonando[k] = sonando[k].filter(v => v.fin > t);
    total += sonando[k].length;
  }
  const lista = sonando[nombre] || (sonando[nombre] = []);
  if (total >= POLIFONIA_TOTAL && nombre !== 'era' && nombre !== 'caso-nuevo' && nombre !== 'alerta') return false;
  if (lista.length >= lim.max) return false;
  const ultimo = lista[lista.length - 1];
  if (ultimo && t - ultimo.ini < lim.sep) return false;
  return true;
}

export const audio = {
  iniciar() {
    try {
      if (!M.ctx) {
        if (!crearMotor()) return;
        if (pendiente.ambiente) activarAmbiente(true);
        if (pendiente.musica) cambiarMusica(pendiente.musica);
      }
      reanudar();
    } catch (e) { /* el juego sigue sin audio */ }
  },

  volumen(general) {
    try { fijarVolumen(general); } catch (e) { /* nada */ }
  },

  ambiente(activo) {
    pendiente.ambiente = !!activo;
    if (!listo()) return;
    try { activarAmbiente(!!activo); } catch (e) { /* nada */ }
  },

  musica(modo) {
    pendiente.musica = modo || null;
    if (!listo()) return;
    try { cambiarMusica(modo || null); } catch (e) { /* nada */ }
  },

  sfx(nombre) {
    if (!listo()) return;
    const fn = SFX[nombre];
    if (typeof fn !== 'function') return;
    try {
      reanudar();
      const t = M.ctx.currentTime + 0.005;
      if (!puedeSonar(nombre, t)) return;
      const fin = fn(M.bus.sfx, t);
      sonando[nombre].push({ ini: t, fin: typeof fin === 'number' && isFinite(fin) ? fin : t + 0.5 });
    } catch (e) { /* un efecto fallido nunca rompe el juego */ }
  }
};

export default audio;
