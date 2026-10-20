// CiberDetective · gestor de capas modales (pila, foco atrapado y teclado)
import { h, enfocables } from './util.js';

export function crearCapas(raiz) {
  const pila = [];

  /**
   * Abre una capa a pantalla completa.
   * @param {object} o  clase, etiqueta (aria), alTecla(ev) opcional
   */
  function abrir({ clase = '', etiqueta = '', alTecla = null } = {}) {
    const previo = document.activeElement;
    const el = h('div', { class: `cd-capa ${clase}`.trim(), role: 'dialog', 'aria-modal': 'true', 'aria-label': etiqueta });
    el.addEventListener('contextmenu', e => e.preventDefault());
    raiz.append(el);
    let cerrada = false;
    const capa = {
      el, alTecla,
      cerrar(ms = 280) {
        if (cerrada) return Promise.resolve();
        cerrada = true;
        const i = pila.indexOf(capa);
        if (i >= 0) pila.splice(i, 1);
        el.classList.remove('cd-visible');
        el.classList.add('cd-saliendo');
        el.setAttribute('inert', '');
        try { if (previo && document.contains(previo)) previo.focus({ preventScroll: true }); } catch { /* foco opcional */ }
        return new Promise(r => setTimeout(() => { el.remove(); r(); }, ms));
      },
      enfocar() {
        const f = el.querySelector('[data-autofoco]') || enfocables(el)[0];
        f?.focus({ preventScroll: true });
      }
    };
    pila.push(capa);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('cd-visible')));
    return capa;
  }

  const tope = () => pila[pila.length - 1] || null;

  /** Mantiene el Tab dentro de la capa superior. */
  function atraparFoco(ev) {
    const c = tope();
    if (!c || ev.key !== 'Tab') return false;
    const f = enfocables(c.el);
    if (!f.length) { ev.preventDefault(); return true; }
    const i = f.indexOf(document.activeElement);
    let j = ev.shiftKey ? i - 1 : i + 1;
    if (i === -1) j = ev.shiftKey ? f.length - 1 : 0;
    if (j < 0) j = f.length - 1;
    if (j >= f.length) j = 0;
    ev.preventDefault();
    f[j].focus();
    return true;
  }

  return { abrir, tope, hay: () => pila.length > 0, atraparFoco };
}
