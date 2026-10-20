// CiberDetective · utilidades DOM de la interfaz
// Todo el texto de datos se inserta con textContent (nunca innerHTML) salvo los SVG propios.

export function h(tag, props, ...hijos) {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;            // solo para SVG propios
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'vars' && typeof v === 'object') for (const [n, x] of Object.entries(v)) el.style.setProperty(n, x);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
  }
  agregar(el, hijos);
  return el;
}

export function agregar(el, hijos) {
  for (const c of [hijos].flat(Infinity)) {
    if (c == null || c === false || c === '') continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function vaciar(el) { while (el.firstChild) el.firstChild.remove(); return el; }

/** Icono SVG propio (markup de confianza, generado en iconos.js). */
export function ico(markup, clase = '') {
  return h('span', { class: `cd-ico ${clase}`.trim(), 'aria-hidden': 'true', html: markup });
}

export const arr = v => Array.isArray(v) ? v : (v == null ? [] : [v]);
export const txt = (v, d = '') => (v == null || v === '') ? d : String(v);
export const numero = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
export const fmt = n => Math.round(numero(n)).toLocaleString('es-CO');
export const romano = n => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][n] || String(n ?? '');
export const espera = ms => new Promise(r => setTimeout(r, ms));
export const reducirMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function tiempo(seg) {
  const s = Math.max(0, Math.floor(numero(seg)));
  const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = x => String(x).padStart(2, '0');
  return hh ? `${hh}:${p(mm)}:${p(ss)}` : `${p(mm)}:${p(ss)}`;
}

export function esImagen(v) {
  return typeof v === 'string' && /^(https?:|data:image|blob:|\.{0,2}\/)|\.(png|jpe?g|webp|svg|gif|avif)(\?.*)?$/i.test(v.trim());
}

/** Retrato vectorial: recibe el markup SVG generado por retratos.js / iconos.js (contenido propio, de confianza). */
export function retratoSvg(markup, clase = 'cd-retrato') {
  return h('span', { class: `${clase} cd-retrato-vec`, html: markup });
}

/** Retrato: imagen o, si es texto suelto, un respaldo tipográfico (ya no se pintan emoji). */
export function retrato(valor, clase = 'cd-retrato', alt = '') {
  if (esImagen(valor)) return h('img', { class: clase, src: valor, alt, draggable: 'false' });
  const ini = (txt(alt || valor, '?').replace(/[^\p{L}\p{N}]/gu, '')[0] || '?').toUpperCase();
  return h('span', { class: `${clase} cd-retrato-ini`, role: 'img', 'aria-label': alt || 'retrato', text: ini });
}

/** Elementos enfocables dentro de un contenedor. */
export function enfocables(raiz) {
  return [...raiz.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(e => !e.disabled && e.offsetParent !== null && !e.closest('[inert]'));
}

/**
 * Máquina de escribir. Devuelve { completar(), cancelar(), get terminado, promesa }.
 */
export function escribir(el, texto, { vel = 18, alTerminar } = {}) {
  const t = txt(texto);
  let n = 0, terminado = false, id = 0, fin;
  const promesa = new Promise(r => { fin = r; });
  el.classList.add('cd-escribiendo');
  const cerrar = () => {
    if (terminado) return;
    terminado = true;
    cancelAnimationFrame(id);
    el.textContent = t;
    el.classList.remove('cd-escribiendo');
    alTerminar?.();
    fin();
  };
  if (reducirMovimiento() || !t) { cerrar(); }
  else {
    const t0 = performance.now();
    const paso = ahora => {
      if (terminado) return;
      const objetivo = Math.min(t.length, Math.floor((ahora - t0) / vel));
      if (objetivo !== n) { n = objetivo; el.textContent = t.slice(0, n); }
      if (n >= t.length) cerrar(); else id = requestAnimationFrame(paso);
    };
    el.textContent = '';
    id = requestAnimationFrame(paso);
  }
  return {
    completar: cerrar,
    cancelar() { terminado = true; cancelAnimationFrame(id); el.classList.remove('cd-escribiendo'); fin(); },
    get terminado() { return terminado; },
    promesa
  };
}

/** Pulso visual breve (reinicia la animación aunque ya esté activa). */
export function destello(el, clase = 'cd-destello', ms = 700) {
  if (!el) return;
  el.classList.remove(clase);
  void el.offsetWidth;
  el.classList.add(clase);
  clearTimeout(el._destello);
  el._destello = setTimeout(() => el.classList.remove(clase), ms);
}

/**
 * Indicador de scroll: marca con .cd-mas-abajo / .cd-mas-arriba cuando hay más contenido fuera de vista
 * (el CSS lo traduce en un desvanecido en ese borde) y muestra un chevron dorado pulsante "más abajo"
 * que, al pulsarlo, desplaza el contenido. Devuelve una función para desconectarlo.
 */
export function indicarScroll(el, { chevron = true } = {}) {
  if (!el) return () => {};
  let id = 0;
  let chev = null;
  const host = el.offsetParent || el.parentElement;
  if (chevron && host) {
    chev = h('button', {
      class: 'cd-mas-chev', type: 'button', tabindex: '-1', 'aria-label': 'Hay más contenido: desplazar hacia abajo',
      html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    });
    chev.addEventListener('click', () => el.scrollBy({ top: Math.max(120, el.clientHeight * 0.75), behavior: reducirMovimiento() ? 'auto' : 'smooth' }));
    host.append(chev);
  }
  const calcular = () => {
    cancelAnimationFrame(id);
    id = requestAnimationFrame(() => {
      const resto = el.scrollHeight - el.clientHeight - el.scrollTop;
      const abajo = resto > 6;
      el.classList.toggle('cd-mas-abajo', abajo);
      el.classList.toggle('cd-mas-arriba', el.scrollTop > 6);
      if (chev) {
        chev.style.left = `${el.offsetLeft + el.clientWidth / 2 - 15}px`;
        chev.style.top = `${el.offsetTop + el.clientHeight - 40}px`;
        chev.classList.toggle('cd-on', abajo && el.clientHeight > 60);
      }
    });
  };
  el.addEventListener('scroll', calcular, { passive: true });
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(calcular) : null;
  ro?.observe(el);
  const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(calcular) : null;
  mo?.observe(el, { childList: true, subtree: true, characterData: true });
  calcular();
  setTimeout(calcular, 700);          // tras las animaciones de entrada
  setTimeout(calcular, 1500);
  return () => { cancelAnimationFrame(id); el.removeEventListener('scroll', calcular); ro?.disconnect(); mo?.disconnect(); chev?.remove(); };
}
