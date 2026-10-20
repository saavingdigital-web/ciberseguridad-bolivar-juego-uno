// CiberDetective · INTERFAZ (entrada única). Contrato: ARQUITECTURA.md, sección 5.
// Capa DOM sobre el canvas 3D. #interfaz tiene pointer-events:none; los paneles lo reactivan.
import { aplicarTexturas } from './texturas.js';
import { instalarDefsGrabado } from './iconos.js';
import { crearCapas } from './capas.js';
import { crearHUD, crearTooltip } from './hud.js';
import * as P from './pantallas.js';
import { investigacion as abrirTablero } from './investigacion.js';
import { precargarMarca } from './marca.js';

export function crearInterfaz({ raiz, datos } = {}) {
  if (!raiz) throw new Error('crearInterfaz: falta el elemento raíz');
  precargarMarca();            // logo y escudo de la Secretaría: sin parpadeo
  aplicarTexturas(document.documentElement);
  instalarDefsGrabado();       // degradado dorado compartido por los iconos grabados
  raiz.classList.add('cd-raiz');
  raiz.setAttribute('lang', 'es');

  // ---------- Eventos ----------
  const oyentes = new Map();
  const emitir = (evento, datosEv) => {
    for (const fn of oyentes.get(evento) || []) {
      try { fn(datosEv); } catch (e) { console.error(`[interfaz] error en el oyente de '${evento}'`, e); }
    }
  };

  const capas = crearCapas(raiz);
  const tooltip = crearTooltip(raiz);
  let enPartida = false;     // HUD activo y pausa permitida
  let pausado = false;

  const hud = crearHUD({ raiz, datos, emitir, tooltip, alMenu: () => abrirPausa() });
  const carga = P.crearCarga({ capas, datos });
  const c = { capas, datos, hud, tooltip };

  // Mientras haya un modal abierto, el HUD queda inerte (sin foco ni clics).
  const conModal = async promesa => {
    tooltip.ocultar();
    hud.el.classList.add('cd-tras-modal');
    try { return await promesa; }
    finally { if (!capas.hay()) hud.el.classList.remove('cd-tras-modal'); }
  };

  async function abrirPausa() {
    if (!enPartida || pausado || capas.hay()) return;
    pausado = true;
    emitir('pausa', { pausado: true });
    await conModal(P.pausa(c));
    pausado = false;
    emitir('pausa', { pausado: false });
  }

  // ---------- Teclado (fase de captura: tiene prioridad sobre la cámara del mundo) ----------
  window.addEventListener('keydown', ev => {
    const tope = capas.tope();
    if (tope) {
      if (!capas.atraparFoco(ev)) tope.alTecla?.(ev);
      ev.stopPropagation();          // con un modal abierto, la cámara no se mueve
      return;
    }
    if (!enPartida) return;
    const t = ev.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (ev.key === 'Escape') {
      ev.preventDefault(); ev.stopPropagation();
      abrirPausa();
      return;
    }
    if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) return;
    if (hud.atajo(ev)) { ev.preventDefault(); ev.stopPropagation(); }
  }, true);

  window.addEventListener('resize', () => tooltip.ocultar());

  // ---------- API pública (contrato) ----------
  const ui = {
    pantallaCarga(progreso, texto) { carga.progreso(progreso, texto); },
    ocultarCarga() { carga.ocultar(); },

    async menuPrincipal() {
      enPartida = false;
      hud.mostrar(false);
      await P.menuPrincipal(c);
      return 'jugar';
    },

    async intro(paginas) {
      hud.mostrar(false);
      await P.intro(c, paginas);
      enPartida = true;
      hud.mostrar(true);
    },

    recursos(r) {
      hud.recursos(r || {});
      if (!enPartida && !capas.hay() && !hud.visible) { enPartida = true; hud.mostrar(true); }
    },
    era(eraObj) { hud.era(eraObj); },
    reloj(segundos) { hud.reloj(segundos); },
    seleccion(info) { hud.seleccion(info); },
    notificar(n) { hud.notificar(n || {}); },
    casosActivos(lista) { hud.casosActivos(lista); },

    investigacion(caso, ctx) { return conModal(abrirTablero(c, caso, ctx)); },
    escudoTactico(caso, resultado) { return conModal(P.escudoTactico(c, caso, resultado)); },
    laboratorio(tecnologias, ctx) { return conModal(P.laboratorio(c, tecnologias, ctx)); },
    avanzarEra(eraSiguiente, ctx) { return conModal(P.avanzarEra(c, eraSiguiente, ctx)); },

    minimapa(datosMinimapa, extra) {
      if (!hud.visible) return;      // barato: no dibuja si el HUD no se ve
      hud.minimapa(datosMinimapa, extra);
    },

    final(estadisticas) {
      enPartida = false;
      return conModal(P.final(c, estadisticas || {}));
    },

    al(evento, fn) {
      if (typeof fn !== 'function') return () => {};
      if (!oyentes.has(evento)) oyentes.set(evento, new Set());
      oyentes.get(evento).add(fn);
      return () => oyentes.get(evento)?.delete(fn);
    }
  };
  return ui;
}
