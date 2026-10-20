// CiberDetective · TABLERO DE INVESTIGACIÓN (pantalla completa)
// Pizarra de detective: corcho con lámpara, ficha de la víctima (foto ilustrada), evidencias como
// impresiones en papel con chinchetas y cinta, hilo rojo torcido de cada evidencia clave a la pregunta
// activa de la libreta de deducción, y resultado.
import { h, ico, vaciar, arr, txt, numero, fmt, retrato, retratoSvg, esImagen, indicarScroll, escribir, espera, destello, reducirMovimiento } from './util.js';
import { ICONOS, TIPOS_EVIDENCIA, CUADRANTES, nombreEdificio, grabado } from './iconos.js';
import { retratoPersona } from './retratos.js';
import { renderEvidencia } from './evidencias.js';
import { boton, confirmar } from './pantallas.js';

export function investigacion({ capas, datos, hud }, caso = {}, ctx = {}) {
  return new Promise(resolver => {
    const evidencias = arr(caso.evidencias).filter(e => e && e.id != null);
    const preguntas = arr(caso.preguntas).filter(p => p && arr(p.opciones).length);
    const analizadas = new Set();
    const enCurso = new Set();
    const claves = new Set();
    const respuestas = new Map();      // idPregunta → índice de opción
    const tarjetas = new Map();        // idEvidencia → { el, ... }
    let terminado = false;

    const techs = ctx.tecnologias instanceof Set ? ctx.tecnologias : new Set(arr(ctx.tecnologias));
    const techGratis = tipo => arr(datos?.TECNOLOGIAS).find(t =>
      techs.has(t?.id) && t?.efecto?.tipo === 'revelar-tipo' && t.efecto.valor === tipo) || null;
    const energia = () => { try { return numero(typeof ctx.energia === 'function' ? ctx.energia() : hud.recursosActuales.energia); } catch { return 0; } };
    const energiaMax = () => Math.max(1, numero(hud.recursosActuales.energiaMax) || 100);

    let capa;
    capa = capas.abrir({
      clase: 'cd-capa-inv', etiqueta: `Tablero de investigación: ${txt(caso.titulo)}`,
      alTecla: ev => { if (ev.key === 'Escape') { ev.preventDefault(); abandonar(); } }
    });

    // ===== Cabecera =====
    const cuad = CUADRANTES[caso.cuadrante];
    const energiaValor = h('span', { class: 'cd-num', text: '0' });
    const energiaBarra = h('i');
    const energiaEl = h('div', { class: 'cd-inv-energia', title: 'Energía disponible para analizar' },
      ico(ICONOS.energia), h('div', null,
        h('div', { class: 'cd-inv-energia-fila' }, h('span', { class: 'cd-inv-etq', text: 'Energía' }), energiaValor),
        h('span', { class: 'cd-inv-energia-barra' }, energiaBarra)));
    const contadorEl = h('span', { class: 'cd-num', text: `0/${evidencias.length}` });
    const cabecera = h('header', { class: 'cd-inv-cab cd-metal' },
      h('div', { class: 'cd-inv-titulos' },
        h('div', { class: 'cd-inv-etq' }, ico(ICONOS.lupa), 'Tablero de investigación'),
        h('h2', { class: 'cd-inv-titulo', text: txt(caso.titulo, 'Caso sin título') })),
      h('div', { class: 'cd-inv-chips' },
        caso.edificio ? h('span', { class: 'cd-chip' }, grabado('pin'), nombreEdificio(caso.edificio)) : null,
        cuad ? h('span', { class: 'cd-chip cd-chip-cuadrante', dataset: { cuadrante: caso.cuadrante } }, grabado(cuad.icono), cuad.nombre) : null,
        caso.urgencia ? h('span', { class: `cd-chip cd-chip-urgencia ${caso.urgencia === 'alta' ? 'cd-alta' : ''}`, text: caso.urgencia === 'alta' ? 'Urgencia alta' : 'Urgencia media' }) : null),
      h('div', { class: 'cd-inv-medidores' },
        energiaEl,
        h('div', { class: 'cd-inv-contador' }, h('span', { class: 'cd-inv-etq', text: 'Analizadas' }), contadorEl),
        h('button', { class: 'cd-btn cd-btn-fantasma cd-inv-abandonar', type: 'button', onclick: () => abandonar() },
          ico(ICONOS.cerrar, 'cd-btn-ico'), h('span', { class: 'cd-btn-texto', text: 'Abandonar' }))));

    // ===== Columna izquierda: víctima =====
    const v = caso.victima || {};
    function selloFecha() {
      const d = new Date();
      const p = n => String(n).padStart(2, '0');
      return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
    }
    const libreta = h('ol', { class: 'cd-libreta-lista' });
    const libretaVacia = h('p', { class: 'cd-libreta-vacia', text: 'Analiza evidencias para revelar pistas. Aparecerán aquí.' });
    const colVictima = h('aside', { class: 'cd-inv-col cd-inv-victima' },
      h('div', { class: 'cd-ficha' },
        h('span', { class: 'cd-ficha-clip', 'aria-hidden': 'true' }),
        h('div', { class: 'cd-ficha-foto' },
          esImagen(v.retrato) ? retrato(v.retrato, 'cd-retrato', txt(v.nombre, 'Víctima')) : retratoSvg(retratoPersona(v)),
          h('span', { class: 'cd-ficha-sello', 'aria-hidden': 'true' }, 'Denuncia recibida', h('b', { text: selloFecha() }))),
        h('div', { class: 'cd-ficha-datos' },
          h('div', { class: 'cd-ficha-etq', text: 'Víctima' }),
          h('div', { class: 'cd-ficha-nombre', text: txt(v.nombre, 'Sin identificar') }),
          h('div', { class: 'cd-ficha-meta' },
            v.edad != null ? h('span', { text: `${txt(v.edad)} años` }) : null,
            v.rol ? h('span', { text: txt(v.rol) }) : null))),
      caso.declaracion ? h('figure', { class: 'cd-declaracion' },
        h('figcaption', { class: 'cd-inv-etq', text: 'Declaración' }),
        h('blockquote', null, h('p', { text: txt(caso.declaracion) }))) : null,
      h('section', { class: 'cd-libreta' },
        h('div', { class: 'cd-inv-etq' }, ico(ICONOS.estrella), 'Pistas reveladas'),
        libretaVacia, libreta));

    // ===== Columna central: evidencias =====
    const hilos = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    hilos.setAttribute('class', 'cd-hilos');
    hilos.setAttribute('aria-hidden', 'true');
    const grid = h('div', { class: 'cd-inv-grid' });
    const colEvid = h('section', { class: 'cd-inv-col cd-inv-evidencias', 'aria-label': 'Evidencias' },
      h('div', { class: 'cd-inv-col-cab' },
        h('span', { class: 'cd-inv-col-titulo', text: `Evidencias (${evidencias.length})` }),
        h('span', { class: 'cd-inv-ayuda', text: 'Analiza para revelar pistas · marca las clave: el hilo rojo las une con la pregunta que respondes' })),
      h('div', { class: 'cd-inv-scroll' }, grid));
    const ROTACIONES = [-1.6, 1.2, -0.7, 1.5, -1.2, 0.8];

    evidencias.forEach((ev, idx) => grid.append(crearTarjeta(ev, idx)));
    if (!evidencias.length) grid.append(h('p', { class: 'cd-libreta-vacia', text: 'Este caso no tiene evidencias registradas.' }));

    function crearTarjeta(ev, idx) {
      const tipo = TIPOS_EVIDENCIA[ev.tipo] || { icono: 'archivo', nombre: 'Evidencia' };
      const gratis = techGratis(ev.tipo);
      const costo = gratis ? 0 : Math.max(0, numero(ev.costo ?? 10));
      const zona = h('div', { class: 'cd-evi-analisis' });
      const marcaClave = h('span', { class: 'cd-evi-marca', 'aria-hidden': 'true' }, ico(ICONOS.estrella), 'Clave');
      const el = h('article', { class: 'cd-evi', dataset: { id: txt(ev.id), tipo: txt(ev.tipo) }, vars: { '--i': idx, '--rot': `${ROTACIONES[idx % ROTACIONES.length]}deg` }, 'aria-label': `${tipo.nombre}: ${txt(ev.titulo)}` },
        h('span', { class: 'cd-evi-chincheta', 'aria-hidden': 'true' }),
        h('span', { class: 'cd-cinta cd-cinta-a', 'aria-hidden': 'true' }),
        h('span', { class: 'cd-cinta cd-cinta-b', 'aria-hidden': 'true' }),
        h('header', { class: 'cd-evi-cab' },
          h('span', { class: 'cd-evi-tipo-ico', 'aria-hidden': 'true' }, grabado(tipo.icono)),
          h('div', { class: 'cd-evi-titulos' },
            h('span', { class: 'cd-evi-tipo', text: tipo.nombre }),
            h('h3', { class: 'cd-evi-titulo', text: txt(ev.titulo, tipo.nombre) })),
          marcaClave),
        h('div', { class: 'cd-evi-render' }, renderEvidencia(ev)),
        zona,
        h('div', { class: 'cd-evi-escaneo', 'aria-hidden': 'true' },
          h('span', { class: 'cd-evi-haz' }),
          h('span', { class: 'cd-evi-escaneo-texto cd-mono', text: 'ANALIZANDO…' })));

      const t = { el, ev, costo, gratis, zona, btn: null, aviso: null };
      tarjetas.set(txt(ev.id), t);
      pintarZonaPendiente(t);
      return el;
    }

    function pintarZonaPendiente(t) {
      const { ev, costo, gratis } = t;
      const aviso = h('p', { class: 'cd-evi-aviso', role: 'status' });
      const btn = h('button', {
        class: `cd-btn-analizar ${gratis ? 'cd-gratis' : ''}`, type: 'button',
        'aria-label': gratis ? `Analizar gratis (tecnología ${txt(gratis.nombre)})` : `Analizar por ${costo} de energía`,
        onclick: () => analizar(t)
      },
      ico(ICONOS.escaner, 'cd-analizar-ico'),
      h('span', { class: 'cd-analizar-texto', text: 'Analizar' }),
      h('span', { class: 'cd-analizar-costo' }, gratis ? h('span', { text: 'Gratis' }) : [ico(ICONOS.energia), h('span', { class: 'cd-num', text: String(costo) })]));
      t.btn = btn; t.aviso = aviso;
      // append(null) insertaría el texto "null": se filtran los nodos vacíos
      vaciar(t.zona).append(...[
        h('div', { class: 'cd-evi-oculto', 'aria-hidden': 'true' },
          h('span', { class: 'cd-evi-oculto-etq', text: 'Pista sin revelar' }),
          h('span', { class: 'cd-redactado' }), h('span', { class: 'cd-redactado cd-corto' })),
        gratis ? h('div', { class: 'cd-evi-tech' }, ico(ICONOS.matraz), `${txt(gratis.nombre)}: análisis sin costo`) : null,
        btn, aviso].filter(Boolean));
    }

    async function analizar(t) {
      const id = txt(t.ev.id);
      if (terminado || analizadas.has(id) || enCurso.has(id)) return;
      let ok = false;
      try { ok = typeof ctx.gastarEnergia === 'function' ? ctx.gastarEnergia(t.costo) !== false : true; } catch { ok = false; }
      if (!ok) {
        t.aviso.textContent = `Sin energía: necesitas ${t.costo} y tienes ${Math.floor(energia())}. Deduce con las pistas que ya tienes.`;
        destello(t.btn, 'cd-denegado', 450);
        destello(energiaEl, 'cd-sin-energia', 900);
        actualizarEnergia();
        return;
      }
      enCurso.add(id);
      t.btn.disabled = true;
      t.aviso.textContent = '';
      t.el.classList.add('cd-escaneando');
      actualizarEnergia();
      await espera(reducirMovimiento() ? 60 : 1150);
      if (terminado) return;
      t.el.classList.remove('cd-escaneando');
      enCurso.delete(id);
      analizadas.add(id);
      t.el.classList.add('cd-analizada');
      destello(t.el, 'cd-revelada', 900);
      contadorEl.textContent = `${analizadas.size}/${evidencias.length}`;
      pintarZonaAnalizada(t);
      anotarPista(t);
      actualizarEnergia();
    }

    function pintarZonaAnalizada(t) {
      const pistaTexto = h('p', { class: 'cd-evi-pista-texto' });
      const btnClave = h('button', {
        class: 'cd-btn-clave', type: 'button', 'aria-pressed': 'false',
        onclick: () => alternarClave(t, btnClave)
      }, ico(ICONOS.estrellaVacia, 'cd-clave-vacia'), ico(ICONOS.estrella, 'cd-clave-llena'), h('span', { class: 'cd-clave-texto', text: 'Marcar como clave' }));
      vaciar(t.zona).append(
        h('div', { class: 'cd-evi-pista', role: 'status' },
          h('div', { class: 'cd-evi-pista-etq' }, ico(ICONOS.lupa), 'Hallazgo del análisis'),
          pistaTexto),
        btnClave);
      escribir(pistaTexto, txt(t.ev.pista, 'El análisis no arrojó nada concluyente.'), { vel: 12 });
      btnClave.focus({ preventScroll: true });
    }

    function anotarPista(t) {
      libretaVacia.hidden = true;
      const li = h('li', { class: 'cd-libreta-item', dataset: { id: txt(t.ev.id) } },
        h('span', { class: 'cd-libreta-estrella', 'aria-hidden': 'true' }, ico(ICONOS.estrella)),
        h('div', null,
          h('div', { class: 'cd-libreta-titulo', text: txt(t.ev.titulo, 'Evidencia') }),
          h('div', { class: 'cd-libreta-texto', text: txt(t.ev.pista) })));
      li.addEventListener('click', () => t.el.scrollIntoView({ behavior: reducirMovimiento() ? 'auto' : 'smooth', block: 'center' }));
      libreta.append(li);
    }

    function alternarClave(t, btn) {
      const id = txt(t.ev.id);
      const si = !claves.has(id);
      if (si) claves.add(id); else claves.delete(id);
      t.el.classList.toggle('cd-clave', si);
      btn.setAttribute('aria-pressed', si ? 'true' : 'false');
      btn.querySelector('.cd-clave-texto').textContent = si ? 'Evidencia clave' : 'Marcar como clave';
      libreta.querySelector(`[data-id="${CSS.escape(id)}"]`)?.classList.toggle('cd-clave', si);
      destello(t.el, 'cd-clave-pulso', 600);
      dibujarHilos();
    }

    let preguntaActiva = 0;
    let pendienteHilos = 0;
    function dibujarHilos() {
      cancelAnimationFrame(pendienteHilos);
      pendienteHilos = requestAnimationFrame(() => {
        const ns = 'http://www.w3.org/2000/svg';
        while (hilos.firstChild) hilos.firstChild.remove();
        if (!tablero.isConnected) return;
        const base = tablero.getBoundingClientRect();
        hilos.setAttribute('width', base.width); hilos.setAttribute('height', base.height);
        hilos.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);
        const visible = (r, caja) => r.top >= caja.top - 4 && r.bottom <= caja.bottom + 4 && r.left >= caja.left - 4 && r.right <= caja.right + 4;
        const cajaEv = scrollEv.getBoundingClientRect(), cajaDe = listaDeduc.getBoundingClientRect();
        const centro = r => [r.left + r.width / 2 - base.left, r.top + r.height / 2 - base.top];
        const pinsEv = [...grid.querySelectorAll('.cd-evi.cd-clave .cd-evi-chincheta')]
          .map(p => p.getBoundingClientRect()).filter(r => visible(r, cajaEv));
        const pinPreg = preguntas.length ? listaDeduc.querySelectorAll('.cd-preg-chincheta')[Math.min(preguntaActiva, preguntas.length - 1)] : null;
        const rp = pinPreg?.getBoundingClientRect();
        const hayPreg = !!rp && visible(rp, cajaDe);
        const puntos = hayPreg ? pinsEv.map(r => [centro(r), centro(rp)]) : [];
        // Sin preguntas (o la activa fuera de vista): el hilo encadena las evidencias clave entre sí.
        if (!hayPreg) for (let i = 1; i < pinsEv.length; i++) puntos.push([centro(pinsEv[i - 1]), centro(pinsEv[i])]);
        puntos.forEach(([[x1, y1], [x2, y2]], i) => {
          const dx = x2 - x1, caida = 46 + Math.abs(dx) * 0.12 + i * 16, y = Math.max(y1, y2);
          const t = (i % 2 ? 1 : -1) * 7;       // ligera torcedura distinta en cada hilo
          const d = `M${x1} ${y1} C${x1 + dx * 0.28} ${y + caida + t} ${x1 + dx * 0.72} ${y + caida - t} ${x2} ${y2}`;
          const sombra = document.createElementNS(ns, 'path');
          sombra.setAttribute('d', d); sombra.setAttribute('class', 'cd-hilo-sombra');
          const p = document.createElementNS(ns, 'path');
          p.setAttribute('d', d); p.setAttribute('class', 'cd-hilo');
          hilos.append(sombra, p);
        });
      });
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => dibujarHilos()) : null;
    ro?.observe(grid);
    window.addEventListener('resize', dibujarHilos);

    // ===== Columna derecha: deducción =====
    const progresoEl = h('span', { class: 'cd-num', text: `0/${preguntas.length}` });
    const btnConfirmar = boton('Confirmar conclusiones', { variante: 'primario', icono: ICONOS.check, deshabilitado: preguntas.length > 0, onclick: () => confirmarConclusiones() });
    const pistaConfirmar = h('p', { class: 'cd-deduc-nota', text: preguntas.length ? 'Responde todas las preguntas para cerrar el caso.' : 'Revisa la evidencia y cierra el caso.' });
    const listaDeduc = h('div', { class: 'cd-deduc-lista' }, preguntas.map((p, i) => crearPregunta(p, i)));
    const colDeduc = h('aside', { class: 'cd-inv-col cd-inv-deduccion', 'aria-label': 'Libreta de deducción' },
      h('span', { class: 'cd-espiral', 'aria-hidden': 'true' }),
      h('div', { class: 'cd-inv-col-cab' },
        h('span', { class: 'cd-inv-col-titulo', text: 'Libreta de deducción' }),
        h('span', { class: 'cd-deduc-progreso' }, 'Conclusiones ', progresoEl)),
      listaDeduc,
      h('div', { class: 'cd-deduc-pie' }, pistaConfirmar, btnConfirmar));
    const activarPregunta = i => {
      if (preguntaActiva === i) return;
      preguntaActiva = i;
      listaDeduc.querySelectorAll('.cd-preg').forEach((el, k) => el.classList.toggle('cd-activa', k === i));
      dibujarHilos();
    };

    function crearPregunta(p, i) {
      const pid = txt(p.id, `p${i}`);
      const grupo = h('div', { class: 'cd-opciones', role: 'radiogroup', 'aria-labelledby': `cd-preg-${i}` });
      arr(p.opciones).forEach((o, j) => {
        const b = h('button', {
          class: 'cd-opcion', type: 'button', role: 'radio', 'aria-checked': 'false',
          onclick: () => {
            respuestas.set(pid, j);
            grupo.querySelectorAll('.cd-opcion').forEach((x, k) => { x.setAttribute('aria-checked', k === j ? 'true' : 'false'); x.classList.toggle('cd-elegida', k === j); });
            actualizarProgreso();
            activarPregunta(i);
          }
        }, h('span', { class: 'cd-opcion-letra', text: String.fromCharCode(65 + j) }), h('span', { class: 'cd-opcion-texto', text: txt(o?.texto) }),
        h('span', { class: 'cd-opcion-sello', 'aria-hidden': 'true', text: 'Conclusión' }));
        grupo.append(b);
      });
      const nodo = h('div', { class: `cd-preg ${i === 0 ? 'cd-activa' : ''}`.trim() },
        h('span', { class: 'cd-preg-chincheta', 'aria-hidden': 'true' }),
        h('div', { class: 'cd-preg-cab' },
          h('span', { class: 'cd-preg-num', text: String(i + 1) }),
          h('p', { class: 'cd-preg-texto', id: `cd-preg-${i}`, text: txt(p.texto) })),
        grupo);
      nodo.addEventListener('focusin', () => activarPregunta(i));
      nodo.addEventListener('pointerdown', () => activarPregunta(i));
      return nodo;
    }
    function actualizarProgreso() {
      const n = preguntas.filter((p, i) => respuestas.has(txt(p.id, `p${i}`))).length;
      progresoEl.textContent = `${n}/${preguntas.length}`;
      const listo = n === preguntas.length;
      btnConfirmar.disabled = !listo;
      pistaConfirmar.textContent = listo
        ? (analizadas.size ? 'Todo listo. Confirma cuando estés segura de tus conclusiones.' : 'Aún no analizas ninguna evidencia. ¿Seguro que quieres concluir?')
        : 'Responde todas las preguntas para cerrar el caso.';
      if (listo) destello(btnConfirmar, 'cd-listo', 900);
    }

    function actualizarEnergia() {
      const e = energia();
      energiaValor.textContent = `${Math.floor(e)}/${energiaMax()}`;
      energiaBarra.style.transform = `scaleX(${Math.max(0, Math.min(1, e / energiaMax()))})`;
      energiaEl.classList.toggle('cd-bajo', e < 15);
      for (const t of tarjetas.values()) {
        if (!t.btn || analizadas.has(txt(t.ev.id))) continue;
        t.btn.classList.toggle('cd-insuficiente', t.costo > e);
      }
    }

    // ===== Montaje =====
    const scrollEv = colEvid.querySelector('.cd-inv-scroll');
    const tablero = h('div', { class: 'cd-inv' },
      cabecera,
      h('div', { class: 'cd-inv-cuerpo' }, colVictima, colEvid, colDeduc),
      hilos);
    capa.el.append(h('div', { class: 'cd-inv-fondo', 'aria-hidden': 'true' }), tablero);
    // Desvanecido en el borde cuando hay más contenido (declaración, pistas, evidencias y libreta)
    indicarScroll(colVictima); indicarScroll(scrollEv); indicarScroll(listaDeduc);
    scrollEv.addEventListener('scroll', dibujarHilos, { passive: true });
    listaDeduc.addEventListener('scroll', dibujarHilos, { passive: true });
    tablero.addEventListener('animationend', dibujarHilos);
    actualizarEnergia();
    requestAnimationFrame(() => {
      const primero = grid.querySelector('.cd-btn-analizar');
      (primero || btnConfirmar).setAttribute('data-autofoco', '');
      capa.enfocar();
    });

    // ===== Cierre =====
    function resultadoBase(extra) {
      return { resuelto: false, aciertos: 0, total: preguntas.length, analizadas: [...analizadas], ...extra };
    }
    async function abandonar() {
      if (terminado) return;
      const si = await confirmar(capas, {
        titulo: '¿Abandonar la investigación?',
        texto: 'El caso contará como no resuelto y la ciudadanía perderá confianza. Podrás volver a intentarlo.',
        si: 'Abandonar', no: 'Seguir investigando', peligro: true
      });
      if (!si || terminado) return;
      terminado = true;
      ro?.disconnect(); window.removeEventListener('resize', dibujarHilos); cancelAnimationFrame(pendienteHilos);
      await capa.cerrar(320);
      resolver(resultadoBase());
    }

    function confirmarConclusiones() {
      if (terminado) return;
      terminado = true;
      ro?.disconnect(); window.removeEventListener('resize', dibujarHilos); cancelAnimationFrame(pendienteHilos);
      let aciertos = 0;
      const detalle = preguntas.map((p, i) => {
        const j = respuestas.get(txt(p.id, `p${i}`));
        const op = arr(p.opciones)[j];
        const bien = !!op?.correcta;
        if (bien) aciertos++;
        return { p, j, op, bien };
      });
      const total = preguntas.length;
      const resuelto = aciertos === total;
      mostrarResultado({ resuelto, aciertos, total, detalle });
    }

    function mostrarResultado({ resuelto, aciertos, total, detalle }) {
      tablero.setAttribute('inert', '');
      tablero.classList.add('cd-atenuado');
      const clavesCaso = evidencias.filter(e => e.clave === true).map(e => txt(e.id));
      const bienMarcadas = clavesCaso.filter(id => claves.has(id)).length;
      const malMarcadas = [...claves].filter(id => !clavesCaso.includes(id)).length;

      const listaPreg = h('ol', { class: 'cd-res-preguntas' }, detalle.map(({ p, j, op, bien }) =>
        h('li', { class: bien ? 'cd-bien' : 'cd-mal' },
          h('div', { class: 'cd-res-preg-cab' },
            h('span', { class: 'cd-res-marca' }, ico(bien ? ICONOS.check : ICONOS.cruz)),
            h('span', { class: 'cd-res-preg-texto', text: txt(p.texto) })),
          resuelto
            // Caso resuelto: se enseña la retroalimentación de cada opción.
            ? h('ul', { class: 'cd-res-opciones' }, arr(p.opciones).map((o, k) => h('li', { class: `${o?.correcta ? 'cd-correcta' : 'cd-incorrecta'} ${k === j ? 'cd-tuya' : ''}` },
                h('span', { class: 'cd-res-op-texto' }, h('b', { text: `${String.fromCharCode(65 + k)}. ` }), txt(o?.texto), k === j ? h('span', { class: 'cd-res-tuya', text: 'Tu respuesta' }) : null),
                o?.retro ? h('span', { class: 'cd-res-retro', text: txt(o.retro) }) : null)))
            // Sin resolver: solo la retro de la opción elegida, para no regalar la respuesta del reintento.
            : h('div', { class: 'cd-res-elegida' },
                h('span', { class: 'cd-res-op-texto' }, h('b', { text: 'Tu respuesta: ' }), txt(op?.texto, 'Sin respuesta')),
                op?.retro ? h('span', { class: 'cd-res-retro', text: txt(op.retro) }) : null))));

      let capaRes;
      const continuar = async () => {
        await capa.cerrar(360);
        resolver({ resuelto, aciertos, total, analizadas: [...analizadas] });
      };
      capa.alTecla = ev => { if (ev.key === 'Escape') ev.preventDefault(); };
      capaRes = h('div', { class: `cd-inv-resultado ${resuelto ? 'cd-exito' : 'cd-fallo'}`, role: 'alertdialog', 'aria-label': resuelto ? 'Caso resuelto' : 'Conclusión incorrecta' },
        h('div', { class: 'cd-modal cd-metal cd-modal-resultado' },
          h('span', { class: 'cd-esquinas', 'aria-hidden': 'true' }),
          h('div', { class: 'cd-res-sello', text: resuelto ? 'Caso resuelto' : 'No concluyente' }),
          h('div', { class: 'cd-res-cab' },
            h('div', { class: 'cd-res-puntaje' },
              h('span', { class: 'cd-res-aciertos cd-num', text: String(aciertos) }),
              h('span', { class: 'cd-res-total cd-num', text: `/ ${total}` }),
              h('span', { class: 'cd-res-puntaje-etq', text: 'conclusiones correctas' })),
            h('div', null,
              h('h2', { class: 'cd-res-titulo', text: resuelto ? '¡Deducción impecable!' : 'Las conclusiones no cuadran' }),
              h('p', { class: 'cd-res-sub', text: resuelto
                ? 'Reconstruiste el ataque con la evidencia. Así ocurrió:'
                : 'Revisa las pistas: algo de la evidencia contradice tu versión. El caso seguirá abierto.' }))),
          h('div', { class: 'cd-res-scroll' },
            resuelto && caso.explicacion ? h('section', { class: 'cd-res-explicacion' },
              h('div', { class: 'cd-inv-etq' }, ico(ICONOS.carpeta), 'Cómo ocurrió'),
              h('p', { text: txt(caso.explicacion) })) : null,
            listaPreg,
            clavesCaso.length ? h('div', { class: 'cd-res-claves' }, ico(ICONOS.estrella),
              h('span', { text: `Evidencias clave identificadas: ${bienMarcadas} de ${clavesCaso.length}${malMarcadas ? ` · ${malMarcadas} marcada${malMarcadas > 1 ? 's' : ''} sin ser determinante${malMarcadas > 1 ? 's' : ''}` : ''}.` })) : null),
          h('div', { class: 'cd-modal-botones' },
            boton(resuelto ? 'Recibir el Escudo táctico' : 'Volver a la ciudad', { variante: 'primario', icono: resuelto ? ICONOS.escudo : ICONOS.atras, autofoco: true, onclick: continuar }))));
      capa.el.append(capaRes);
      indicarScroll(capaRes.querySelector('.cd-res-scroll'));
      requestAnimationFrame(() => {
        capaRes.classList.add('cd-visible');
        capaRes.querySelector('[data-autofoco]')?.focus({ preventScroll: true });
      });
    }
  });
}
