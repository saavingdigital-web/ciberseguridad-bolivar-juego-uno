// CiberDetective · render realista de cada tipo de evidencia
// Todas las marcas son ficticias; el contenido llega de datos.CASOS (sección 6 del contrato).
import { h, ico, arr, txt, numero } from './util.js';
import { ICONOS } from './iconos.js';

// Detecta enlaces y dominios dentro de un texto y los resalta.
const RE_ENLACE = /((?:https?:\/\/|www\.)[^\s<>"']+|\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|co|net|org|info|xyz|top|site|online|app|ly|io|me|click|link|shop|live|biz|lat|gov)(?:\.[a-z]{2})?(?:\/[^\s<>"']*)?)/gi;

export function textoConEnlaces(texto, clase = 'cd-ev-enlace') {
  const t = txt(texto);
  const frag = document.createDocumentFragment();
  let ultimo = 0;
  t.replace(RE_ENLACE, (m, _g, i) => {
    let limpio = m, cola = '';
    while (/[.,;:!?)]$/.test(limpio)) { cola = limpio.slice(-1) + cola; limpio = limpio.slice(0, -1); }
    if (i > ultimo) frag.append(t.slice(ultimo, i));
    frag.append(h('span', { class: clase, text: limpio }));
    if (cola) frag.append(cola);
    ultimo = i + m.length;
    return m;
  });
  if (ultimo < t.length) frag.append(t.slice(ultimo));
  return frag;
}

const inicial = s => (txt(s, '?').replace(/[^\p{L}\p{N}+]/gu, '')[0] || '?').toUpperCase();
const hue = s => [...txt(s)].reduce((a, c) => (a * 31 + c.codePointAt(0)) % 360, 17);
const avatar = (nombre, clase = 'cd-ev-avatar') =>
  h('span', { class: clase, vars: { '--h': hue(nombre) }, 'aria-hidden': 'true', text: inicial(nombre) });

const fila = (etq, valor, clase = '') => valor == null || valor === '' ? null :
  h('div', { class: `cd-ev-fila ${clase}`.trim() }, h('span', { class: 'cd-ev-etq', text: etq }), h('span', { class: 'cd-ev-val', text: txt(valor) }));

// Palabras que suelen delatar algo raro: se colorean en ámbar o rojo.
const RE_MALO = /(?:^|[^\p{L}])(?:no|sin|ningun[oa]?)(?:[^\p{L}]|$)|inv[aá]lid|desconocid|sospech|fals[oa]|expirad|autofirmad|modificad|alterad|recient|hace \d+ (?:d[ií]as?|horas?|semanas?)/iu;
const RE_CERT_MALO = /(?:^|[^\p{L}])(?:no v[aá]lido|sin certificado|ninguno|no)(?:[^\p{L}]|$)|inv[aá]lid|expirad|autofirmad|revocad/iu;
const nivelTexto = v => RE_MALO.test(txt(v)) ? 'cd-malo' : '';

// ---------- SMS ----------
function sms(c) {
  const enlaces = arr(c.enlaces);
  // La hora puede venir como "12/10/2026 · 23:41": la barra de estado muestra solo la hora.
  const hora = txt(c.hora);
  const soloHora = (hora.match(/\d{1,2}:\d{2}/g) || []).pop() || '09:41';
  return h('div', { class: 'cd-ev-telefono' },
    h('div', { class: 'cd-ev-tel-estado' },
      h('span', { text: soloHora }),
      h('span', { class: 'cd-ev-tel-iconos' }, ico(ICONOS.senal), ico(ICONOS.bateria))),
    h('div', { class: 'cd-ev-tel-cabecera' },
      avatar(c.remitente),
      h('div', null,
        h('div', { class: 'cd-ev-tel-nombre', text: txt(c.remitente, 'Número desconocido') }),
        h('div', { class: 'cd-ev-tel-sub', text: 'Mensaje de texto · SMS' }))),
    h('div', { class: 'cd-ev-tel-cuerpo' },
      h('div', { class: 'cd-ev-tel-fecha', text: hora === soloHora ? `Hoy ${hora}` : hora || 'Hoy' }),
      h('div', { class: 'cd-ev-burbuja cd-entrante' }, textoConEnlaces(c.texto)),
      enlaces.length ? h('div', { class: 'cd-ev-tel-enlaces' },
        enlaces.map(u => h('div', { class: 'cd-ev-vista-enlace' },
          h('span', { class: 'cd-ev-vista-ico', 'aria-hidden': 'true' }, ico(ICONOS.escaner)),
          h('span', { class: 'cd-ev-enlace', text: txt(u) })))) : null),
    h('div', { class: 'cd-ev-tel-entrada', 'aria-hidden': 'true' }, h('span', { text: 'Mensaje de texto' })));
}

// ---------- Chat ----------
function chat(c) {
  const app = txt(c.app, 'ChatVerde');
  return h('div', { class: 'cd-ev-chat', vars: { '--h': hue(app) } },
    h('div', { class: 'cd-ev-chat-barra' },
      h('span', { class: 'cd-ev-chat-app', text: app }),
      h('span', { class: 'cd-ev-chat-cifrado' }, ico(ICONOS.candado), ' cifrado')),
    h('div', { class: 'cd-ev-chat-contacto' },
      avatar(c.contacto),
      h('div', null,
        h('div', { class: 'cd-ev-chat-nombre', text: txt(c.contacto, 'Contacto') }),
        h('div', { class: 'cd-ev-chat-sub', text: 'en línea' }))),
    h('div', { class: 'cd-ev-chat-cuerpo' },
      arr(c.mensajes).map(m => {
        const propio = m?.de === 'victima';
        return h('div', { class: `cd-ev-burbuja ${propio ? 'cd-saliente' : 'cd-entrante'}` },
          h('div', null, textoConEnlaces(m?.texto)),
          m?.hora ? h('span', { class: 'cd-ev-burbuja-hora', text: `${m.hora}${propio ? ' ✓✓' : ''}` }) : null);
      })));
}

// ---------- Correo ----------
function correo(c) {
  const adj = arr(c.adjuntos);
  return h('div', { class: 'cd-ev-correo' },
    h('div', { class: 'cd-ev-ventana-barra' },
      h('span', { class: 'cd-ev-puntos', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      h('span', { class: 'cd-ev-ventana-titulo', text: 'Correo · Bandeja de entrada' })),
    h('div', { class: 'cd-ev-correo-asunto', text: txt(c.asunto, '(sin asunto)') }),
    h('div', { class: 'cd-ev-correo-cab' },
      avatar(c.de),
      h('div', { class: 'cd-ev-correo-campos' },
        h('div', null, h('b', { text: 'De: ' }), textoConEnlaces(c.de, 'cd-ev-remitente')),
        h('div', null, h('b', { text: 'Para: ' }), txt(c.para, 'mí')),
        c.fecha ? h('div', { class: 'cd-ev-tenue' }, txt(c.fecha)) : null)),
    h('div', { class: 'cd-ev-correo-cuerpo' }, textoConEnlaces(c.cuerpo)),
    adj.length ? h('div', { class: 'cd-ev-adjuntos' },
      adj.map(a => h('span', { class: 'cd-ev-adjunto' }, ico(ICONOS.clip), txt(typeof a === 'object' ? a?.nombre : a)))) : null);
}

// ---------- URL ----------
function partesUrl(u) {
  const s = txt(u).trim();
  try {
    const url = new URL(/^[a-z]+:\/\//i.test(s) ? s : `https://${s}`);
    const host = url.hostname;
    const p = host.split('.');
    // Dominio registrable aproximado (incluye ccTLD de dos niveles como .com.co)
    const n = p.length >= 3 && /^(com|net|org|gov|edu|co)$/.test(p[p.length - 2]) && p[p.length - 1].length === 2 ? 3 : 2;
    const base = p.slice(-n).join('.');
    const sub = p.slice(0, -n).join('.');
    return { protocolo: url.protocol.replace(':', ''), sub, base, resto: (url.pathname === '/' ? '' : url.pathname) + url.search + url.hash, valido: true };
  } catch {
    return { protocolo: '', sub: '', base: s, resto: '', valido: false };
  }
}

function url(c) {
  const real = partesUrl(c.real || c.mostrada);
  const cert = c.certificado;
  // El candado solo depende de la validez técnica del certificado (un sitio falso también puede tenerlo).
  const malCert = cert === false || real.protocolo === 'http' || (typeof cert === 'string' && RE_CERT_MALO.test(cert));
  const seguro = !malCert && cert != null && cert !== '';
  return h('div', { class: 'cd-ev-navegador' },
    h('div', { class: 'cd-ev-nav-pestanas' },
      h('span', { class: 'cd-ev-puntos', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      h('span', { class: 'cd-ev-nav-pestana', text: real.base || 'Página' })),
    h('div', { class: 'cd-ev-nav-barra' },
      h('span', { class: 'cd-ev-nav-flechas', 'aria-hidden': 'true', text: '‹ › ⟳' }),
      h('div', { class: `cd-ev-nav-direccion ${malCert ? 'cd-inseguro' : seguro ? 'cd-seguro' : ''}` },
        ico(malCert ? ICONOS.advertencia : ICONOS.candado, 'cd-ev-nav-candado'),
        malCert ? h('span', { class: 'cd-ev-nav-aviso', text: 'No seguro' }) : null,
        h('span', { class: 'cd-ev-url' },
          real.protocolo ? h('span', { class: 'cd-ev-url-tenue', text: `${real.protocolo}://` }) : null,
          real.sub ? h('span', { class: 'cd-ev-url-sub', text: `${real.sub}.` }) : null,
          h('mark', { class: 'cd-ev-url-dominio', text: real.base }),
          real.resto ? h('span', { class: 'cd-ev-url-tenue', text: real.resto }) : null))),
    h('div', { class: 'cd-ev-nav-cuerpo' },
      c.mostrada ? h('div', { class: 'cd-ev-nav-mostrada' },
        h('span', { class: 'cd-ev-etq', text: 'Texto del enlace que vio la víctima' }),
        h('span', { class: 'cd-ev-enlace', text: txt(c.mostrada) })) : null,
      h('div', { class: 'cd-ev-tabla-datos' },
        fila('Destino real', txt(c.real)),
        fila('Certificado', cert === true ? 'Válido' : cert === false ? 'No válido' : cert, nivelTexto(cert === false ? 'no' : cert)),
        fila('Dominio creado', c.creado, nivelTexto(c.creado)),
        fila('Observaciones', c.observaciones, 'cd-ev-obs'))));
}

// ---------- Extracto bancario ----------
function monto(v) {
  if (typeof v === 'number') {
    const s = Math.abs(v).toLocaleString('es-CO');
    return { texto: `${v < 0 ? '−' : '+'}$ ${s}`, negativo: v < 0, valor: v };
  }
  const t = txt(v);
  const neg = /^\s*[-−]/.test(t);
  const num = numero(t.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.'));
  return { texto: t, negativo: neg, valor: neg ? -Math.abs(num) : num };
}
function extracto(c) {
  const movs = arr(c.movimientos);
  let salida = 0;
  const filas = movs.map(m => {
    const mo = monto(m?.monto);
    if (mo.negativo) salida += Math.abs(mo.valor);
    return h('tr', { class: mo.negativo ? 'cd-debito' : 'cd-credito' },
      h('td', { text: txt(m?.fecha) }), h('td', { class: 'cd-mono', text: txt(m?.hora) }),
      h('td', { text: txt(m?.concepto) }), h('td', { class: 'cd-mono cd-ev-destino', text: txt(m?.destino, '—') }),
      h('td', { class: 'cd-mono cd-ev-monto', text: mo.texto }));
  });
  return h('div', { class: 'cd-ev-extracto' },
    h('div', { class: 'cd-ev-banco-cab' },
      h('span', { class: 'cd-ev-banco-logo', 'aria-hidden': 'true', text: '◈' }),
      h('div', null,
        h('div', { class: 'cd-ev-banco-nombre', text: txt(c.banco, 'Banco del Puerto') }),
        h('div', { class: 'cd-ev-tenue cd-mono', text: `Cuenta ${txt(c.cuenta, '**** ****')}` })),
      h('span', { class: 'cd-ev-banco-sello', text: 'Movimientos' })),
    h('div', { class: 'cd-ev-tabla-envoltura' },
      h('table', { class: 'cd-ev-tabla' },
        h('thead', null, h('tr', null, ['Fecha', 'Hora', 'Concepto', 'Destino', 'Monto'].map(t => h('th', { scope: 'col', text: t })))),
        h('tbody', null, filas))),
    salida ? h('div', { class: 'cd-ev-extracto-total' },
      h('span', { text: 'Total debitado' }), h('b', { class: 'cd-mono', text: `−$ ${Math.round(salida).toLocaleString('es-CO')}` })) : null);
}

// ---------- Registro del sistema ----------
const RE_EVENTO_MALO = /(fall|error|bloque|sospech|nuevo|desconoc|denegad|ataque|alerta|cambio|reset|exfil|inyec|fuerza|remoto|instal)/i;
function registro(c) {
  return h('div', { class: 'cd-ev-consola' },
    h('div', { class: 'cd-ev-ventana-barra cd-oscura' },
      h('span', { class: 'cd-ev-puntos', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      h('span', { class: 'cd-ev-ventana-titulo cd-mono', text: `${txt(c.sistema, 'sistema')} — registro` })),
    h('div', { class: 'cd-ev-consola-cuerpo cd-mono' },
      arr(c.lineas).map(l => h('div', { class: `cd-ev-log ${RE_EVENTO_MALO.test(`${l?.evento} ${l?.detalle}`) ? 'cd-alerta' : ''}` },
        h('span', { class: 'cd-ev-log-hora', text: `[${txt(l?.hora, '--:--')}]` }),
        h('span', { class: 'cd-ev-log-evento', text: txt(l?.evento) }),
        h('span', { class: 'cd-ev-log-detalle', text: txt(l?.detalle) }))),
      h('div', { class: 'cd-ev-log cd-ev-cursor', 'aria-hidden': 'true' }, h('span', { text: '$ ' }), h('i'))));
}

// ---------- Perfil social ----------
function perfil(c) {
  const red = txt(c.red, 'FotoGram');
  const pubs = c.publicaciones;
  const lista = Array.isArray(pubs) ? pubs : null;
  const cifra = n => typeof n === 'number' ? n.toLocaleString('es-CO') : txt(n, '0');
  return h('div', { class: 'cd-ev-perfil', vars: { '--h': hue(red) } },
    h('div', { class: 'cd-ev-perfil-red', text: red }),
    h('div', { class: 'cd-ev-perfil-portada' }),
    h('div', { class: 'cd-ev-perfil-cab' },
      avatar(c.nombreVisible || c.usuario, 'cd-ev-avatar cd-grande'),
      h('div', null,
        h('div', { class: 'cd-ev-perfil-nombre', text: txt(c.nombreVisible, 'Usuario') }),
        h('div', { class: 'cd-ev-perfil-usuario', text: `@${txt(c.usuario, 'usuario').replace(/^@/, '')}` }))),
    c.bio ? h('p', { class: 'cd-ev-perfil-bio' }, textoConEnlaces(c.bio)) : null,
    h('div', { class: 'cd-ev-perfil-cifras' },
      h('div', null, h('b', { text: lista ? String(lista.length) : cifra(pubs) }), h('span', { text: 'publicaciones' })),
      h('div', null, h('b', { text: cifra(c.seguidores) }), h('span', { text: 'seguidores' })),
      h('div', null, h('b', { text: cifra(c.siguiendo) }), h('span', { text: 'siguiendo' }))),
    c.creado ? h('div', { class: `cd-ev-perfil-creado ${nivelTexto(c.creado)}` }, ico(ICONOS.reloj), ' Cuenta creada: ', txt(c.creado)) : null,
    lista?.length ? h('div', { class: 'cd-ev-perfil-pubs' },
      lista.slice(0, 4).map(p => h('div', { class: 'cd-ev-perfil-pub' },
        typeof p === 'object' ? [h('span', { class: 'cd-ev-tenue', text: txt(p?.fecha) }), ' ', textoConEnlaces(p?.texto)] : textoConEnlaces(p)))) : null,
    c.observaciones ? h('div', { class: 'cd-ev-obs-caja' }, ico(ICONOS.advertencia), h('span', { text: txt(c.observaciones) })) : null);
}

// ---------- Archivo ----------
const RE_PERMISO_RIESGO = /(sms|mensaje|contacto|accesib|superpos|pantalla|admin|ubicaci|micr[oó]fono|c[aá]mara|llamad|almacen|instalar|notificaci|registro|teclado|banc)/i;
function archivo(c) {
  const nombre = txt(c.nombre, 'archivo');
  const ext = (nombre.match(/\.([a-z0-9]{1,5})$/i)?.[1] || 'BIN').toUpperCase();
  const permisos = arr(c.permisos);
  return h('div', { class: 'cd-ev-archivo' },
    h('div', { class: 'cd-ev-ventana-barra' },
      h('span', { class: 'cd-ev-puntos', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      h('span', { class: 'cd-ev-ventana-titulo', text: 'Propiedades del archivo' })),
    h('div', { class: 'cd-ev-archivo-cab' },
      h('div', { class: `cd-ev-archivo-ico cd-ext-${ext.toLowerCase()}`, 'aria-hidden': 'true' }, h('span', { text: ext })),
      h('div', null,
        h('div', { class: 'cd-ev-archivo-nombre cd-mono', text: nombre }),
        h('div', { class: 'cd-ev-tenue', text: txt(c.tamano) }))),
    h('div', { class: 'cd-ev-tabla-datos' },
      fila('Origen', c.origen, nivelTexto(c.origen)),
      fila('Firma digital', c.firma, nivelTexto(c.firma))),
    permisos.length ? h('div', { class: 'cd-ev-permisos' },
      h('div', { class: 'cd-ev-etq', text: `Permisos solicitados (${permisos.length})` }),
      h('div', { class: 'cd-ev-permisos-lista' },
        permisos.map(p => h('span', { class: `cd-ev-permiso ${RE_PERMISO_RIESGO.test(txt(p)) ? 'cd-riesgo' : ''}`, text: txt(p) })))) : null);
}

// ---------- Respaldo para tipos desconocidos ----------
function generico(c) {
  return h('div', { class: 'cd-ev-tabla-datos cd-ev-generico' },
    Object.entries(c || {}).map(([k, v]) => fila(k, typeof v === 'object' ? JSON.stringify(v) : v)));
}

const RENDER = { sms, chat, correo, url, extracto, registro, perfil, archivo };

export function renderEvidencia(ev) {
  const fn = RENDER[ev?.tipo] || generico;
  try { return fn(ev?.contenido || {}); }
  catch { return generico(ev?.contenido || {}); }
}
