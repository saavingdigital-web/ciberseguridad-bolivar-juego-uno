// CiberDetective · pantallas y modales: carga, menú, intro, escudo táctico, laboratorio,
// avance de era, final, pausa y confirmaciones.
import { h, ico, vaciar, arr, txt, numero, fmt, tiempo, romano, retrato, retratoSvg, esImagen, escribir, espera, destello } from './util.js';
import { ICONOS, emblemaEra, emblemaLogo, emblemaEscudo, TIPOS_EVIDENCIA, grabado, claveTecnologia } from './iconos.js';
import { retratoDetective } from './retratos.js';
import { nodoCosto } from './hud.js';
import { MARCA, panelLogo, bloqueMarca, pieEscudo } from './marca.js';

// ---------- Piezas comunes ----------
export function boton(texto, { variante = 'secundario', icono = null, onclick = null, autofoco = false, clase = '', deshabilitado = false, tipo = 'button' } = {}) {
  return h('button', {
    class: `cd-btn cd-btn-${variante} ${clase}`.trim(), type: tipo, onclick,
    disabled: deshabilitado || null, 'data-autofoco': autofoco || null
  }, icono ? ico(icono, 'cd-btn-ico') : null, h('span', { class: 'cd-btn-texto', text: texto }));
}

const marco = (clase, ...hijos) => h('div', { class: `cd-modal cd-metal ${clase}`.trim() }, h('span', { class: 'cd-esquinas', 'aria-hidden': 'true' }), ...hijos);

const titular = (texto, sub, clase = '') => h('header', { class: `cd-modal-cab ${clase}`.trim() },
  h('h2', { class: 'cd-modal-titulo', text: texto }),
  sub ? h('p', { class: 'cd-modal-sub', text: sub }) : null,
  h('span', { class: 'cd-filete', 'aria-hidden': 'true' }));

export function confirmar(capas, { titulo = '¿Confirmar?', texto = '', si = 'Aceptar', no = 'Cancelar', peligro = false } = {}) {
  return new Promise(resolver => {
    let capa;
    const fin = v => { capa.cerrar(); resolver(v); };
    capa = capas.abrir({ clase: 'cd-capa-confirmar', etiqueta: titulo, alTecla: ev => { if (ev.key === 'Escape') { ev.preventDefault(); fin(false); } } });
    capa.el.append(marco('cd-modal-confirmar',
      titular(titulo),
      texto ? h('p', { class: 'cd-confirmar-texto', text: texto }) : null,
      h('div', { class: 'cd-modal-botones' },
        boton(no, { onclick: () => fin(false), autofoco: true }),
        boton(si, { variante: peligro ? 'peligro' : 'primario', onclick: () => fin(true) }))));
    capa.enfocar();
  });
}

// ---------- Pantalla de carga ----------
const CONSEJOS = [
  'Ningún banco te pedirá tu clave ni el código que llega a tu celular por mensaje o llamada.',
  'Antes de tocar un enlace, revisa el dominio real: el candado no garantiza que la página sea legítima.',
  'Activa la verificación en dos pasos en tu correo, tus redes y tu banca en línea.',
  'La urgencia y el miedo son las herramientas favoritas de los estafadores. Respira y verifica.',
  'Instala aplicaciones solo desde tiendas oficiales y revisa los permisos que piden.',
  'En un Wi-Fi público, evita entrar a tu banca en línea o escribir contraseñas.',
  'Lo que publicas en redes puede usarse para engañarte: cuida tus datos personales.',
  'Si alguien te extorsiona con fotos o videos, no pagues: guarda las pruebas y denuncia.',
  'Usa contraseñas largas y distintas para cada servicio.',
  'Un perfil con pocos seguidores, creado hace pocos días y con prisa por hablar contigo, es una señal de alerta.'
];

export function crearCarga({ capas, datos }) {
  let capa = null, barra, pct, texto, consejo, idConsejo = 0, i = 0;
  const consejos = arr(datos?.CONSEJOS).length ? arr(datos.CONSEJOS).map(String) : CONSEJOS;
  function asegurar() {
    if (capa) return;
    capa = capas.abrir({ clase: 'cd-capa-carga', etiqueta: 'Cargando CiberDetective', alTecla: ev => ev.preventDefault() });
    capa.el.classList.add('cd-visible');
    barra = h('i', { class: 'cd-carga-relleno' });
    pct = h('span', { class: 'cd-carga-pct cd-num', text: '0%' });
    texto = h('span', { class: 'cd-carga-texto', text: 'Iniciando sistemas…' });
    consejo = h('p', { class: 'cd-carga-consejo-texto', text: consejos[0] });
    i = Math.floor(Math.random() * consejos.length);
    consejo.textContent = consejos[i];
    capa.el.append(
      h('div', { class: 'cd-carga-fondo', 'aria-hidden': 'true' }),
      h('div', { class: 'cd-carga-marca' }, panelLogo(300)),
      h('div', { class: 'cd-carga-centro' },
        h('div', { class: 'cd-logo' },
          h('div', { class: 'cd-logo-emblema', html: emblemaLogo(118) }),
          h('h1', { class: 'cd-logo-titulo', 'data-texto': 'CIBERDETECTIVE', text: 'CIBERDETECTIVE' }),
          h('div', { class: 'cd-logo-sub' }, h('span', { class: 'cd-logo-linea' }), h('span', { text: 'Puerto Nexo' }), h('span', { class: 'cd-logo-linea' }))),
        h('div', { class: 'cd-carga-barra', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': 'Progreso de carga' },
          h('span', { class: 'cd-carga-pista' }, barra), h('span', { class: 'cd-carga-brillo', 'aria-hidden': 'true' })),
        h('div', { class: 'cd-carga-estado' }, texto, pct),
        h('div', { class: 'cd-carga-consejo' },
          h('span', { class: 'cd-carga-consejo-etq' }, ico(ICONOS.escudo), 'Consejo de la Central'),
          consejo)));
    idConsejo = setInterval(() => {
      consejo.classList.add('cd-cambia');
      setTimeout(() => {
        i = (i + 1) % consejos.length;
        consejo.textContent = consejos[i];
        consejo.classList.remove('cd-cambia');
      }, 350);
    }, 4800);
  }
  return {
    progreso(p, t) {
      asegurar();
      const v = Math.max(0, Math.min(1, numero(p)));
      barra.style.transform = `scaleX(${v})`;
      pct.textContent = `${Math.round(v * 100)}%`;
      capa.el.querySelector('.cd-carga-barra')?.setAttribute('aria-valuenow', String(Math.round(v * 100)));
      if (t) texto.textContent = txt(t);
    },
    async ocultar() {
      if (!capa) return;
      clearInterval(idConsejo);
      barra.style.transform = 'scaleX(1)';
      pct.textContent = '100%';
      const c = capa;
      capa = null;
      await c.cerrar(900);
    }
  };
}

// ---------- Menú principal ----------
export function menuPrincipal({ capas, datos }) {
  return new Promise(resolver => {
    let vista = 'menu';
    const capa = capas.abrir({
      clase: 'cd-capa-menu', etiqueta: 'Menú principal',
      alTecla: ev => { if (ev.key === 'Escape' && vista === 'creditos') { ev.preventDefault(); verMenu(); } }
    });
    const cuerpo = h('div', { class: 'cd-menu-cuerpo' });
    const marcaMenu = [
      h('div', { class: 'cd-menu-marca' }, panelLogo(240)),
      h('p', { class: 'cd-menu-leyenda', text: MARCA.leyenda })
    ];
    const titulo = h('div', { class: 'cd-menu-titulo' },
      h('div', { class: 'cd-logo-emblema cd-grande', html: emblemaLogo(132) }),
      h('h1', { class: 'cd-titulo-holo', 'data-texto': 'CIBERDETECTIVE', text: 'CIBERDETECTIVE' }),
      h('div', { class: 'cd-logo-sub cd-grande' }, h('span', { class: 'cd-logo-linea' }), h('span', { text: 'Puerto Nexo' }), h('span', { class: 'cd-logo-linea' })),
      h('p', { class: 'cd-menu-lema', text: 'Estrategia, deducción y ciudadanía digital segura' }));

    function verMenu() {
      vista = 'menu';
      capa.el.classList.remove('cd-en-creditos');
      vaciar(cuerpo).append(
        h('nav', { class: 'cd-menu-botones', 'aria-label': 'Menú principal' },
          boton('Jugar', { variante: 'monumental', icono: ICONOS.jugar, autofoco: true, onclick: jugar }),
          boton('Créditos', { variante: 'secundario', icono: ICONOS.info, onclick: verCreditos })));
      capa.enfocar();
    }
    function verCreditos() {
      vista = 'creditos';
      capa.el.classList.add('cd-en-creditos');
      const lineas = arr(datos?.CREDITOS).length ? arr(datos.CREDITOS) : [
        ['CiberDetective: Puerto Nexo', 'Un juego de estrategia y deducción sobre ciudadanía digital segura'],
        ['Para', 'Secretaría de las TIC de Bolívar'],
        ['Motor 3D', 'Three.js (licencia MIT)'],
        ['Tipografías', 'Cinzel, Rajdhani y JetBrains Mono (SIL Open Font License)'],
        ['Sonido', 'Sintetizado en tiempo real con Web Audio'],
        ['Aviso', 'Personas, marcas, bancos y aplicaciones del juego son ficticios. Cualquier parecido con la realidad es coincidencia.']
      ];
      vaciar(cuerpo).append(marco('cd-modal-creditos',
        titular('Créditos'),
        bloqueMarca({ ancho: 220, clase: 'cd-marca-creditos' }),
        h('dl', { class: 'cd-creditos' }, lineas.map(l => Array.isArray(l)
          ? [h('dt', { text: txt(l[0]) }), h('dd', { text: txt(l[1]) })]
          : [h('dd', { text: txt(typeof l === 'object' ? `${txt(l.rol)} ${txt(l.nombre)}` : l) })])),
        h('p', { class: 'cd-marca-credito', text: MARCA.credito }),
        h('div', { class: 'cd-modal-botones' }, boton('Volver', { icono: ICONOS.atras, onclick: verMenu, autofoco: true }))));
      capa.enfocar();
    }
    async function jugar() {
      capa.el.classList.add('cd-menu-sale');
      await espera(380);
      await capa.cerrar(500);
      resolver('jugar');
    }
    capa.el.append(
      h('div', { class: 'cd-menu-vineta', 'aria-hidden': 'true' }),
      h('div', { class: 'cd-menu-contenido' }, titulo, cuerpo),
      ...marcaMenu,
      h('footer', { class: 'cd-menu-pie' }, h('span', { text: 'Puerto Nexo · Caribe colombiano · 2026' }), h('span', { text: 'Todas las marcas y personajes son ficticios' })));
    verMenu();
  });
}

// ---------- Intro (expediente con máquina de escribir) ----------
export function intro({ capas, datos }, paginas) {
  const pags = arr(paginas).filter(Boolean);
  if (!pags.length) return Promise.resolve();
  return new Promise(resolver => {
    let i = 0, maquina = null;
    const det = datos?.DETECTIVE || {};
    const capa = capas.abrir({
      clase: 'cd-capa-intro', etiqueta: 'Informe de la misión',
      alTecla: ev => {
        if (ev.target?.closest?.('button') && (ev.key === 'Enter' || ev.key === ' ')) return;  // el botón enfocado manda
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); avanzar(); }
        else if (ev.key === 'Escape') { ev.preventDefault(); terminar(); }
      }
    });
    const numPag = h('span', { class: 'cd-exp-pagina cd-num' });
    const tituloEl = h('h2', { class: 'cd-exp-titulo' });
    const textoEl = h('p', { class: 'cd-exp-texto' });
    const puntos = h('div', { class: 'cd-exp-puntos', 'aria-hidden': 'true' }, pags.map(() => h('i')));
    const btnSig = boton('Continuar', { variante: 'primario', icono: ICONOS.flecha, autofoco: true, onclick: () => avanzar() });
    const hoja = h('article', { class: 'cd-exp-hoja', onclick: ev => { if (!ev.target.closest('button') && maquina && !maquina.terminado) maquina.completar(); } },
      h('div', { class: 'cd-exp-membrete' },
        h('span', { class: 'cd-exp-sigla', text: 'CENTRAL DE CIBERPOLICÍA · PUERTO NEXO' }),
        numPag),
      h('div', { class: 'cd-exp-sello', 'aria-hidden': 'true', text: 'Confidencial' }),
      tituloEl, textoEl,
      h('div', { class: 'cd-exp-pie' }, puntos,
        h('div', { class: 'cd-modal-botones' },
          boton('Saltar informe', { variante: 'fantasma', onclick: () => terminar() }),
          btnSig)));
    const ficha = h('aside', { class: 'cd-exp-ficha' },
      h('div', { class: 'cd-exp-ficha-etq', text: 'Agente asignada' }),
      h('div', { class: 'cd-exp-ficha-retrato' }, esImagen(det.retrato) ? retrato(det.retrato, 'cd-retrato', txt(det.nombre)) : retratoSvg(retratoDetective(det))),
      h('div', { class: 'cd-exp-ficha-nombre', text: txt(det.nombre, 'Valeria Ríos') }),
      h('div', { class: 'cd-exp-ficha-rango', text: txt(det.rango, 'Detective de cibercrimen') }),
      h('div', { class: 'cd-exp-ficha-clip', 'aria-hidden': 'true' }));
    capa.el.append(h('div', { class: 'cd-exp' },
      h('div', { class: 'cd-exp-carpeta' },
        h('span', { class: 'cd-exp-pestana', text: `Expediente N.º 2026-PN-${String(17 + pags.length).padStart(3, '0')}` }),
        ficha, hoja)));

    function mostrar() {
      const p = pags[i];
      numPag.textContent = `Hoja ${i + 1} de ${pags.length}`;
      tituloEl.textContent = txt(p.titulo);
      [...puntos.children].forEach((d, j) => d.classList.toggle('cd-activo', j <= i));
      btnSig.querySelector('.cd-btn-texto').textContent = i === pags.length - 1 ? 'Comenzar la misión' : 'Continuar';
      destello(hoja, 'cd-exp-pasa', 600);
      maquina?.cancelar();
      maquina = escribir(textoEl, p.texto, { vel: 16 });
    }
    function avanzar() {
      if (maquina && !maquina.terminado) { maquina.completar(); return; }
      if (i < pags.length - 1) { i++; mostrar(); } else terminar();
    }
    async function terminar() {
      maquina?.cancelar();
      await capa.cerrar(420);
      resolver();
    }
    mostrar();
    capa.enfocar();
  });
}

// ---------- Escudo táctico ----------
export function escudoTactico({ capas, datos }, caso = {}, resultado = {}) {
  return new Promise(resolver => {
    let capa;
    const fin = async () => { await capa.cerrar(360); resolver(); };
    capa = capas.abrir({ clase: 'cd-capa-escudo', etiqueta: 'Escudo táctico', alTecla: ev => { if (ev.key === 'Escape') { ev.preventDefault(); fin(); } } });
    const consejo = caso.consejo || {};
    const autoridadNombre = txt(caso.autoridad);
    const auts = arr(datos?.AUTORIDADES);
    const aut = auts.find(a => a?.nombre === autoridadNombre)
      || auts.find(a => autoridadNombre && (txt(a?.nombre).includes(autoridadNombre) || autoridadNombre.includes(txt(a?.nombre, '§'))))
      || null;
    const rec = caso.recompensa || {};
    const recompensa = ['confianza', 'presupuesto', 'evidencia'].filter(k => numero(rec[k]))
      .map(k => h('span', { class: `cd-premio cd-rec-${k}` }, ico(ICONOS[k]), `+${fmt(rec[k])}`));
    const puntos = arr(consejo.puntos);
    capa.el.append(marco('cd-modal-escudo',
      h('div', { class: 'cd-escudo-rayos', 'aria-hidden': 'true' }),
      h('div', { class: 'cd-escudo-emblema', html: emblemaEscudo(128) }),
      h('div', { class: 'cd-escudo-etq', text: 'Caso resuelto · recompensa obtenida' }),
      h('h2', { class: 'cd-escudo-titulo', text: txt(consejo.titulo, 'Escudo táctico') }),
      h('p', { class: 'cd-escudo-caso', text: txt(caso.titulo) }),
      recompensa.length ? h('div', { class: 'cd-escudo-premios' }, recompensa) : null,
      h('ul', { class: 'cd-escudo-puntos' }, puntos.map((p, i) => h('li', { vars: { '--i': i } },
        h('span', { class: 'cd-escudo-check' }, ico(ICONOS.check)), h('span', { text: txt(p) })))),
      autoridadNombre ? h('div', { class: 'cd-escudo-autoridad' },
        h('span', { class: 'cd-escudo-aut-ico' }, ico(ICONOS.telefono)),
        h('div', null,
          h('div', { class: 'cd-escudo-aut-etq', text: '¿A quién acudir?' }),
          h('div', { class: 'cd-escudo-aut-nombre', text: autoridadNombre }),
          aut?.contacto ? h('div', { class: 'cd-escudo-aut-contacto cd-mono', text: txt(aut.contacto) }) : null,
          aut?.incidente ? h('div', { class: 'cd-escudo-aut-inc', text: txt(aut.incidente) }) : null)) : null,
      resultado && numero(resultado.total) ? h('div', { class: 'cd-escudo-precision', text: `Deducción: ${fmt(resultado.aciertos)} de ${fmt(resultado.total)} conclusiones correctas` }) : null,
      h('div', { class: 'cd-modal-botones' }, boton('Entendido', { variante: 'primario', icono: ICONOS.check, autofoco: true, onclick: fin })),
      pieEscudo(MARCA.apoyo, 'cd-marca-pie-escudo')));
    capa.enfocar();
  });
}

// ---------- Laboratorio ----------
export function efectoTexto(ef) {
  const v = ef?.valor;
  switch (ef?.tipo) {
    case 'energia-max': return `+${fmt(v)} de energía máxima`;
    case 'regen-energia': return `+${fmt(v)} de energía por minuto`;
    case 'revelar-tipo': return `Analiza gratis: ${TIPOS_EVIDENCIA[v]?.nombre ?? txt(v)}`;
    case 'confianza-pasiva': return `+${fmt(v)} de confianza por minuto`;
    case 'presupuesto-pasivo': return `+${fmt(v)} de presupuesto por minuto`;
    case 'tiempo-casos': return `+${fmt(v)} s de plazo en cada caso`;
    default: return '';
  }
}
const limpiarCosto = c => Object.fromEntries(Object.entries(c || {}).filter(([, v]) => v != null && Number.isFinite(Number(v)) && Number(v) > 0).map(([k, v]) => [k, Number(v)]));

export function laboratorio({ capas, datos, hud }, tecnologias, ctx = {}) {
  return new Promise(resolver => {
    let capa;
    const fin = async id => { await capa.cerrar(320); resolver(id ?? null); };
    capa = capas.abrir({ clase: 'cd-capa-lab', etiqueta: 'Laboratorio forense', alTecla: ev => { if (ev.key === 'Escape') { ev.preventDefault(); fin(null); } } });
    const techs = arr(tecnologias).filter(t => t && t.id != null);
    const investigadas = ctx.investigadas instanceof Set ? ctx.investigadas : new Set(arr(ctx.investigadas));
    const eraActual = numero(ctx.eraActual) || 1;
    const puede = c => { try { return typeof ctx.puedePagar === 'function' ? !!ctx.puedePagar(limpiarCosto(c)) : true; } catch { return false; } };
    const eras = arr(datos?.ERAS).length ? arr(datos.ERAS) : [...new Set(techs.map(t => t.era || 1))].sort().map(n => ({ n, nombre: `Era ${romano(n)}` }));
    const r = hud.recursosActuales;
    const hechas = techs.filter(t => investigadas.has(t.id)).length;

    const columnas = eras.map(er => {
      const lista = techs.filter(t => (numero(t.era) || 1) === er.n);
      const bloqueada = er.n > eraActual;
      return h('section', { class: `cd-lab-columna ${bloqueada ? 'cd-bloqueada' : ''}`, vars: { '--era-color': txt(er.color, '#00e5ff') } },
        h('header', { class: 'cd-lab-col-cab' },
          h('span', { class: 'cd-lab-emblema', html: emblemaEra(er.n, txt(er.color, '#00e5ff'), 34) }),
          h('div', null,
            h('div', { class: 'cd-lab-col-era', text: `Era ${romano(er.n)}` }),
            h('div', { class: 'cd-lab-col-nombre', text: txt(er.nombre) }))),
        h('div', { class: 'cd-lab-lista' },
          lista.length ? lista.map(t => tarjeta(t)) : h('div', { class: 'cd-lab-vacio', text: 'Sin tecnologías en esta era' })));
    });

    function tarjeta(t) {
      const costo = limpiarCosto(t.costo);
      let estado, etiqueta;
      if (investigadas.has(t.id)) { estado = 'hecha'; etiqueta = 'Investigada'; }
      else if ((numero(t.era) || 1) > eraActual) { estado = 'bloqueada'; etiqueta = `Requiere era ${romano(numero(t.era))}`; }
      else if (!puede(costo)) { estado = 'pobre'; etiqueta = 'Recursos insuficientes'; }
      else { estado = 'disponible'; etiqueta = 'Disponible'; }
      const activa = estado === 'disponible';
      const b = h('button', {
        class: `cd-tech cd-tech-${estado}`, type: 'button',
        'aria-disabled': activa ? 'false' : 'true',
        'aria-label': `${txt(t.nombre)}. ${etiqueta}. ${txt(t.descripcion)}`,
        onclick: () => { if (activa) { b.classList.add('cd-elegida'); setTimeout(() => fin(t.id), 260); } else destello(b, 'cd-denegado', 400); }
      },
      h('span', { class: 'cd-tech-ico', 'aria-hidden': 'true' }, grabado(claveTecnologia(t))),
      h('span', { class: 'cd-tech-cuerpo' },
        h('span', { class: 'cd-tech-nombre', text: txt(t.nombre) }),
        h('span', { class: 'cd-tech-desc', text: txt(t.descripcion) }),
        efectoTexto(t.efecto) ? h('span', { class: 'cd-tech-efecto', text: efectoTexto(t.efecto) }) : null,
        h('span', { class: 'cd-tech-pie' },
          estado === 'hecha' ? null : nodoCosto(costo, r),
          h('span', { class: 'cd-tech-estado' },
            ico(estado === 'hecha' ? ICONOS.check : estado === 'bloqueada' ? ICONOS.candado : estado === 'pobre' ? ICONOS.advertencia : ICONOS.matraz),
            etiqueta))));
      return b;
    }

    capa.el.append(marco('cd-modal-lab',
      h('header', { class: 'cd-lab-cab' },
        h('span', { class: 'cd-lab-cab-ico', html: ICONOS.matraz }),
        h('div', null,
          h('h2', { class: 'cd-modal-titulo', text: 'Laboratorio Forense' }),
          h('p', { class: 'cd-modal-sub', text: `Investiga tecnologías para mejorar tus herramientas · ${hechas} de ${techs.length} investigadas` })),
        h('div', { class: 'cd-lab-fondos' },
          h('span', { class: 'cd-lab-fondo' }, ico(ICONOS.presupuesto), fmt(r.presupuesto)),
          h('span', { class: 'cd-lab-fondo' }, ico(ICONOS.evidencia), fmt(r.evidencia))),
        h('button', { class: 'cd-btn-cerrar', type: 'button', 'aria-label': 'Cerrar laboratorio', onclick: () => fin(null) }, ico(ICONOS.cerrar))),
      h('span', { class: 'cd-filete', 'aria-hidden': 'true' }),
      h('div', { class: 'cd-lab-columnas' }, columnas),
      h('footer', { class: 'cd-lab-pie' },
        h('span', { class: 'cd-ley-tech cd-tech-disponible', text: 'Disponible' }),
        h('span', { class: 'cd-ley-tech cd-tech-hecha', text: 'Investigada' }),
        h('span', { class: 'cd-ley-tech cd-tech-pobre', text: 'Sin recursos' }),
        h('span', { class: 'cd-ley-tech cd-tech-bloqueada', text: 'Bloqueada por era' }),
        boton('Cerrar', { onclick: () => fin(null) }))));
    const primera = capa.el.querySelector('.cd-tech-disponible');
    if (primera) primera.setAttribute('data-autofoco', '');
    capa.enfocar();
  });
}

// ---------- Avanzar de era ----------
export function avanzarEra({ capas, datos, hud }, eraSig, ctx = {}) {
  return new Promise(resolver => {
    let capa;
    const fin = async v => { await capa.cerrar(320); resolver(!!v); };
    capa = capas.abrir({ clase: 'cd-capa-era', etiqueta: 'Avanzar de era', alTecla: ev => { if (ev.key === 'Escape') { ev.preventDefault(); fin(false); } } });
    const e = eraSig || {};
    const req = e.requisito || {};
    const r = hud.recursosActuales;
    const casos = numero(ctx.casosResueltos);
    const items = [
      { k: 'casos', nombre: 'Casos resueltos', tiene: casos, pide: numero(req.casos), icono: ICONOS.carpeta },
      { k: 'presupuesto', nombre: 'Presupuesto', tiene: numero(r.presupuesto), pide: numero(req.presupuesto), icono: ICONOS.presupuesto },
      { k: 'evidencia', nombre: 'Evidencia', tiene: numero(r.evidencia), pide: numero(req.evidencia), icono: ICONOS.evidencia }
    ].filter(x => x.pide > 0);
    const calculado = items.every(x => x.tiene >= x.pide);
    const ok = typeof ctx.puedePagar === 'boolean' ? ctx.puedePagar
      : typeof ctx.puedePagar === 'function' ? !!ctx.puedePagar(limpiarCosto({ presupuesto: req.presupuesto, evidencia: req.evidencia })) && casos >= numero(req.casos)
      : calculado;
    const desbloquea = arr(datos?.TECNOLOGIAS).filter(t => numero(t.era) === numero(e.n));
    const color = txt(e.color, '#00e5ff');
    capa.el.append(marco('cd-modal-era',
      h('div', { class: 'cd-era-halo', 'aria-hidden': 'true', vars: { '--era-color': color } }),
      h('div', { class: 'cd-era-grande', html: emblemaEra(numero(e.n) || 2, color, 112), vars: { '--era-color': color } }),
      h('div', { class: 'cd-era-etq', text: `Era ${romano(numero(e.n))} del Ciudadano Digital Seguro` }),
      h('h2', { class: 'cd-era-titulo', text: txt(e.nombre) }),
      e.subtitulo ? h('p', { class: 'cd-era-subtitulo', text: txt(e.subtitulo) }) : null,
      e.descripcion ? h('p', { class: 'cd-era-desc', text: txt(e.descripcion) }) : null,
      h('div', { class: 'cd-era-req' },
        h('div', { class: 'cd-era-req-titulo', text: 'Requisitos' }),
        items.length ? h('ul', null, items.map(x => {
          const cumple = x.tiene >= x.pide;
          return h('li', { class: cumple ? 'cd-cumple' : 'cd-falta' },
            h('span', { class: 'cd-era-req-estado' }, ico(cumple ? ICONOS.check : ICONOS.cruz)),
            ico(x.icono, 'cd-era-req-ico'),
            h('span', { class: 'cd-era-req-nombre', text: x.nombre }),
            h('span', { class: 'cd-era-req-valor cd-num', text: `${fmt(x.tiene)} / ${fmt(x.pide)}` }),
            h('span', { class: 'cd-era-req-barra' }, h('i', { style: { transform: `scaleX(${Math.min(1, x.tiene / x.pide)})` } })));
        })) : h('p', { class: 'cd-era-req-libre', text: 'Sin requisitos.' })),
      desbloquea.length ? h('div', { class: 'cd-era-desbloquea' },
        h('span', { class: 'cd-era-req-titulo', text: 'Desbloquea en el laboratorio' }),
        h('div', { class: 'cd-era-techs' }, desbloquea.map(t => h('span', { class: 'cd-era-tech', title: txt(t.descripcion) }, grabado(claveTecnologia(t)), txt(t.nombre))))) : null,
      !ok ? h('p', { class: 'cd-era-aviso' }, ico(ICONOS.advertencia), 'Aún no cumples todos los requisitos.') : null,
      h('div', { class: 'cd-modal-botones' },
        boton('Cancelar', { onclick: () => fin(false), autofoco: !ok }),
        boton(`Avanzar a ${txt(e.nombre, 'la siguiente era')}`, { variante: 'primario', icono: ICONOS.flecha, deshabilitado: !ok, autofoco: ok, onclick: () => fin(true) }))));
    capa.enfocar();
  });
}

// ---------- Final ----------
export function final({ capas, datos }, est = {}) {
  return new Promise(resolver => {
    const victoria = !!est.victoria;
    const F = datos?.FINAL || {};
    const eraObj = arr(datos?.ERAS).find(e => e.n === numero(est.era));
    const capa = capas.abrir({ clase: `cd-capa-final ${victoria ? 'cd-victoria' : 'cd-derrota'}`, etiqueta: victoria ? 'Victoria' : 'Derrota', alTecla: () => {} });
    const stats = [
      ['Casos resueltos', `${fmt(est.casos)} / ${fmt(est.total)}`, ICONOS.carpeta],
      ['Tiempo de juego', tiempo(est.tiempo), ICONOS.reloj],
      ['Precisión deductiva', `${fmt(est.precision)}%`, ICONOS.lupa],
      ['Evidencias analizadas', fmt(est.analizadas), ICONOS.escaner],
      ['Tecnologías', fmt(est.tecnologias), ICONOS.matraz],
      ['Era alcanzada', `${romano(numero(est.era))}${eraObj ? ` · ${eraObj.nombre}` : ''}`, ICONOS.escudo],
      ['Confianza final', fmt(est.confianza), ICONOS.confianza]
    ];
    capa.el.append(
      h('div', { class: 'cd-final-rayos', 'aria-hidden': 'true' }),
      marco('cd-modal-final',
        h('div', { class: 'cd-final-emblema', html: victoria ? emblemaEscudo(120) : emblemaLogo(110) }),
        h('div', { class: 'cd-final-etq', text: victoria ? 'Misión cumplida' : 'Misión fallida' }),
        h('h1', { class: 'cd-final-titulo', text: victoria ? txt(F.titulo, '¡Puerto Nexo está a salvo!') : 'La ciudad perdió la confianza' }),
        h('p', { class: 'cd-final-texto', text: victoria ? txt(F.texto) : 'La ciudadanía dejó de creer en la Central. Cada caso sin atender es una familia que queda sola frente al engaño. Vuelve a intentarlo: la ciudad te necesita.' }),
        h('div', { class: 'cd-final-stats' }, stats.map(([k, v, i], n) => h('div', { class: 'cd-final-stat', vars: { '--i': n } },
          ico(i), h('span', { class: 'cd-final-stat-valor cd-num', text: v }), h('span', { class: 'cd-final-stat-etq', text: k })))),
        F.cita ? h('blockquote', { class: 'cd-final-cita' }, h('p', { text: txt(F.cita) })) : null,
        h('div', { class: 'cd-modal-botones' },
          boton('Jugar de nuevo', { variante: 'monumental', icono: ICONOS.recargar, autofoco: true, onclick: async () => { await capa.cerrar(400); resolver(); } })),
        bloqueMarca({ ancho: 220, clase: 'cd-marca-final' })));
    capa.enfocar();
  });
}

// ---------- Pausa ----------
export function pausa({ capas }) {
  return new Promise(resolver => {
    let capa, ayuda = false;
    const seguir = async () => { await capa.cerrar(240); resolver(); };
    capa = capas.abrir({ clase: 'cd-capa-pausa', etiqueta: 'Juego en pausa', alTecla: ev => { if (ev.key === 'Escape') { ev.preventDefault(); ayuda ? verMenu() : seguir(); } } });
    const cuerpo = h('div', { class: 'cd-pausa-cuerpo' });
    function verMenu() {
      ayuda = false;
      vaciar(cuerpo).append(
        h('nav', { class: 'cd-pausa-botones' },
          boton('Continuar', { variante: 'primario', icono: ICONOS.jugar, autofoco: true, onclick: seguir }),
          boton('Cómo jugar', { icono: ICONOS.ayuda, onclick: verAyuda }),
          boton('Reiniciar partida', { variante: 'peligro', icono: ICONOS.recargar, onclick: async () => {
            if (await confirmar(capas, { titulo: '¿Reiniciar la partida?', texto: 'Perderás el progreso de esta partida.', si: 'Sí, reiniciar', no: 'Cancelar', peligro: true })) location.reload();
          } })));
      capa.enfocar();
    }
    function verAyuda() {
      ayuda = true;
      const filas = [
        ['Clic izquierdo', 'Seleccionar a la detective o un edificio'],
        ['Clic derecho', 'Con la detective seleccionada: ir al edificio o investigar su alerta'],
        ['W A S D / flechas', 'Mover la cámara (también con el mouse en los bordes)'],
        ['Rueda del mouse', 'Acercar o alejar'],
        ['Botón central', 'Arrastrar la cámara'],
        ['Minimapa', 'Clic o arrastre para saltar a una zona'],
        ['Atajos del panel', 'La tecla que aparece en cada botón de acción'],
        ['Esc', 'Pausa']
      ];
      vaciar(cuerpo).append(
        h('div', { class: 'cd-ayuda' },
          h('p', { class: 'cd-ayuda-intro', text: 'Atiende los incidentes antes de que venza su plazo. Envía a la detective, analiza la evidencia, deduce qué pasó y aprende el escudo táctico de cada caso. Con casos resueltos, presupuesto y evidencia avanzas de era desde la Central.' }),
          h('dl', { class: 'cd-ayuda-teclas' }, filas.map(([k, v]) => [h('dt', null, h('kbd', { text: k })), h('dd', { text: v })]))),
        h('div', { class: 'cd-modal-botones' }, boton('Volver', { icono: ICONOS.atras, autofoco: true, onclick: verMenu })));
      capa.enfocar();
    }
    capa.el.append(marco('cd-modal-pausa', titular('Pausa', 'La ciudad espera tus órdenes'), cuerpo, pieEscudo(MARCA.leyenda, 'cd-marca-pie-pausa')));
    verMenu();
  });
}
