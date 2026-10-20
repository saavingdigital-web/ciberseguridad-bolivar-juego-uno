// CiberDetective · generador de retratos vectoriales (busto ilustrado, sin emoji)
// Rasgos variables y deterministas por nombre: tono de piel, peinado, color de pelo, ropa según el rol,
// edad (adolescente, adulto, mayor), accesorios, luz de borde cálida y fondo con marco.

let uid = 0;

// Tonos de piel (base, sombra, rubor) por modificador Fitzpatrick del emoji de los datos.
const PIELES = {
  '\u{1F3FB}': ['#f2d2b8', '#d8ab8e', '#e89a8a'],
  '\u{1F3FC}': ['#e6b892', '#c99470', '#d98872'],
  '\u{1F3FD}': ['#c98e63', '#a8704a', '#c0705a'],
  '\u{1F3FE}': ['#93603e', '#744629', '#8e4f3a'],
  '\u{1F3FF}': ['#613d27', '#4a2c1b', '#6e3a2a']
};
const PIELES_LISTA = Object.values(PIELES);

function hash(s) {
  let h = 2166136261;
  for (const c of String(s || '')) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function azar(semilla) {
  let s = semilla || 1;
  const f = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  f.elegir = a => a[Math.floor(f() * a.length)];
  return f;
}
const sombra = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * k))));
  return `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`;
};

/** Deduce rasgos a partir de la víctima del caso: { nombre, edad, rol, retrato (emoji) }. */
export function rasgosDeVictima(v = {}) {
  const emoji = String(v.retrato || '');
  const nombre = String(v.nombre || 'Persona');
  const r = azar(hash(nombre));
  let genero = null;
  if (/[\u{1F469}\u{1F467}\u{1F475}♀]/u.test(emoji)) genero = 'f';
  else if (/[\u{1F468}\u{1F466}\u{1F474}♂]/u.test(emoji)) genero = 'm';
  if (!genero) {
    const primero = nombre.trim().split(/\s+/)[0].toLowerCase();
    genero = /a$/.test(primero) && !['luca', 'josua', 'nicola'].includes(primero) ? 'f' : 'm';
  }
  const tonoEmoji = Object.keys(PIELES).find(k => emoji.includes(k));
  const piel = tonoEmoji ? PIELES[tonoEmoji] : r.elegir(PIELES_LISTA.slice(1, 4));
  const edad = Number(v.edad) || 30;
  return { nombre, genero, edad, piel, rol: String(v.rol || ''), r };
}

function ropaPorRol(rol, edad, r) {
  const t = rol.toLowerCase();
  if (/abuel|jubilad|pensionad/.test(t) || edad >= 62) return 'cardigan';
  if (/selecci[oó]n|volante|deport|f[uú]tbol/.test(t)) return 'deportivo';
  if (/cibercaf|gamer|pixel|jugador/.test(t)) return 'buzo';
  if (/comerciante|mercado|vendedor|tendero/.test(t)) return 'delantal';
  if (/coordinador|docente|profesor|rector|maestr/.test(t)) return 'blazer';
  if (/enfermer|m[eé]dic/.test(t)) return 'medico';
  if (/estudiante|colegio|grado|°/.test(t)) return r() < 0.75 ? 'uniforme' : 'buzo';
  return 'camiseta';
}

// ---------- Piezas ----------
const CX = 80, CY = 70;

function cara(rx, ry) {
  const x0 = CX - rx, x1 = CX + rx;
  return `M${x0} ${CY - 4}C${x0} ${CY - ry - 6} ${x1} ${CY - ry - 6} ${x1} ${CY - 4}` +
    `C${x1} ${CY + ry * 0.55} ${CX + rx * 0.45} ${CY + ry} ${CX} ${CY + ry}` +
    `C${CX - rx * 0.45} ${CY + ry} ${x0} ${CY + ry * 0.55} ${x0} ${CY - 4}Z`;
}

function peloAtras(estilo, rx, color) {
  const x0 = CX - rx, x1 = CX + rx;
  switch (estilo) {
    case 'largo': return `<path d="M${x0 - 7} 66C${x0 - 12} 22 ${x1 + 12} 22 ${x1 + 7} 66L${x1 + 10} 126C${x1 + 2} 134 ${x1 - 8} 128 ${x1 - 10} 118L${x0 + 10} 118C${x0 + 8} 128 ${x0 - 2} 134 ${x0 - 10} 126Z" fill="${color}"/>`;
    case 'melena': return `<path d="M${x0 - 6} 66C${x0 - 10} 24 ${x1 + 10} 24 ${x1 + 6} 66L${x1 + 7} 102C${x1 + 1} 108 ${x1 - 6} 104 ${x1 - 8} 98L${x0 + 8} 98C${x0 + 6} 104 ${x0 - 1} 108 ${x0 - 7} 102Z" fill="${color}"/>`;
    case 'cola': return `<path d="M${x1 - 2} 58C${x1 + 16} 62 ${x1 + 18} 92 ${x1 + 8} 116C${x1 + 4} 106 ${x1 + 2} 86 ${x1 - 6} 72Z" fill="${color}"/>`;
    case 'mono': return `<circle cx="${CX + 4}" cy="${CY - 38}" r="13" fill="${color}"/><path d="M${CX - 8} ${CY - 40}q12 -6 24 0" stroke="${sombra(color, 0.8)}" stroke-width="1.4" fill="none"/>`;
    default: return '';
  }
}

function peloDelante(estilo, rx, color, r) {
  const x0 = CX - rx, x1 = CX + rx;
  const brillo = `<path d="M${CX - 14} ${CY - 31}C${CX - 4} ${CY - 36} ${CX + 8} ${CY - 35} ${CX + 15} ${CY - 30}" stroke="#fff" stroke-opacity=".18" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  switch (estilo) {
    case 'corto':
      return `<path d="M${x0 - 1} 72C${x0 - 5} 26 ${x1 + 5} 26 ${x1 + 1} 72L${x1 - 2} 62C${x1 - 5} 52 ${CX + 12} 51 ${CX + 3} 48C${CX - 7} 55 ${x0 + 6} 52 ${x0 + 2} 64Z" fill="${color}"/>` + brillo;
    case 'rapado':
      return `<path d="M${x0} 66C${x0 - 2} 30 ${x1 + 2} 30 ${x1} 66C${x1 - 3} 54 ${CX + 14} 47 ${CX} 47C${CX - 14} 47 ${x0 + 3} 54 ${x0} 66Z" fill="${color}" opacity=".92"/>`;
    case 'rizado': {
      let s = `<path d="M${x0 - 1} 70C${x0 - 4} 32 ${x1 + 4} 32 ${x1 + 1} 70L${x1 - 4} 56C${CX + 8} 50 ${CX - 8} 50 ${x0 + 4} 56Z" fill="${color}"/>`;
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * (1.05 + i * 0.09);
        const x = CX + Math.cos(a) * (rx + 3), y = CY - 8 + Math.sin(a) * (rx + 6);
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(6 + r() * 2.5).toFixed(1)}" fill="${color}"/>`;
      }
      return s + `<g fill="none" stroke="${sombra(color, 1.6)}" stroke-opacity=".35" stroke-width="1">` +
        Array.from({ length: 7 }, (_, i) => `<path d="M${CX - 20 + i * 6.5} ${CY - 36 + (i % 2) * 4}q3 -3 6 0"/>`).join('') + '</g>';
    }
    case 'largo':
    case 'melena':
      return `<path d="M${x0 - 3} 80C${x0 - 7} 28 ${x1 + 7} 28 ${x1 + 3} 80C${x1 - 1} 66 ${x1 - 4} 54 ${CX + 6} 47C${CX - 2} 56 ${x0 + 10} 58 ${x0 + 3} 72Z" fill="${color}"/>` +
        `<path d="M${CX + 6} 47C${CX + 1} 54 ${CX - 4} 56 ${x0 + 8} 60" stroke="${sombra(color, 0.7)}" stroke-width="1.2" fill="none"/>` + brillo;
    case 'cola':
      return `<path d="M${x0 - 1} 72C${x0 - 4} 28 ${x1 + 4} 28 ${x1 + 1} 72C${x1 - 3} 58 ${CX + 14} 50 ${CX + 2} 48C${CX - 10} 50 ${x0 + 5} 56 ${x0 + 1} 68Z" fill="${color}"/>` +
        `<path d="M${x0 + 3} 62C${x0} 74 ${x0 + 1} 84 ${x0 + 4} 92" stroke="${color}" stroke-width="3.2" fill="none" stroke-linecap="round"/>` + brillo;
    case 'mono':
      return `<path d="M${x0} 70C${x0 - 3} 30 ${x1 + 3} 30 ${x1} 70C${x1 - 3} 56 ${CX + 12} 48 ${CX} 48C${CX - 12} 48 ${x0 + 3} 56 ${x0} 70Z" fill="${color}"/>` +
        `<g stroke="${sombra(color, 0.78)}" stroke-width="1" fill="none"><path d="M${CX - 16} ${CY - 26}q8 -6 16 -6"/><path d="M${CX + 2} ${CY - 32}q9 2 15 9"/></g>`;
    default: return '';
  }
}

function cuerpo(tipo, p, r, ids) {
  const hombros = 'M12 162C14 134 38 119 64 115L96 115C122 119 146 134 148 162Z';
  const cuello = `<path d="M69 96h22v24c-4 5-18 5-22 0Z" fill="${p[1]}"/>`;
  const sombraCuello = `<path d="M69 102c6 5 16 5 22 0v-5H69Z" fill="#000" opacity=".16"/>`;
  let ropa = '';
  switch (tipo) {
    case 'uniforme': {
      const insignia = r.elegir(['#1f4e8c', '#7a1f2b', '#1d5c3a']);
      ropa = `<path d="${hombros}" fill="#eeeee8"/>
        <path d="M64 115L80 132L96 115L92 112L80 122L68 112Z" fill="#fbfbf7" stroke="#c9c9c0" stroke-width="1"/>
        <path d="M80 122v40" stroke="#d6d6ce" stroke-width="1.2"/><circle cx="80" cy="138" r="1.4" fill="#c4c4ba"/><circle cx="80" cy="150" r="1.4" fill="#c4c4ba"/>
        <path d="M104 132h12v9c0 4-3 7-6 8-3-1-6-4-6-8Z" fill="${insignia}" stroke="#d4a94c" stroke-width="1.2"/>
        <path d="M110 135v8M106.5 139h7" stroke="#f6dc94" stroke-width="1"/>`;
      break;
    }
    case 'deportivo': {
      const c = r.elegir(['#c8102e', '#0b5ed7', '#e7a400', '#118a4a']);
      ropa = `<path d="${hombros}" fill="${c}"/>
        <path d="M66 115L80 134L94 115" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
        <path d="M30 128l14 34M130 128l-14 34" stroke="#fff" stroke-opacity=".75" stroke-width="3"/>
        <text x="110" y="152" font-family="Rajdhani, sans-serif" font-weight="700" font-size="16" fill="#fff" text-anchor="middle">${1 + Math.floor(r() * 23)}</text>`;
      break;
    }
    case 'buzo': {
      const c = r.elegir(['#3b4a5e', '#5a2a7a', '#2f5d50', '#7a3b2a', '#26324a']);
      ropa = `<path d="${hombros}" fill="${c}"/>
        <path d="M52 120C60 108 100 108 108 120C104 130 56 130 52 120Z" fill="${sombra(c, 0.75)}"/>
        <path d="M74 126v18M86 126v18" stroke="#e8e8e8" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="58" y="146" width="44" height="16" rx="3" fill="${sombra(c, 0.85)}"/>`;
      if (/pixel|gamer|cibercaf/.test(ids.rol)) {
        ropa += `<path d="M54 110C54 94 106 94 106 110" fill="none" stroke="#1a1d22" stroke-width="5" stroke-linecap="round"/>
          <rect x="47" y="104" width="12" height="16" rx="5" fill="#22262d" stroke="#00e5ff" stroke-width="1.4"/>
          <rect x="101" y="104" width="12" height="16" rx="5" fill="#22262d" stroke="#00e5ff" stroke-width="1.4"/>`;
      }
      break;
    }
    case 'delantal': {
      const blusa = r.elegir(['#e85d75', '#f2a541', '#3aa6a0', '#d9544d']);
      ropa = `<path d="${hombros}" fill="${blusa}"/>
        <g fill="#fff" opacity=".28">${Array.from({ length: 14 }, (_, i) => `<circle cx="${22 + (i % 7) * 19}" cy="${132 + Math.floor(i / 7) * 16 + (i % 2) * 6}" r="3"/>`).join('')}</g>
        <path d="M60 116l6 0 8 46h-12ZM100 116l-6 0-8 46h12Z" fill="#2f6b4a"/>
        <path d="M62 138h36l4 24H58Z" fill="#2f6b4a"/>
        <path d="M66 142h28" stroke="#f6dc94" stroke-width="1" stroke-dasharray="3 2" opacity=".7"/>`;
      break;
    }
    case 'blazer':
      ropa = `<path d="${hombros}" fill="#2b3a55"/>
        <path d="M68 115L80 140L92 115Z" fill="#f3efe6"/>
        <path d="M64 115L78 148L70 162L58 162L52 121ZM96 115L82 148L90 162L102 162L108 121Z" fill="#22304a"/>
        <path d="M66 116C70 132 74 146 80 160M94 116C90 132 86 146 80 160" stroke="#00b8d4" stroke-width="2.2" fill="none"/>
        <rect x="73" y="150" width="14" height="12" rx="1.5" fill="#f6f6f2" stroke="#00b8d4" stroke-width="1"/>
        <rect x="75" y="152" width="5" height="5" fill="#9fb4c8"/>`;
      break;
    case 'cardigan': {
      const c = r.elegir(['#8a4a5a', '#5d6b48', '#6a4e7e', '#9a6a3a']);
      ropa = `<path d="${hombros}" fill="${c}"/>
        <path d="M68 115L80 146L92 115Z" fill="#efe6d6"/>
        <path d="M68 116L80 162M92 116L80 162" stroke="${sombra(c, 0.7)}" stroke-width="2.2"/>
        <g fill="#e9d8b0">${[128, 140, 152].map(y => `<circle cx="${80 + (y - 116) * 0.08}" cy="${y}" r="2"/>`).join('')}</g>
        <g stroke="${sombra(c, 1.25)}" stroke-width="1" opacity=".5">${Array.from({ length: 8 }, (_, i) => `<path d="M${24 + i * 15} 140v20"/>`).join('')}</g>`;
      break;
    }
    case 'medico':
      ropa = `<path d="${hombros}" fill="#3aa6a0"/><path d="M66 115L80 136L94 115" fill="none" stroke="#2a827d" stroke-width="3"/>`;
      break;
    case 'detective':
      ropa = `<path d="${hombros}" fill="#c8963e"/>
        <path d="M66 115L80 150L94 115Z" fill="#1c2430"/>
        <path d="M60 114L76 152L64 162L50 162L44 124ZM100 114L84 152L96 162L110 162L116 124Z" fill="#a5762a"/>
        <path d="M60 114L76 152M100 114L84 152" stroke="#e8c27a" stroke-width="1" opacity=".7"/>
        <g fill="#5a3d12"><circle cx="58" cy="146" r="2.4"/><circle cx="102" cy="146" r="2.4"/></g>
        <path d="M30 140c6-6 12-8 18-8" stroke="#8a611f" stroke-width="1.4" fill="none"/>
        <path d="M64 108C70 118 90 118 96 108L98 120C90 128 70 128 62 120Z" fill="#19d8ea" filter="url(#${ids.brillo})"/>
        <path d="M64 108C70 118 90 118 96 108L98 120C90 128 70 128 62 120Z" fill="#19d8ea"/>
        <path d="M84 122l6 22-7 2-4-20Z" fill="#12b8c9"/>
        <path d="M66 112C72 120 88 120 94 112" stroke="#b8fbff" stroke-width="1" fill="none" opacity=".8"/>
        <path d="M108 132l5 3v6l-5 3-5-3v-6Z" fill="#f6dc94" stroke="#6e4c16" stroke-width=".8"/>`;
      break;
    default: {
      const c = r.elegir(['#4a6fa5', '#a55a4a', '#4a8a6a', '#6a5aa5']);
      ropa = `<path d="${hombros}" fill="${c}"/><path d="M66 115C70 124 90 124 94 115" fill="none" stroke="${sombra(c, 0.7)}" stroke-width="3"/>`;
    }
  }
  return cuello + sombraCuello + ropa;
}

function rostro({ rx, ry, p, pelo, edad, genero, expresion, gafas, ids, r }) {
  const ojoY = CY + 4;
  const sep = 10.5;
  const adolescente = edad < 20, mayor = edad >= 60;
  const ojoRx = adolescente ? 5.4 : 5, ojoRy = adolescente ? 3.7 : 3.3;
  const iris = r.elegir(['#3b2416', '#4a2f1c', '#2a1a10', '#5a3a1e']);
  const ojo = x => `<ellipse cx="${x}" cy="${ojoY}" rx="${ojoRx}" ry="${ojoRy}" fill="#fbf7f0"/>
    <circle cx="${x + 0.4}" cy="${ojoY + 0.3}" r="2.7" fill="${iris}"/><circle cx="${x + 0.4}" cy="${ojoY + 0.3}" r="1.2" fill="#0b0705"/>
    <circle cx="${x + 1.3}" cy="${ojoY - 0.8}" r=".85" fill="#fff"/>
    <path d="M${x - ojoRx - 0.5} ${ojoY - 0.2}Q${x} ${ojoY - ojoRy - 2.4} ${x + ojoRx + 0.5} ${ojoY - 0.2}" stroke="#2a1a10" stroke-width="${genero === 'f' ? 1.7 : 1.2}" fill="none" stroke-linecap="round"/>`;
  const cejaIn = expresion === 'decidida' ? 1.8 : expresion === 'preocupada' ? -2.2 : 0;
  const ceja = s => `<path d="M${CX + s * 16} ${ojoY - 9}Q${CX + s * 11} ${ojoY - 12.5} ${CX + s * 4.5} ${ojoY - 9.5 + cejaIn}" stroke="${mayor ? '#9a948c' : sombra(pelo, 0.9)}" stroke-width="${genero === 'f' ? 2.1 : 2.8}" fill="none" stroke-linecap="round"/>`;
  const boca = expresion === 'decidida'
    ? `<path d="M${CX - 6.5} ${CY + 25}Q${CX + 1} ${CY + 28} ${CX + 7.5} ${CY + 23.5}" stroke="${sombra(p[2], 0.7)}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : expresion === 'preocupada'
      ? `<path d="M${CX - 6} ${CY + 26}Q${CX} ${CY + 24} ${CX + 6} ${CY + 26}" stroke="${sombra(p[2], 0.65)}" stroke-width="2" fill="none" stroke-linecap="round"/>`
      : `<path d="M${CX - 6} ${CY + 25}Q${CX} ${CY + 27.5} ${CX + 6} ${CY + 25}" stroke="${sombra(p[2], 0.7)}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const labio = genero === 'f' && !adolescente ? `<path d="M${CX - 5} ${CY + 25.5}Q${CX} ${CY + 29} ${CX + 5} ${CY + 25.5}" fill="${sombra(p[2], 0.85)}" opacity=".55"/>` : '';
  const nariz = `<path d="M${CX - 0.5} ${ojoY + 3}Q${CX - 3.5} ${ojoY + 12} ${CX - 1} ${ojoY + 13.5}Q${CX + 2} ${ojoY + 14.5} ${CX + 4} ${ojoY + 12.5}" stroke="${p[1]}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  const rubor = `<g fill="${p[2]}" opacity="${genero === 'f' ? 0.32 : 0.18}"><ellipse cx="${CX - 15}" cy="${ojoY + 11}" rx="5.5" ry="3.4"/><ellipse cx="${CX + 15}" cy="${ojoY + 11}" rx="5.5" ry="3.4"/></g>`;
  const arrugas = mayor ? `<g stroke="${p[1]}" stroke-width="1" fill="none" opacity=".75" stroke-linecap="round">
      <path d="M${CX - 11} ${CY - 19}q11 -3 22 0"/><path d="M${CX - 8} ${CY - 15}q8 -2 16 0"/>
      <path d="M${CX - 9} ${ojoY + 16}q-3 5 -1 9"/><path d="M${CX + 9} ${ojoY + 16}q3 5 1 9"/>
      <path d="M${CX - sep - 8} ${ojoY + 1}l-3 -1.5M${CX - sep - 8} ${ojoY + 3}l-3 1"/><path d="M${CX + sep + 8} ${ojoY + 1}l3 -1.5M${CX + sep + 8} ${ojoY + 3}l3 1"/></g>` : '';
  const lentes = gafas ? `<g fill="rgba(200,230,255,.12)" stroke="#2a2420" stroke-width="1.6">
      <rect x="${CX - sep - 7.5}" y="${ojoY - 5.5}" width="15" height="11" rx="3.5"/><rect x="${CX + sep - 7.5}" y="${ojoY - 5.5}" width="15" height="11" rx="3.5"/>
      <path d="M${CX - 3} ${ojoY - 1}q3 -2 6 0" fill="none"/></g>
      <path d="M${CX - sep - 5} ${ojoY - 3.5}l3 -1" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>` : '';
  const aretes = genero === 'f' && !adolescente ? `<circle cx="${CX - rx - 0.5}" cy="${CY + 14}" r="1.8" fill="#f6dc94"/><circle cx="${CX + rx + 0.5}" cy="${CY + 14}" r="1.8" fill="#f6dc94"/>` : '';
  return `<ellipse cx="${CX - rx}" cy="${CY + 5}" rx="4.6" ry="7.2" fill="${p[1]}"/><ellipse cx="${CX + rx}" cy="${CY + 5}" rx="4.6" ry="7.2" fill="${p[1]}"/>
    <path d="${cara(rx, ry)}" fill="${p[0]}"/>
    <path d="${cara(rx, ry)}" fill="url(#${ids.mod})"/>
    ${rubor}${arrugas}${nariz}${labio}${boca}${ojo(CX - sep)}${ojo(CX + sep)}${ceja(-1)}${ceja(1)}${lentes}${aretes}`;
}

function lienzo({ ids, fondo, contenido, etiqueta, borde }) {
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${etiqueta.replace(/"/g, '')}" preserveAspectRatio="xMidYMid slice" class="cd-retrato-svg">
  <defs>
    <radialGradient id="${ids.fondo}" cx=".42" cy=".38" r=".85"><stop offset="0" stop-color="${fondo[0]}"/><stop offset=".65" stop-color="${fondo[1]}"/><stop offset="1" stop-color="${fondo[2]}"/></radialGradient>
    <linearGradient id="${ids.mod}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
    <linearGradient id="${ids.borde}" x1="0" y1="0" x2="1" y2="0"><stop offset=".55" stop-color="#000"/><stop offset=".85" stop-color="#fff"/></linearGradient>
    <mask id="${ids.mascara}"><rect width="160" height="160" fill="url(#${ids.borde})"/></mask>
    <filter id="${ids.brillo}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
    <radialGradient id="${ids.vineta}" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
    <linearGradient id="${ids.luz}" x1="0" y1=".2" x2="1" y2=".8"><stop offset="0" stop-color="#ffb468" stop-opacity=".46"/><stop offset=".38" stop-color="#ffc58a" stop-opacity=".12"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0a1c2a" stop-opacity=".42"/></linearGradient>
    <radialGradient id="${ids.foco}" cx=".3" cy=".34" r=".5"><stop offset="0" stop-color="#ffd7a3" stop-opacity=".30"/><stop offset="1" stop-color="#ffd7a3" stop-opacity="0"/></radialGradient>
    <filter id="${ids.grano}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${ids.semilla}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .5"/></feComponentTransfer></filter>
  </defs>
  <rect width="160" height="160" fill="url(#${ids.fondo})"/>
  ${fondo[3] || ''}
  ${contenido}
  <g mask="url(#${ids.mascara})" fill="none" stroke="${borde}" stroke-width="2.2" opacity=".75">${fondo.rim || ''}</g>
  <ellipse cx="${CX - 4}" cy="${CY + 36}" rx="19" ry="7" fill="#000" opacity=".12" transform="translate(0 6)"/>
  <rect width="160" height="160" fill="url(#${ids.luz})"/>
  <rect width="160" height="160" fill="url(#${ids.foco})"/>
  <rect width="160" height="160" filter="url(#${ids.grano})" opacity=".55" style="mix-blend-mode:overlay"/>
  <rect width="160" height="160" fill="url(#${ids.vineta})"/>
</svg>`;
}

function nuevosIds() {
  const n = ++uid;
  return { fondo: `cdRf${n}`, mod: `cdRm${n}`, borde: `cdRb${n}`, mascara: `cdRk${n}`, brillo: `cdRg${n}`, vineta: `cdRv${n}`, luz: `cdRl${n}`, foco: `cdRo${n}`, grano: `cdRn${n}`, semilla: (n * 7) % 97 + 3 };
}

/** Retrato de una víctima o ciudadano a partir de { nombre, edad, rol, retrato }. */
export function retratoPersona(victima = {}, { expresion = 'preocupada' } = {}) {
  const t = rasgosDeVictima(victima);
  const { r, genero, edad, piel } = t;
  const ids = { ...nuevosIds(), rol: t.rol.toLowerCase() };
  const mayor = edad >= 60, adolescente = edad < 20;
  const oscura = piel === PIELES['\u{1F3FE}'] || piel === PIELES['\u{1F3FF}'];
  let pelo = mayor ? r.elegir(['#d9d4cc', '#c4beb5', '#e8e4dd'])
    : oscura ? r.elegir(['#15100c', '#1d140e', '#241812'])
      : r.elegir(['#2a1a12', '#3b2416', '#4e3220', '#1c1410', '#6a4428']);
  let estilo;
  if (genero === 'f') estilo = mayor ? 'mono' : r.elegir(adolescente ? ['largo', 'cola', 'largo', 'melena'] : ['melena', 'cola', 'largo']);
  else estilo = mayor ? 'rapado' : oscura ? r.elegir(['rizado', 'rapado', 'rizado']) : r.elegir(['corto', 'corto', 'rizado', 'rapado']);
  const rx = adolescente ? 24.5 : 25.5, ry = adolescente ? 29.5 : 31;
  const gafas = mayor || /coordinador|docente|profesor/.test(ids.rol) || r() < 0.12;
  const tipoRopa = ropaPorRol(t.rol, edad, r);
  const fondo = [r.elegir(['#2c5262', '#33505e', '#2e4a5a']), '#152a35', '#070d12'];
  fondo[3] = `<g opacity=".18" fill="#ffc58a">${Array.from({ length: 7 }, (_, i) => `<rect x="${8 + i * 22}" y="${96 - (i % 3) * 14}" width="14" height="${70 + (i % 3) * 14}"/>`).join('')}</g>`;
  fondo.rim = `<path d="${cara(rx, ry)}"/><path d="M12 162C14 134 38 119 64 115L96 115C122 119 146 134 148 162"/>`;
  const contenido = peloAtras(estilo, rx, pelo) + cuerpo(tipoRopa, piel, r, ids) +
    rostro({ rx, ry, p: piel, pelo, edad, genero, expresion, gafas, ids, r }) + peloDelante(estilo, rx, pelo, r);
  return lienzo({ ids, fondo, contenido, etiqueta: `Retrato de ${t.nombre}`, borde: '#ffc58a' });
}

/** Retrato de la detective Valeria Ríos (gabardina ocre, bufanda cian, auricular). */
export function retratoDetective(det = {}) {
  const ids = { ...nuevosIds(), rol: 'detective' };
  const r = azar(hash('valeria'));
  const piel = PIELES['\u{1F3FD}'];
  const pelo = '#1e130d';
  const rx = 25, ry = 30.5;
  const fondo = ['#1f4a5a', '#0e2531', '#050a0f'];
  fondo[3] = `<g stroke="#00e5ff" stroke-opacity=".14" stroke-width=".8">${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${20 + i * 16}H160"/><path d="M${i * 20} 0V160"/>`).join('')}</g>
    <circle cx="128" cy="34" r="16" fill="none" stroke="#00e5ff" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="3 3"/>
    <circle cx="128" cy="34" r="6" fill="#00e5ff" opacity=".18"/>`;
  fondo.rim = `<path d="${cara(rx, ry)}"/><path d="M12 162C14 134 38 119 64 115L96 115C122 119 146 134 148 162"/>`;
  const auricular = `<path d="M${CX + rx - 1} ${CY + 2}q6 2 4 10" stroke="#20262e" stroke-width="2.4" fill="none"/><circle cx="${CX + rx + 2}" cy="${CY + 12}" r="2.4" fill="#00e5ff" filter="url(#${ids.brillo})"/><circle cx="${CX + rx + 2}" cy="${CY + 12}" r="1.5" fill="#bffbff"/>`;
  const contenido = peloAtras('cola', rx, pelo) + cuerpo('detective', piel, r, ids) +
    rostro({ rx, ry, p: piel, pelo, edad: 34, genero: 'f', expresion: 'decidida', gafas: false, ids, r }) +
    peloDelante('cola', rx, pelo, r) + auricular;
  return lienzo({ ids, fondo, contenido, etiqueta: `Retrato de ${det.nombre || 'Valeria Ríos'}`, borde: '#ffc58a' });
}
