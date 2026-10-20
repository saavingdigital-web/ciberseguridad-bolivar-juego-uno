// CiberDetective · HUD de partida: barra superior, panel inferior (minimapa, selección, acciones),
// lista lateral de casos, notificaciones y tooltip.
import { selloHUD } from './marca.js';
import { h, ico, vaciar, arr, txt, numero, fmt, tiempo, romano, retrato, retratoSvg, esImagen, destello, indicarScroll } from './util.js';
import { ICONOS, emblemaEra, grabado, claveAccion, retratoEdificio } from './iconos.js';
import { retratoDetective, retratoPersona } from './retratos.js';
import { crearMinimapa } from './minimapa.js';

// ---------- Tooltip compartido ----------
export function crearTooltip(raiz) {
  const el = h('div', { class: 'cd-tooltip', role: 'tooltip', id: 'cd-tooltip', 'aria-hidden': 'true' });
  raiz.append(el);
  let ancla = null;
  function colocar() {
    if (!ancla || !document.contains(ancla)) return ocultar();
    const r = ancla.getBoundingClientRect();
    const t = el.getBoundingClientRect();
    const m = 10;
    let x = r.left + r.width / 2 - t.width / 2;
    let y = r.top - t.height - m;
    if (y < 8) y = r.bottom + m;
    x = Math.max(8, Math.min(window.innerWidth - t.width - 8, x));
    y = Math.max(8, Math.min(window.innerHeight - t.height - 8, y));
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }
  function mostrar(a, contenido) {
    ancla = a;
    vaciar(el).append(contenido);
    el.classList.add('cd-visible');
    el.setAttribute('aria-hidden', 'false');
    colocar();
  }
  function ocultar() {
    ancla = null;
    el.classList.remove('cd-visible');
    el.setAttribute('aria-hidden', 'true');
  }
  /** Conecta hover y foco de un elemento a un generador de contenido. */
  function enlazar(elemento, generar) {
    const on = () => { const c = generar(); if (c) mostrar(elemento, c); };
    elemento.addEventListener('mouseenter', on);
    elemento.addEventListener('focus', on);
    elemento.addEventListener('mouseleave', ocultar);
    elemento.addEventListener('blur', ocultar);
  }
  return { mostrar, ocultar, enlazar, refrescar: colocar, get ancla() { return ancla; } };
}

// ---------- Costos ----------
const RECURSO_ICONO = { confianza: ICONOS.confianza, energia: ICONOS.energia, presupuesto: ICONOS.presupuesto, evidencia: ICONOS.evidencia };
const RECURSO_NOMBRE = { confianza: 'Confianza', energia: 'Energía', presupuesto: 'Presupuesto', evidencia: 'Evidencia', casos: 'Casos resueltos' };

// Quita emoji de los textos que llegan de main.js (⚠, 🛡…): la interfaz usa iconos propios.
const sinEmoji = v => Array.from(txt(v)).filter(c => {
  const p = c.codePointAt(0);
  return !((p >= 0x1F300 && p <= 0x1FAFF) || (p >= 0x2600 && p <= 0x27BF) || p === 0xFE0F || p === 0x200D);
}).join('').trim();

export function nodoCosto(costo, recursos = null, { casosResueltos = null } = {}) {
  if (!costo || typeof costo !== 'object') return null;
  const partes = [];
  for (const k of ['casos', 'confianza', 'energia', 'presupuesto', 'evidencia']) {
    const v = numero(costo[k]);
    if (!v) continue;
    let falta = false;
    if (k === 'casos') falta = casosResueltos != null && casosResueltos < v;
    else if (recursos && recursos[k] != null) falta = numero(recursos[k]) < v;
    partes.push(h('span', { class: `cd-costo-item ${falta ? 'cd-falta' : ''}`, title: RECURSO_NOMBRE[k] },
      k === 'casos' ? ico(ICONOS.carpeta, 'cd-ico-casos') : ico(RECURSO_ICONO[k]),
      h('span', { text: k === 'casos' ? `${v} casos` : fmt(v) })));
  }
  return partes.length ? h('span', { class: 'cd-costo' }, partes) : null;
}

// ---------- HUD ----------
export function crearHUD({ raiz, datos, emitir, tooltip, alMenu }) {
  const estado = {
    recursos: { confianza: 0, energia: 0, energiaMax: 100, presupuesto: 0, evidencia: 0 },
    eraN: 1,
    seleccion: null,
    acciones: [],
    firmaAcciones: '',
    casos: new Map(),
    plazoMax: new Map()
  };
  const eras = () => arr(datos?.ERAS);
  const eraSiguiente = () => eras().find(e => e.n === estado.eraN + 1);

  const el = h('div', { class: 'cd-hud cd-oculto', 'aria-hidden': 'true' });
  el.addEventListener('contextmenu', e => e.preventDefault());

  // ===== Barra superior =====
  const recursosEl = {};
  const DESCRIPCION = {
    confianza: 'Confianza ciudadana en la Central. Baja si los casos vencen o fallas una investigación. Si llega a 0, la partida termina.',
    energia: 'Energía del equipo forense. Se gasta al analizar evidencias y se recarga con el tiempo.',
    presupuesto: 'Fondos de la Central. Se usan para investigar tecnologías y avanzar de era.',
    evidencia: 'Evidencia digital acumulada al resolver casos. Requisito para tecnologías y eras.'
  };
  const bloqueRecurso = clave => {
    const valor = h('span', { class: 'cd-rec-valor cd-num', text: '0' });
    const barra = h('i');
    const nodo = h('div', { class: `cd-recurso cd-rec-${clave}`, tabindex: '0', 'aria-label': RECURSO_NOMBRE[clave] },
      h('span', { class: 'cd-rec-zocalo' }, ico(RECURSO_ICONO[clave], 'cd-rec-ico')),
      h('span', { class: 'cd-rec-cuerpo' },
        h('span', { class: 'cd-rec-fila' }, valor, h('span', { class: 'cd-rec-nombre', text: RECURSO_NOMBRE[clave] })),
        h('span', { class: 'cd-rec-barra' }, barra)));
    recursosEl[clave] = { nodo, valor, barra, mostrado: null };
    tooltip.enlazar(nodo, () => contenidoTooltipRecurso(clave));
    return nodo;
  };
  function contenidoTooltipRecurso(clave) {
    const r = estado.recursos;
    const sig = eraSiguiente();
    let extra = null;
    if (clave === 'energia') extra = `${fmt(Math.floor(r.energia))} de ${fmt(r.energiaMax)}`;
    else if (clave === 'confianza') extra = `${fmt(Math.floor(r.confianza))} de 100`;
    else if (sig && numero(sig.requisito?.[clave])) extra = `Próxima era (${txt(sig.nombre)}): ${fmt(sig.requisito[clave])}`;
    return h('div', { class: 'cd-tt' },
      h('div', { class: 'cd-tt-titulo' }, ico(RECURSO_ICONO[clave]), RECURSO_NOMBRE[clave]),
      h('p', { class: 'cd-tt-texto', text: DESCRIPCION[clave] }),
      extra ? h('div', { class: 'cd-tt-pie', text: extra }) : null);
  }

  const eraEmblema = h('span', { class: 'cd-era-emblema', html: emblemaEra(1, '#00e5ff', 50) });
  const eraNumero = h('span', { class: 'cd-era-numero', text: 'ERA I' });
  const eraNombre = h('span', { class: 'cd-era-nombre', text: '' });
  const eraSub = h('span', { class: 'cd-era-sub', text: '' });
  const eraEl = h('div', { class: 'cd-era', tabindex: '0', 'aria-live': 'polite' },
    eraEmblema, h('span', { class: 'cd-era-textos' }, eraNumero, eraNombre, eraSub));
  tooltip.enlazar(eraEl, () => {
    const e = eras().find(x => x.n === estado.eraN);
    const sig = eraSiguiente();
    return h('div', { class: 'cd-tt' },
      h('div', { class: 'cd-tt-titulo', text: `Era ${romano(estado.eraN)} · ${txt(e?.nombre)}` }),
      e?.descripcion ? h('p', { class: 'cd-tt-texto', text: e.descripcion }) : null,
      h('div', { class: 'cd-tt-pie', text: sig ? `Siguiente: ${txt(sig.nombre)}. Avanza desde la Central de Ciberpolicía.` : 'Has alcanzado la era máxima.' }));
  });

  const relojValor = h('span', { class: 'cd-reloj-valor cd-num', text: '00:00' });
  const reloj = h('div', { class: 'cd-reloj', title: 'Tiempo de juego' }, ico(ICONOS.reloj), relojValor);
  const btnMenu = h('button', { class: 'cd-btn-menu', type: 'button', 'aria-label': 'Abrir menú de pausa (Esc)', onclick: () => alMenu() },
    ico(ICONOS.pausa), h('span', { text: 'Menú' }));
  tooltip.enlazar(btnMenu, () => h('div', { class: 'cd-tt' }, h('div', { class: 'cd-tt-titulo', text: 'Menú de pausa' }), h('div', { class: 'cd-tt-pie' }, h('kbd', { text: 'Esc' }))));

  const barraSup = h('header', { class: 'cd-barra-sup cd-metal' },
    h('div', { class: 'cd-recursos' }, selloHUD(), ['confianza', 'energia', 'presupuesto', 'evidencia'].map(bloqueRecurso)),
    eraEl,
    h('div', { class: 'cd-sup-der' }, reloj, btnMenu));

  // ===== Lista lateral de casos =====
  const casosLista = h('div', { class: 'cd-casos-lista', role: 'list' });
  const casosCuenta = h('span', { class: 'cd-casos-cuenta', text: '0' });
  const casosVacio = h('div', { class: 'cd-casos-vacio' }, ico(ICONOS.escudo), h('span', { text: 'Sin incidentes. La ciudad está tranquila.' }));
  let plegado = false;
  try { plegado = localStorage.getItem('cd-casos-plegado') === '1'; } catch { /* sin almacenamiento */ }
  const btnPlegar = h('button', { class: 'cd-casos-plegar', type: 'button', 'aria-expanded': String(!plegado), 'aria-label': 'Mostrar u ocultar la lista de incidentes' },
    h('span', { class: 'cd-casos-chev', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' }));
  const casosEl = h('aside', { class: 'cd-casos cd-vidrio', 'aria-label': 'Incidentes activos' },
    h('div', { class: 'cd-casos-cab' }, ico(ICONOS.alerta), h('span', { class: 'cd-casos-titulo', text: 'Incidentes' }), casosCuenta, btnPlegar),
    casosVacio, casosLista);
  const aplicarPlegado = () => {
    casosEl.classList.toggle('cd-plegado', plegado);
    btnPlegar.setAttribute('aria-expanded', String(!plegado));
    try { localStorage.setItem('cd-casos-plegado', plegado ? '1' : '0'); } catch { /* opcional */ }
  };
  btnPlegar.addEventListener('click', () => { plegado = !plegado; aplicarPlegado(); });
  casosEl.classList.toggle('cd-plegado', plegado);

  // ===== Panel inferior =====
  const mmCont = h('div', { class: 'cd-mm' });
  const mmMarco = h('div', { class: 'cd-mm-marco' },
    mmCont,
    h('div', { class: 'cd-mm-leyenda', 'aria-hidden': 'true' },
      h('span', { class: 'cd-ley cd-ley-alerta', text: 'Alerta' }),
      h('span', { class: 'cd-ley cd-ley-seguro', text: 'Asegurado' }),
      h('span', { class: 'cd-ley cd-ley-det', text: 'Detective' })));
  indicarScroll(casosLista);
  const minimapa = crearMinimapa(mmCont, p => emitir('minimapa', p));

  const selRetrato = h('div', { class: 'cd-sel-retrato' });
  const selNombre = h('div', { class: 'cd-sel-nombre' });
  const selSub = h('div', { class: 'cd-sel-sub' });
  const selEstado = h('div', { class: 'cd-sel-estado' });
  const selDesc = h('p', { class: 'cd-sel-desc' });
  const selInfo = h('div', { class: 'cd-sel-info' }, selNombre, selSub, selEstado, selDesc);
  const selVacia = h('div', { class: 'cd-sel-vacia' },
    h('div', { class: 'cd-sel-vacia-ico', 'aria-hidden': 'true', html: ICONOS.lupa }),
    h('div', { class: 'cd-sel-vacia-titulo', text: 'Sin selección' }),
    h('p', { text: 'Haz clic en la detective o en un edificio. Con la detective seleccionada, clic derecho sobre un edificio con alerta para investigar.' }));
  const selEl = h('section', { class: 'cd-sel cd-vacia', 'aria-live': 'polite', 'aria-label': 'Selección actual' },
    h('div', { class: 'cd-sel-marco-retrato' }, selRetrato), selInfo, selVacia);

  const accionesGrid = h('div', { class: 'cd-acciones-grid', role: 'toolbar', 'aria-label': 'Acciones' });
  const accionesEl = h('section', { class: 'cd-acciones' }, accionesGrid);
  const RANURAS = 10;     // rejilla de 5×2 como el panel de órdenes de AoE2

  const panelInf = h('footer', { class: 'cd-panel-inf cd-metal' },
    mmMarco,
    h('div', { class: 'cd-panel-centro' }, selEl),
    accionesEl);

  el.append(barraSup, casosEl, panelInf);

  // ===== Notificaciones =====
  const toasts = h('div', { class: 'cd-toasts', 'aria-live': 'polite' });

  raiz.append(el, toasts);

  // ---------- Recursos ----------
  function pintarRecurso(clave, valor, ratio, extraClase) {
    const r = recursosEl[clave];
    const entero = Math.floor(numero(valor));
    if (r.mostrado !== null) {
      const delta = entero - r.mostrado;
      if (Math.abs(delta) >= 3) flotarDelta(r.nodo, delta);
    }
    if (r.mostrado !== entero) {
      r.valor.textContent = clave === 'energia' ? `${fmt(entero)}/${fmt(estado.recursos.energiaMax)}` : fmt(entero);
      r.mostrado = entero;
    } else if (clave === 'energia') {
      r.valor.textContent = `${fmt(entero)}/${fmt(estado.recursos.energiaMax)}`;
    }
    r.barra.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    r.nodo.dataset.nivel = extraClase || '';
  }
  function flotarDelta(nodo, delta) {
    const d = h('span', { class: `cd-delta ${delta > 0 ? 'cd-pos' : 'cd-neg'}`, 'aria-hidden': 'true', text: `${delta > 0 ? '+' : '−'}${fmt(Math.abs(delta))}` });
    nodo.append(d);
    destello(nodo, delta > 0 ? 'cd-sube' : 'cd-baja', 900);
    setTimeout(() => d.remove(), 1500);
  }
  function recursos(r = {}) {
    Object.assign(estado.recursos, Object.fromEntries(Object.entries(r).filter(([, v]) => v != null)));
    const R = estado.recursos;
    const sig = eraSiguiente();
    const conf = numero(R.confianza);
    pintarRecurso('confianza', conf, conf / 100, conf >= 60 ? 'alto' : conf >= 35 ? 'medio' : 'bajo');
    pintarRecurso('energia', R.energia, numero(R.energia) / Math.max(1, numero(R.energiaMax)), numero(R.energia) < 15 ? 'bajo' : '');
    const rp = numero(sig?.requisito?.presupuesto), re = numero(sig?.requisito?.evidencia);
    pintarRecurso('presupuesto', R.presupuesto, rp ? numero(R.presupuesto) / rp : 1, rp && numero(R.presupuesto) >= rp ? 'listo' : '');
    pintarRecurso('evidencia', R.evidencia, re ? numero(R.evidencia) / re : 1, re && numero(R.evidencia) >= re ? 'listo' : '');
    if (tooltip.ancla && el.contains(tooltip.ancla)) refrescarTooltipAccion();
  }

  // ---------- Era ----------
  function era(e) {
    if (!e) return;
    const n = numero(e.n) || 1;
    const cambio = n !== estado.eraN;
    estado.eraN = n;
    const color = txt(e.color, '#00e5ff');
    eraEl.style.setProperty('--era-color', color);
    eraEmblema.innerHTML = emblemaEra(n, color, 50);
    eraNumero.textContent = `ERA ${romano(n)}`;
    eraNombre.textContent = txt(e.nombre);
    eraSub.textContent = txt(e.subtitulo);
    if (cambio) destello(eraEl, 'cd-era-cambio', 1600);
    recursos({});
  }

  function setReloj(s) { relojValor.textContent = tiempo(s); }

  // ---------- Selección ----------
  function seleccion(info) {
    estado.seleccion = info || null;
    if (!info) {
      selEl.classList.add('cd-vacia');
      selEl.dataset.tipo = '';
      estado.acciones = [];
      estado.firmaAcciones = '';
      pintarAcciones();
      return;
    }
    selEl.classList.remove('cd-vacia');
    const nuevo = selEl.dataset.id !== txt(info.id);
    selEl.dataset.id = txt(info.id);
    selEl.dataset.tipo = txt(info.tipo);
    if (nuevo || selRetrato.dataset.valor !== txt(info.retrato)) {
      // Retrato vectorial propio: la detective, la persona o el emblema del edificio (el emoji de main/datos solo orienta).
      let nodo;
      if (esImagen(info.retrato)) nodo = retrato(info.retrato, 'cd-retrato', txt(info.nombre));
      else if (info.tipo === 'detective' || info.id === 'detective') nodo = retratoSvg(retratoDetective({ nombre: info.nombre }));
      else if (info.tipo === 'persona') nodo = retratoSvg(retratoPersona({ nombre: info.nombre, retrato: info.retrato }));
      else nodo = retratoSvg(retratoEdificio(txt(info.id), info.retrato));
      vaciar(selRetrato).append(nodo);
      selRetrato.dataset.valor = txt(info.retrato);
    }
    selNombre.textContent = txt(info.nombre);
    selSub.textContent = txt(info.subtitulo);
    selEstado.textContent = sinEmoji(info.estado);
    selEstado.hidden = !info.estado;
    selEstado.classList.toggle('cd-urgente', /incidente activo|⚠/i.test(txt(info.estado)));
    selDesc.textContent = sinEmoji(info.descripcion);
    if (nuevo) destello(selEl, 'cd-sel-entra', 500);

    const acciones = arr(info.acciones).filter(Boolean);
    const firma = JSON.stringify(acciones.map(a => [a.id, a.etiqueta, a.icono, a.atajo, !!a.deshabilitado, a.costo]));
    estado.acciones = acciones;
    if (firma !== estado.firmaAcciones) {
      estado.firmaAcciones = firma;
      pintarAcciones();
    } else {
      refrescarTooltipAccion();
    }
  }

  function pintarAcciones() {
    const enfocada = document.activeElement?.closest?.('.cd-accion')?.dataset.id;
    tooltip.ancla && accionesGrid.contains(tooltip.ancla) && tooltip.ocultar();
    vaciar(accionesGrid);
    const lista = estado.acciones.slice(0, RANURAS);
    lista.forEach(a => {
      const b = h('button', {
        class: `cd-accion ${a.deshabilitado ? 'cd-deshabilitada' : ''}`, type: 'button',
        'aria-disabled': a.deshabilitado ? 'true' : 'false',
        'aria-label': `${txt(a.etiqueta)}${a.atajo ? ` (atajo ${a.atajo})` : ''}`,
        'aria-describedby': 'cd-tooltip',
        dataset: { id: txt(a.id) }
      },
      grabado(claveAccion(a, datos?.CASOS), 'cd-accion-ico'),
      String(a.id).startsWith('investigar') ? grabado('lupa', 'cd-accion-insignia') : null,
      a.atajo ? h('kbd', { class: 'cd-accion-atajo', text: txt(a.atajo).toUpperCase() }) : null);
      b.addEventListener('click', () => disparar(a, b));
      tooltip.enlazar(b, () => contenidoTooltipAccion(a));
      accionesGrid.append(b);
    });
    for (let i = lista.length; i < RANURAS; i++) accionesGrid.append(h('span', { class: 'cd-ranura', 'aria-hidden': 'true' }));
    if (enfocada) accionesGrid.querySelector(`.cd-accion[data-id="${CSS.escape(enfocada)}"]`)?.focus({ preventScroll: true });
  }

  function contenidoTooltipAccion(a) {
    const esEra = a.id === 'avanzar-era';
    return h('div', { class: 'cd-tt' },
      h('div', { class: 'cd-tt-titulo' },
        grabado(claveAccion(a, datos?.CASOS), 'cd-tt-icono'), txt(a.etiqueta),
        a.atajo ? h('kbd', { text: txt(a.atajo).toUpperCase() }) : null),
      a.tooltip ? h('p', { class: 'cd-tt-texto', text: txt(a.tooltip) }) : null,
      a.costo ? h('div', { class: 'cd-tt-costo' }, h('span', { class: 'cd-tt-etq', text: esEra ? 'Requisitos' : 'Costo' }), nodoCosto(a.costo, estado.recursos)) : null,
      a.deshabilitado ? h('div', { class: 'cd-tt-aviso' }, ico(ICONOS.candado), 'No disponible en este momento') : null);
  }
  function refrescarTooltipAccion() {
    const anc = tooltip.ancla;
    if (!anc) return;
    if (anc.classList?.contains('cd-accion')) {
      const a = estado.acciones.find(x => txt(x.id) === anc.dataset.id);
      if (a) tooltip.mostrar(anc, contenidoTooltipAccion(a));
    }
  }

  function disparar(a, boton) {
    if (a.deshabilitado) { destello(boton, 'cd-denegado', 400); return; }
    destello(boton, 'cd-presionado', 220);
    emitir('accion', { id: a.id, contexto: { tipo: estado.seleccion?.tipo, id: estado.seleccion?.id } });
  }

  /** Atajo de teclado de las acciones. Devuelve true si la tecla se usó. */
  function atajo(ev) {
    if (el.classList.contains('cd-oculto')) return false;
    const k = (ev.key || '').toUpperCase();
    const codigo = /^Digit(\d)$/.exec(ev.code || '')?.[1];
    const a = estado.acciones.find(x => x.atajo && (txt(x.atajo).toUpperCase() === k || (codigo && txt(x.atajo) === codigo)));
    if (!a) return false;
    const b = accionesGrid.querySelector(`.cd-accion[data-id="${CSS.escape(txt(a.id))}"]`);
    disparar(a, b);
    return true;
  }

  // ---------- Casos ----------
  function casosActivos(lista) {
    const vistos = new Set();
    arr(lista).forEach((c, i) => {
      if (!c || c.id == null) return;
      const id = txt(c.id);
      vistos.add(id);
      const t = Math.max(0, numero(c.tiempoRestante));
      const max = Math.max(estado.plazoMax.get(id) || 0, t, 1);
      estado.plazoMax.set(id, max);
      let item = estado.casos.get(id);
      if (!item) {
        const tiempoEl = h('span', { class: 'cd-caso-tiempo cd-num' });
        const barra = h('i');
        const titulo = h('span', { class: 'cd-caso-titulo' });
        const edif = h('span', { class: 'cd-caso-edificio' });
        const urg = h('span', { class: 'cd-caso-urgencia' });
        const nodo = h('button', { class: 'cd-caso cd-entra', type: 'button', role: 'listitem', onclick: () => emitir('caso', { id: c.id }) },
          h('span', { class: 'cd-caso-baliza', 'aria-hidden': 'true' }),
          h('span', { class: 'cd-caso-cuerpo' },
            h('span', { class: 'cd-caso-fila' }, urg, titulo),
            h('span', { class: 'cd-caso-fila cd-sec' }, edif, tiempoEl),
            h('span', { class: 'cd-caso-barra' }, barra)));
        item = { nodo, tiempoEl, barra, titulo, edif, urg };
        estado.casos.set(id, item);
        setTimeout(() => nodo.classList.remove('cd-entra'), 600);
      }
      if (casosLista.children[i] !== item.nodo) casosLista.insertBefore(item.nodo, casosLista.children[i] || null);
      const alta = c.urgencia === 'alta';
      const vencido = t <= 0;
      item.nodo.classList.toggle('cd-alta', alta);
      item.nodo.classList.toggle('cd-vencido', vencido);
      item.nodo.classList.toggle('cd-critico', !vencido && t <= 30);
      item.titulo.textContent = txt(c.titulo, 'Incidente');
      item.edif.textContent = txt(c.edificio);
      item.urg.textContent = alta ? 'Alta' : 'Media';
      item.tiempoEl.textContent = vencido ? 'Vencido' : tiempo(t);
      item.barra.style.transform = `scaleX(${vencido ? 1 : t / max})`;
      item.nodo.setAttribute('title', `${txt(c.titulo)} · ${txt(c.edificio)}`);
      item.nodo.setAttribute('aria-label', `${txt(c.titulo)} en ${txt(c.edificio)}, urgencia ${alta ? 'alta' : 'media'}, ${vencido ? 'plazo vencido' : `quedan ${tiempo(t)}`}. Ir al edificio.`);
    });
    for (const [id, item] of estado.casos) {
      if (vistos.has(id)) continue;
      estado.casos.delete(id);
      estado.plazoMax.delete(id);
      item.nodo.classList.add('cd-sale');
      setTimeout(() => item.nodo.remove(), 420);
    }
    casosCuenta.textContent = String(vistos.size);
    casosEl.classList.toggle('cd-sin-casos', vistos.size === 0);
  }

  // ---------- Notificaciones ----------
  const ICONO_TOAST = { alerta: ICONOS.alerta, info: ICONOS.info, exito: ICONOS.exito, error: ICONOS.error };
  function notificar({ titulo, texto, tipo = 'info', accion } = {}) {
    const t = ICONO_TOAST[tipo] ? tipo : 'info';
    const dur = t === 'alerta' || t === 'error' ? 5800 : accion ? 5500 : 4200;
    const toast = h('div', { class: `cd-toast cd-toast-${t}`, role: t === 'alerta' || t === 'error' ? 'alert' : 'status', vars: { '--dur': `${dur}ms` } });
    let restante = dur, inicio = performance.now(), id = 0, cerrado = false;
    const cerrar = () => {
      if (cerrado) return;
      cerrado = true;
      clearTimeout(id);
      toast.classList.add('cd-sale');
      setTimeout(() => toast.remove(), 380);
    };
    const programar = () => { inicio = performance.now(); id = setTimeout(cerrar, restante); };
    toast.addEventListener('mouseenter', () => { clearTimeout(id); restante -= performance.now() - inicio; toast.classList.add('cd-pausado'); });
    toast.addEventListener('mouseleave', () => { toast.classList.remove('cd-pausado'); programar(); });
    toast.append(
      h('span', { class: 'cd-toast-ico' }, ico(ICONO_TOAST[t])),
      h('div', { class: 'cd-toast-cuerpo' },
        titulo ? h('div', { class: 'cd-toast-titulo', text: txt(titulo) }) : null,
        texto ? h('div', { class: 'cd-toast-texto', text: txt(texto) }) : null,
        accion && typeof accion.fn === 'function' ? h('button', {
          class: 'cd-toast-accion', type: 'button',
          onclick: () => { try { accion.fn(); } finally { cerrar(); } }
        }, txt(accion.etiqueta, 'Ver'), ico(ICONOS.flecha)) : null),
      h('button', { class: 'cd-toast-cerrar', type: 'button', 'aria-label': 'Cerrar notificación', onclick: cerrar }, ico(ICONOS.cerrar)),
      h('span', { class: 'cd-toast-vida', 'aria-hidden': 'true' }));
    toasts.prepend(toast);
    const max = 2;
    const vivos = [...toasts.querySelectorAll('.cd-toast:not(.cd-sale)')];
    vivos.slice(max).forEach(x => { x.classList.add('cd-sale'); setTimeout(() => x.remove(), 380); });
    programar();
  }

  function mostrar(si) {
    el.classList.toggle('cd-oculto', !si);
    el.setAttribute('aria-hidden', si ? 'false' : 'true');
    if (si) { minimapa.medir(); seleccion(estado.seleccion); }
    else tooltip.ocultar();
  }

  seleccion(null);
  casosActivos([]);

  return {
    el,
    mostrar,
    get visible() { return !el.classList.contains('cd-oculto'); },
    recursos, era, reloj: setReloj, seleccion, casosActivos, notificar, atajo,
    minimapa: (d, extra) => minimapa.dibujar(d, extra || {}),
    get recursosActuales() { return { ...estado.recursos }; },
    get eraN() { return estado.eraN; }
  };
}
