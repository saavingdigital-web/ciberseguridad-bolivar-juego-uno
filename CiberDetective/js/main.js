// CiberDetective: Puerto Nexo · arranque, bucle y reglas de la partida
import * as datos from './datos/datos.js';
import { crearMundo } from './mundo/mundo.js';
import { crearInterfaz } from './ui/interfaz.js';
import { audio } from './audio/audio.js';
import { crearEstado } from './nucleo/estado.js';

const AJUSTES = {
  primerCaso: 8,            // s hasta el primer incidente
  entreCasos: 35,           // s entre incidentes nuevos
  maxActivos: 3,            // incidentes simultáneos
  regenEnergia: 6,          // energía por minuto (base)
  presupuestoPasivo: 10,    // presupuesto por minuto (base)
  perdidaVencido: 3,        // confianza por minuto por cada caso vencido
  penalFallo: 8             // confianza que se pierde al fallar una investigación
};

const ui = crearInterfaz({ raiz: document.getElementById('interfaz'), datos });
let mundo;
let estado;
let pausado = true;
let enInvestigacion = false;
let proximoCaso = AJUSTES.primerCaso;
let ultimoFrame = performance.now();

// ---------- Utilidades ----------
const caso = id => datos.CASOS.find(c => c.id === id);
const edificioInfo = id => mundo.edificios.get(id);
const sumaEfecto = tipo => [...estado.tecnologias]
  .map(id => datos.TECNOLOGIAS.find(t => t.id === id))
  .filter(t => t && t.efecto.tipo === tipo)
  .reduce((s, t) => s + t.efecto.valor, 0);

function refrescarRecursos() { ui.recursos(estado.recursos); }

function refrescarCasos() {
  ui.casosActivos([...estado.activos.values()].map(a => ({
    id: a.caso.id,
    titulo: a.caso.titulo,
    edificio: edificioInfo(a.caso.edificio)?.nombre ?? a.caso.edificio,
    urgencia: a.caso.urgencia,
    tiempoRestante: Math.max(0, Math.ceil(a.plazoRestante))
  })));
}

// ---------- Selección y panel inferior ----------
function seleccionarDetective() {
  estado.seleccion = 'detective';
  mundo.seleccionarDetective(true);
  audio.sfx('seleccion');
  const d = datos.DETECTIVE;
  const pendientes = [...estado.activos.values()];
  ui.seleccion({
    tipo: 'detective', id: 'detective', nombre: d.nombre, subtitulo: d.rango, retrato: d.retrato,
    descripcion: mundo.detective.ocupado ? 'En camino…' : 'Lista para recibir órdenes. Clic derecho sobre un edificio con alerta para investigar.',
    estado: `${pendientes.length} incidente(s) activo(s)`,
    acciones: pendientes.map((a, i) => ({
      id: `investigar:${a.caso.id}`, etiqueta: `Investigar: ${a.caso.titulo}`, icono: '🔍',
      atajo: String(i + 1), tooltip: `${edificioInfo(a.caso.edificio)?.nombre} · ${a.caso.resumen}`,
      deshabilitado: mundo.detective.ocupado
    })).concat([{ id: 'volver-central', etiqueta: 'Volver a la Central', icono: '🏛️', atajo: 'H', tooltip: 'Regresa a la base' }])
  });
}

function seleccionarEdificio(id) {
  estado.seleccion = id;
  mundo.seleccionarDetective(false);
  audio.sfx('click');
  const e = edificioInfo(id);
  if (!e) return;
  const activo = [...estado.activos.values()].find(a => a.caso.edificio === id);
  const acciones = [];
  if (activo) acciones.push({ id: `investigar:${activo.caso.id}`, etiqueta: 'Enviar a la detective', icono: '🔍', atajo: 'I', tooltip: activo.caso.resumen, deshabilitado: mundo.detective.ocupado });
  if (id === 'central') {
    const sig = datos.ERAS.find(er => er.n === estado.era + 1);
    acciones.push({ id: 'avanzar-era', etiqueta: sig ? `Avanzar a ${sig.nombre}` : 'Era máxima', icono: '⏫', atajo: 'E', deshabilitado: !sig, costo: sig?.requisito, tooltip: sig ? sig.descripcion : 'Has alcanzado la última era' });
  }
  if (id === 'laboratorio') acciones.push({ id: 'laboratorio', etiqueta: 'Investigar tecnologías', icono: '🧪', atajo: 'T', tooltip: 'Mejora tus herramientas forenses' });
  ui.seleccion({
    tipo: 'edificio', id, nombre: e.nombre, subtitulo: tipoLegible(e.tipo), retrato: iconoTipo(e.tipo),
    descripcion: activo ? `⚠ ${activo.caso.resumen}` : (estado.seguros.has(id) ? '🛡️ Asegurado: sin incidentes.' : 'Sin incidentes reportados.'),
    estado: activo ? `Incidente activo · ${Math.max(0, Math.ceil(activo.plazoRestante))} s` : '',
    acciones
  });
}

const tipoLegible = t => ({ central: 'Centro de mando', laboratorio: 'Investigación', banco: 'Finanzas', colegio: 'Educación', cibercafe: 'Comunidad gamer', cafe: 'Wi-Fi público', tienda: 'Comercio', torre: 'Telecomunicaciones', alcaldia: 'Gobierno', puerto: 'Logística', casa: 'Vivienda' }[t] ?? 'Edificio');
const iconoTipo = t => ({ central: '🏛️', laboratorio: '🧪', banco: '🏦', colegio: '🏫', cibercafe: '🎮', cafe: '☕', tienda: '📱', torre: '📡', alcaldia: '🏛️', puerto: '⚓', casa: '🏠' }[t] ?? '🏢');

function deseleccionar() {
  estado.seleccion = null;
  mundo.seleccionarDetective(false);
  ui.seleccion(null);
}

// ---------- Casos ----------
function siguienteCasoDisponible() {
  return datos.CASOS.find(c =>
    c.era <= estado.era &&
    !estado.casosResueltos.has(c.id) &&
    !estado.activos.has(c.id) &&
    ![...estado.activos.values()].some(a => a.caso.edificio === c.edificio));
}

function lanzarCaso(c) {
  const plazo = c.plazo + sumaEfecto('tiempo-casos');
  estado.activos.set(c.id, { caso: c, aparecio: estado.tiempo, plazoRestante: plazo, vencido: false });
  mundo.ponerAlerta(c.edificio, { nivel: c.urgencia, color: c.urgencia === 'alta' ? '#ff3b30' : '#ffb020' });
  audio.sfx('caso-nuevo');
  ui.notificar({
    titulo: `Nuevo incidente: ${c.titulo}`,
    texto: `${edificioInfo(c.edificio)?.nombre}: ${c.resumen}`,
    tipo: 'alerta',
    accion: { etiqueta: 'Ver', fn: () => { const e = edificioInfo(c.edificio); mundo.centrarCamara(e.posicion.x, e.posicion.z); seleccionarEdificio(c.edificio); } }
  });
  refrescarCasos();
  if (estado.seleccion === 'detective') seleccionarDetective();
}

async function ordenarInvestigar(idCaso) {
  const a = estado.activos.get(idCaso);
  if (!a || mundo.detective.ocupado || enInvestigacion) return;
  audio.sfx('orden');
  ui.notificar({ titulo: datos.DETECTIVE.nombre, texto: elegir(datos.DETECTIVE.frases.orden), tipo: 'info' });
  if (estado.seleccion === 'detective') seleccionarDetective();
  await mundo.moverDetective(a.caso.edificio);
  if (!estado.activos.has(idCaso)) return;
  abrirInvestigacion(a.caso);
}

async function abrirInvestigacion(c) {
  enInvestigacion = true;
  mundo.pausar(true);
  audio.musica('investigacion');
  audio.sfx('abrir');
  const resultado = await ui.investigacion(c, {
    energia: () => estado.recursos.energia,
    gastarEnergia: n => {
      if (estado.recursos.energia < n) return false;
      estado.recursos.energia -= n;
      estado.stats.analizadas++;
      refrescarRecursos();
      return true;
    },
    tecnologias: estado.tecnologias
  });
  estado.stats.aciertos += resultado.aciertos;
  estado.stats.preguntas += resultado.total;

  if (resultado.resuelto) {
    estado.activos.delete(c.id);
    estado.casosResueltos.add(c.id);
    estado.seguros.add(c.edificio);
    estado.sumar(c.recompensa);
    mundo.quitarAlerta(c.edificio);
    mundo.marcarSeguro(c.edificio);
    audio.sfx('resuelto');
    await ui.escudoTactico(c, resultado);
    proximoCaso = Math.min(proximoCaso, 6);
  } else {
    const fallos = (estado.casosFallidos.get(c.id) ?? 0) + 1;
    estado.casosFallidos.set(c.id, fallos);
    estado.sumar({ confianza: -AJUSTES.penalFallo });
    audio.sfx('error');
    ui.notificar({ titulo: 'Caso sin resolver', texto: 'Las conclusiones no cuadran con la evidencia. Revisa las pistas e inténtalo de nuevo.', tipo: 'error' });
  }
  refrescarRecursos();
  refrescarCasos();
  enInvestigacion = false;
  mundo.pausar(false);
  audio.musica(estado.activos.size ? 'tension' : 'exploracion');
  comprobarFin();
}

// ---------- Eras y tecnologías ----------
async function intentarAvanzarEra() {
  const sig = datos.ERAS.find(er => er.n === estado.era + 1);
  if (!sig) return;
  const req = sig.requisito;
  const ok = await ui.avanzarEra(sig, {
    casosResueltos: estado.casosResueltos.size,
    puedePagar: estado.puedePagar({ presupuesto: req.presupuesto, evidencia: req.evidencia }) && estado.casosResueltos.size >= req.casos
  });
  if (!ok) return;
  if (estado.casosResueltos.size < req.casos || !estado.pagar({ presupuesto: req.presupuesto, evidencia: req.evidencia })) {
    ui.notificar({ titulo: 'Requisitos incompletos', texto: `Necesitas ${req.casos} casos resueltos, ${req.presupuesto} 💰 y ${req.evidencia} 🔍.`, tipo: 'error' });
    audio.sfx('error');
    return;
  }
  estado.era = sig.n;
  ui.era(sig);
  mundo.nivelFirewall(sig.n);
  audio.sfx('era');
  ui.notificar({ titulo: `Era ${sig.n}: ${sig.nombre}`, texto: sig.descripcion, tipo: 'exito' });
  refrescarRecursos();
  if (estado.seleccion === 'central') seleccionarEdificio('central');
  proximoCaso = Math.min(proximoCaso, 5);
  comprobarFin();
}

async function abrirLaboratorio() {
  audio.sfx('abrir');
  mundo.pausar(true);
  const id = await ui.laboratorio(datos.TECNOLOGIAS, {
    investigadas: estado.tecnologias,
    puedePagar: costo => estado.puedePagar(costo),
    eraActual: estado.era
  });
  mundo.pausar(false);
  if (!id) return;
  const t = datos.TECNOLOGIAS.find(x => x.id === id);
  if (!t || estado.tecnologias.has(id) || t.era > estado.era || !estado.pagar(t.costo)) { audio.sfx('error'); return; }
  estado.tecnologias.add(id);
  if (t.efecto.tipo === 'energia-max') { estado.recursos.energiaMax += t.efecto.valor; estado.recursos.energia += t.efecto.valor; }
  audio.sfx('tecnologia');
  ui.notificar({ titulo: `Tecnología: ${t.nombre}`, texto: t.descripcion, tipo: 'exito' });
  refrescarRecursos();
}

// ---------- Fin de partida ----------
function comprobarFin() {
  if (estado.recursos.confianza <= 0) {
    pausado = true;
    audio.musica(null);
    ui.final({ victoria: false, ...resumenStats() }).then(() => location.reload());
    return;
  }
  if (estado.casosResueltos.size >= datos.CASOS.length && estado.era >= 4) {
    pausado = true;
    audio.musica('victoria');
    ui.final({ victoria: true, ...resumenStats() }).then(() => location.reload());
  }
}

function resumenStats() {
  return {
    casos: estado.casosResueltos.size,
    total: datos.CASOS.length,
    tiempo: Math.round(estado.tiempo),
    precision: estado.stats.preguntas ? Math.round(100 * estado.stats.aciertos / estado.stats.preguntas) : 0,
    analizadas: estado.stats.analizadas,
    tecnologias: estado.tecnologias.size,
    era: estado.era,
    confianza: Math.round(estado.recursos.confianza)
  };
}

const elegir = arr => arr[Math.floor(Math.random() * arr.length)];

// ---------- Acciones ----------
function ejecutarAccion(id) {
  if (!id) return;
  if (id.startsWith('investigar:')) return ordenarInvestigar(id.slice(11));
  if (id === 'avanzar-era') return intentarAvanzarEra();
  if (id === 'laboratorio') return abrirLaboratorio();
  if (id === 'volver-central' && !mundo.detective.ocupado) { audio.sfx('orden'); mundo.moverDetective('central'); }
}

// ---------- Bucle ----------
function bucle(ahora) {
  const dt = Math.min((ahora - ultimoFrame) / 1000, 0.1);
  ultimoFrame = ahora;

  if (!pausado && !enInvestigacion) {
    estado.tiempo += dt;
    const min = dt / 60;
    estado.sumar({
      energia: (AJUSTES.regenEnergia + sumaEfecto('regen-energia')) * min,
      presupuesto: (AJUSTES.presupuestoPasivo + sumaEfecto('presupuesto-pasivo')) * min,
      confianza: sumaEfecto('confianza-pasiva') * min
    });

    let vencidos = 0;
    estado.activos.forEach(a => {
      a.plazoRestante -= dt;
      if (a.plazoRestante <= 0) {
        vencidos++;
        if (!a.vencido) {
          a.vencido = true;
          audio.sfx('alerta');
          ui.notificar({ titulo: 'Plazo vencido', texto: `${a.caso.titulo}: la ciudadanía pierde confianza cada minuto.`, tipo: 'error' });
        }
      }
    });
    if (vencidos) estado.sumar({ confianza: -AJUSTES.perdidaVencido * vencidos * min });

    proximoCaso -= dt;
    if (proximoCaso <= 0) {
      proximoCaso = AJUSTES.entreCasos;
      if (estado.activos.size < AJUSTES.maxActivos) {
        const c = siguienteCasoDisponible();
        if (c) lanzarCaso(c);
      }
    }

    if (Math.floor(estado.tiempo) !== Math.floor(estado.tiempo - dt)) {
      refrescarRecursos();
      refrescarCasos();
      ui.reloj(estado.tiempo);
      if (estado.seleccion && estado.seleccion !== 'detective' && estado.activos.size) seleccionarEdificio(estado.seleccion);
      comprobarFin();
    }
  }

  mundo.actualizar(dt, ahora / 1000);
  mundo.renderizar();
  ui.minimapa(mundo.datosMinimapa(), {
    vista: mundo.vistaCamara(),
    alertas: [...estado.activos.values()].map(a => a.caso.edificio),
    detective: { x: mundo.detective.posicion.x, z: mundo.detective.posicion.z },
    seguros: [...estado.seguros]
  });
  requestAnimationFrame(bucle);
}

// ---------- Arranque ----------
async function iniciar() {
  ui.pantallaCarga(0, 'Iniciando sistemas…');
  mundo = await crearMundo({
    contenedor: document.getElementById('mundo'),
    alProgreso: (p, txt) => ui.pantallaCarga(p, txt)
  });
  estado = crearEstado(datos);
  window.addEventListener('resize', () => mundo.redimensionar());

  // Eventos del mundo
  mundo.al('click-detective', () => seleccionarDetective());
  mundo.al('click-edificio', ({ id, boton }) => {
    if (enInvestigacion) return;
    const activo = [...estado.activos.values()].find(a => a.caso.edificio === id);
    if (boton === 2 && estado.seleccion === 'detective') {
      if (activo) ordenarInvestigar(activo.caso.id);
      else if (!mundo.detective.ocupado) { audio.sfx('orden'); mundo.moverDetective(id); }
      return;
    }
    seleccionarEdificio(id);
  });
  mundo.al('click-suelo', ({ boton }) => { if (boton === 0) deseleccionar(); });
  mundo.al('hover', ({ id, tipo }) => { mundo.resaltar(tipo === 'edificio' ? id : null); });
  mundo.al('detective-llego', ({ id }) => {
    if (estado.seleccion === 'detective') seleccionarDetective();
    if (id !== 'central' && ![...estado.activos.values()].some(a => a.caso.edificio === id)) {
      ui.notificar({ titulo: datos.DETECTIVE.nombre, texto: elegir(datos.DETECTIVE.frases.llegada), tipo: 'info' });
    }
  });

  // Eventos de la interfaz
  ui.al('accion', ({ id }) => ejecutarAccion(id));
  ui.al('minimapa', ({ x, z }) => mundo.centrarCamara(x, z));
  ui.al('caso', ({ id }) => {
    const c = caso(id); if (!c) return;
    const e = edificioInfo(c.edificio);
    mundo.centrarCamara(e.posicion.x, e.posicion.z);
    seleccionarEdificio(c.edificio);
  });
  ui.al('pausa', ({ pausado: p }) => { pausado = p; mundo.pausar(p); });

  ui.ocultarCarga();
  requestAnimationFrame(bucle);   // la ciudad se ve viva detrás del menú

  // ?rapido salta menú e intro (útil para pruebas y revisiones visuales)
  const rapido = new URLSearchParams(location.search).has('rapido');
  window.cd = { mundo, estado, ui, datos, lanzarCaso, abrirInvestigacion };   // depuración desde la consola
  if (!rapido) {
    await ui.menuPrincipal();
    audio.iniciar();
    audio.ambiente(true);
    audio.musica('menu');
    await ui.intro(datos.INTRO);
  }

  const central = edificioInfo('central');
  mundo.centrarCamara(central.posicion.x, central.posicion.z, false);
  ui.recursos(estado.recursos);
  ui.era(datos.ERAS[0]);
  mundo.nivelFirewall(1);
  ui.casosActivos([]);
  estado.stats.inicio = performance.now();
  pausado = false;
  mundo.pausar(false);
  audio.musica('exploracion');
  seleccionarDetective();
}

iniciar().catch(err => {
  console.error(err);
  const el = document.getElementById('interfaz');
  el.style.pointerEvents = 'auto';
  el.innerHTML = `<div style="position:fixed;inset:0;display:grid;place-items:center;color:#fff;font:16px sans-serif;background:#0a0d14;padding:24px;text-align:center">
    <div><h2>No se pudo iniciar el juego</h2><p>${String(err && err.message || err)}</p></div></div>`;
});
