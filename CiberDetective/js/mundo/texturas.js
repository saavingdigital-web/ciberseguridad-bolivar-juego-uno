// Texturas procedurales en canvas (todo el arte es original y se genera al cargar)
import * as THREE from 'three';
import { crearAzar } from './util.js';

let ANISO = 4;
export function configurarTexturas(renderer) {
  ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());
}

function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(canvas, { srgb = true, repetir = true, mip = true } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repetir) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = ANISO;
  t.generateMipmaps = mip;
  t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

function grano(ctx, w, h, fuerza, az, mono = true) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = (az() - 0.5) * fuerza;
    d[i] = Math.max(0, Math.min(255, d[i] + r));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + (mono ? r : (az() - 0.5) * fuerza)));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + (mono ? r : (az() - 0.5) * fuerza)));
  }
  ctx.putImageData(img, 0, 0);
}

function manchas(ctx, w, h, n, az, color, rmin, rmax, alfa) {
  for (let i = 0; i < n; i++) {
    const x = az() * w, y = az() * h, r = rmin + az() * (rmax - rmin);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('A', String(alfa)));
    g.addColorStop(1, color.replace('A', '0'));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
}

function rectRedondo(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// =====================================================================
// ATLAS DE FACHADAS: 5 columnas x 4 filas de celdas de 256 px (1 vano x 1 piso)
// fila 0: colonial piso alto · fila 1: colonial planta baja
// fila 2: moderno planta baja · fila 3: moderno piso alto · columna 4: muro liso
// Se generan 3 lienzos alineados: color, máscara de tinte (blanco = pared) y emisivo.
// =====================================================================
export const ATLAS = { cols: 5, filas: 4 };
export function celdaAtlas(col, fila) {
  const u0 = col / ATLAS.cols, u1 = (col + 1) / ATLAS.cols;
  const v1 = 1 - fila / ATLAS.filas, v0 = 1 - (fila + 1) / ATLAS.filas;
  const e = 0.002; // margen contra sangrado
  return [u0 + e, v0 + e, u1 - e, v1 - e];
}

export function texturaFachadas() {
  const C = 256, W = C * ATLAS.cols, H = C * ATLAS.filas;
  const [cA, a] = lienzo(W, H);
  const [cM, m] = lienzo(W, H);
  const [cE, e] = lienzo(W, H);
  const az = crearAzar(77);

  // Pared base: yeso claro con ruido (se tiñe con el color de la casa)
  a.fillStyle = '#f4f1ea'; a.fillRect(0, 0, W, H);
  m.fillStyle = '#fff'; m.fillRect(0, 0, W, H);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  grano(a, W, H, 18, az);
  // humedad y desgaste
  manchas(a, W, H, 160, az, 'rgba(120,105,85,A)', 8, 40, 0.10);

  const cx = (col) => col * C, cy = (fila) => fila * C;
  // Dibuja en color y marca en máscara (sin tinte)
  const sinTinte = (x, y, w, h) => { m.fillStyle = '#000'; m.fillRect(x, y, w, h); };
  const parcial = (x, y, w, h, v) => { m.fillStyle = `rgb(${v},${v},${v})`; m.fillRect(x, y, w, h); };
  const luz = (x, y, w, h, col1 = '#ffcf8a', col2 = '#ff9f45') => {
    const g = e.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, col1); g.addColorStop(1, col2);
    e.fillStyle = g; e.fillRect(x, y, w, h);
  };

  function persiana(x, y, w, h, color) {
    a.fillStyle = color; a.fillRect(x, y, w, h);
    a.fillStyle = 'rgba(0,0,0,0.35)';
    for (let yy = y + 4; yy < y + h - 2; yy += 6) a.fillRect(x + 3, yy, w - 6, 2);
    a.fillStyle = 'rgba(255,255,255,0.12)';
    for (let yy = y + 6; yy < y + h - 2; yy += 6) a.fillRect(x + 3, yy, w - 6, 1);
    a.strokeStyle = 'rgba(0,0,0,0.5)'; a.lineWidth = 2; a.strokeRect(x + 1, y + 1, w - 2, h - 2);
    sinTinte(x, y, w, h);
  }
  function marco(x, y, w, h, grosor = 9, color = '#e4dccb') {
    a.fillStyle = color; a.fillRect(x - grosor, y - grosor, w + grosor * 2, h + grosor * 2);
    a.fillStyle = 'rgba(0,0,0,0.18)'; a.fillRect(x - grosor, y + h + grosor - 3, w + grosor * 2, 3);
    sinTinte(x - grosor, y - grosor, w + grosor * 2, h + grosor * 2);
  }
  function vidrioOscuro(x, y, w, h) {
    const g = a.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#2b3440'); g.addColorStop(0.5, '#47566a'); g.addColorStop(1, '#1d232c');
    a.fillStyle = g; a.fillRect(x, y, w, h); sinTinte(x, y, w, h);
  }
  function interiorIluminado(x, y, w, h) {
    const g = a.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, '#ffd9a0'); g.addColorStop(1, '#c97a3a');
    a.fillStyle = g; a.fillRect(x, y, w, h); sinTinte(x, y, w, h);
    luz(x, y, w, h);
    // cortina
    a.fillStyle = 'rgba(255,240,220,0.55)'; a.fillRect(x, y, w * 0.28, h);
    e.fillStyle = 'rgba(255,220,160,0.6)'; e.fillRect(x, y, w * 0.28, h);
  }
  function reja(x, y, w, h) {
    a.strokeStyle = '#15161a'; a.lineWidth = 3;
    for (let xx = x + 6; xx < x + w; xx += 11) { a.beginPath(); a.moveTo(xx, y); a.lineTo(xx, y + h); a.stroke(); }
    for (const yy of [y + 8, y + h * 0.5, y + h - 8]) { a.beginPath(); a.moveTo(x, yy); a.lineTo(x + w, yy); a.stroke(); }
  }
  function moldura(fila, alto = 10) {
    // franja de entrepiso inferior (moldura clara)
    for (let col = 0; col < ATLAS.cols; col++) {
      const y = cy(fila) + C - alto;
      a.fillStyle = '#e8e0cf'; a.fillRect(cx(col), y, C, alto);
      a.fillStyle = 'rgba(0,0,0,0.2)'; a.fillRect(cx(col), y + alto - 2, C, 2);
      sinTinte(cx(col), y, C, alto);
    }
  }
  function zocalo(fila, alto = 52) {
    for (let col = 0; col < ATLAS.cols; col++) {
      const y = cy(fila) + C - alto;
      a.fillStyle = 'rgba(70,55,40,0.55)'; a.fillRect(cx(col), y, C, alto);
      a.fillStyle = 'rgba(0,0,0,0.25)'; a.fillRect(cx(col), y, C, 3);
      parcial(cx(col), y, C, alto, 255); // sigue tiñéndose (oscurecido)
    }
  }

  const colPersiana = ['#2f5d3a', '#5a3a22', '#24476b', '#2a7f80'];

  // ---------- Fila 0: colonial piso alto ----------
  {
    const f = 0;
    moldura(f, 12);
    // v0: puerta-balcón cerrada (persianas verdes)
    let x = cx(0) + 86, y = cy(f) + 46, w = 84, h = 196;
    marco(x, y, w, h, 10);
    persiana(x, y, w / 2, h, colPersiana[0]); persiana(x + w / 2, y, w / 2, h, colPersiana[0]);
    a.fillStyle = '#e4dccb'; a.fillRect(x - 20, y - 30, w + 40, 14); sinTinte(x - 20, y - 30, w + 40, 14);
    // v1: ventana con persianas abiertas e interior iluminado
    x = cx(1) + 88; y = cy(f) + 60; w = 80; h = 150;
    marco(x, y, w, h, 10);
    interiorIluminado(x, y, w, h);
    persiana(x - 44, y, 30, h, colPersiana[1]); persiana(x + w + 14, y, 30, h, colPersiana[1]);
    a.fillStyle = '#d9cfba'; a.fillRect(x - 16, y + h + 8, w + 32, 10); sinTinte(x - 16, y + h + 8, w + 32, 10);
    // v2: ventana con reja de hierro
    x = cx(2) + 90; y = cy(f) + 62; w = 76; h = 140;
    marco(x, y, w, h, 9);
    vidrioOscuro(x, y, w, h);
    persiana(x + 4, y + 4, w / 2 - 4, h - 8, colPersiana[2]);
    reja(x - 6, y - 6, w + 12, h + 12);
    // v3: puerta-balcón abierta e iluminada (persianas azul)
    x = cx(3) + 86; y = cy(f) + 46; w = 84; h = 196;
    marco(x, y, w, h, 10);
    interiorIluminado(x + 16, y, w - 32, h);
    persiana(x, y, 16, h, colPersiana[3]); persiana(x + w - 16, y, 16, h, colPersiana[3]);
    a.fillStyle = '#e4dccb'; a.fillRect(x - 20, y - 30, w + 40, 14); sinTinte(x - 20, y - 30, w + 40, 14);
  }

  // ---------- Fila 1: colonial planta baja ----------
  {
    const f = 1;
    zocalo(f, 48);
    // v0: portón de madera con arco y marco de piedra
    let x = cx(0) + 72, y = cy(f) + 44, w = 112, h = 212;
    a.fillStyle = '#d8ccb2'; rectRedondo(a, x - 14, y - 14, w + 28, h + 14, 56); a.fill();
    m.fillStyle = '#000'; m.fillRect(x - 14, y - 14, w + 28, h + 14);
    const g = a.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#4a2c16'); g.addColorStop(0.5, '#6b4223'); g.addColorStop(1, '#41260f');
    a.fillStyle = g; rectRedondo(a, x, y, w, h, 50); a.fill();
    a.strokeStyle = 'rgba(0,0,0,0.45)'; a.lineWidth = 3;
    a.beginPath(); a.moveTo(x + w / 2, y + 6); a.lineTo(x + w / 2, y + h); a.stroke();
    for (const yy of [y + 70, y + 130, y + 180]) { a.beginPath(); a.moveTo(x + 6, yy); a.lineTo(x + w - 6, yy); a.stroke(); }
    a.fillStyle = '#c9a24a';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { a.beginPath(); a.arc(x + 14 + i * 28, y + 60 + j * 40, 2.6, 0, 7); a.fill(); }
    // v1: ventana con reja saliente
    x = cx(1) + 80; y = cy(f) + 44; w = 96; h = 140;
    marco(x, y, w, h, 9);
    vidrioOscuro(x, y, w, h);
    persiana(x, y, w / 2, h, colPersiana[0]);
    reja(x - 8, y - 8, w + 16, h + 16);
    a.fillStyle = '#e4dccb'; a.fillRect(x - 18, y - 26, w + 36, 10); sinTinte(x - 18, y - 26, w + 36, 10);
    // v2: tienda abierta iluminada
    x = cx(2) + 60; y = cy(f) + 60; w = 136; h = 196;
    marco(x, y, w, h, 8, '#d6cbb5');
    interiorIluminado(x, y, w, h);
    a.fillStyle = 'rgba(60,40,25,0.65)';
    for (let i = 0; i < 5; i++) a.fillRect(x + 8 + i * 26, y + 90 + (i % 2) * 10, 18, 40);
    a.fillStyle = '#7a1e1e'; a.fillRect(x - 10, y - 34, w + 20, 18); sinTinte(x - 10, y - 34, w + 20, 18);
    a.fillStyle = '#f2e6c8'; a.font = 'bold 14px sans-serif'; a.textAlign = 'center'; a.fillText('TIENDA', x + w / 2, y - 20);
    // v3: ventana con persianas y montante iluminado
    x = cx(3) + 84; y = cy(f) + 50; w = 88; h = 150;
    marco(x, y, w, h, 9);
    persiana(x, y + 30, w / 2, h - 30, colPersiana[1]); persiana(x + w / 2, y + 30, w / 2, h - 30, colPersiana[1]);
    interiorIluminado(x, y, w, 28);
  }

  // ---------- Fila 2: moderno planta baja ----------
  {
    const f = 2;
    zocalo(f, 30);
    // v0: cortina metálica de garaje
    let x = cx(0) + 40, y = cy(f) + 70, w = 176, h = 186;
    a.fillStyle = '#8d9196'; a.fillRect(x, y, w, h);
    for (let yy = y; yy < y + h; yy += 7) { a.fillStyle = 'rgba(0,0,0,0.25)'; a.fillRect(x, yy, w, 2); a.fillStyle = 'rgba(255,255,255,0.18)'; a.fillRect(x, yy + 2, w, 1); }
    a.fillStyle = '#5d6166'; a.fillRect(x - 6, y - 10, w + 12, 10);
    sinTinte(x - 6, y - 10, w + 12, h + 10);
    // grafiti suave
    a.fillStyle = 'rgba(40,170,160,0.55)'; a.font = 'bold 40px sans-serif'; a.textAlign = 'center'; a.fillText('NEXO', x + w / 2, y + 110);
    // v1: ventana de aluminio con rejilla
    x = cx(1) + 54; y = cy(f) + 60; w = 148; h = 110;
    a.fillStyle = '#cfd3d6'; a.fillRect(x - 6, y - 6, w + 12, h + 12); sinTinte(x - 6, y - 6, w + 12, h + 12);
    vidrioOscuro(x, y, w, h);
    a.strokeStyle = '#2c2f33'; a.lineWidth = 2;
    for (let xx = x + 8; xx < x + w; xx += 14) { a.beginPath(); a.moveTo(xx, y); a.lineTo(xx, y + h); a.stroke(); }
    // v2: local comercial con vitrina iluminada
    x = cx(2) + 24; y = cy(f) + 64; w = 208; h = 192;
    a.fillStyle = '#b9bec4'; a.fillRect(x - 6, y - 6, w + 12, h + 6); sinTinte(x - 6, y - 6, w + 12, h + 6);
    {
      const gg = a.createLinearGradient(x, y, x, y + h);
      gg.addColorStop(0, '#fff3d6'); gg.addColorStop(1, '#d9c3a0');
      a.fillStyle = gg; a.fillRect(x, y, w, h);
      luz(x, y, w, h, '#fff1d0', '#ffd49a');
      a.fillStyle = 'rgba(40,40,50,0.5)';
      for (let i = 0; i < 6; i++) a.fillRect(x + 10 + i * 33, y + 100, 22, 60 + (i % 3) * 8);
      a.fillStyle = '#3a3f46'; a.fillRect(x + w / 2 - 2, y, 4, h);
    }
    // toldo
    for (let i = 0; i < 8; i++) { a.fillStyle = i % 2 ? '#f4efe6' : '#d23a3a'; a.fillRect(x - 6 + i * 27.5, y - 40, 27.5, 30); }
    sinTinte(x - 6, y - 40, w + 12, 30);
    // v3: puerta y ventanita
    x = cx(3) + 40; y = cy(f) + 70; w = 66; h = 186;
    a.fillStyle = '#5e4632'; a.fillRect(x, y, w, h); a.strokeStyle = 'rgba(0,0,0,0.4)'; a.strokeRect(x + 8, y + 10, w - 16, h - 20);
    sinTinte(x, y, w, h);
    marco(x + 110, y + 10, 80, 90, 6, '#d4d7da');
    interiorIluminado(x + 110, y + 10, 80, 90);
  }

  // ---------- Fila 3: moderno piso alto ----------
  {
    const f = 3;
    moldura(f, 8);
    // v0: ventana corrediza reflectante
    let x = cx(0) + 40, y = cy(f) + 60, w = 176, h = 120;
    a.fillStyle = '#d6dadd'; a.fillRect(x - 6, y - 6, w + 12, h + 12); sinTinte(x - 6, y - 6, w + 12, h + 12);
    vidrioOscuro(x, y, w, h); a.fillStyle = '#aab0b5'; a.fillRect(x + w / 2 - 2, y, 4, h);
    // v1: ventana iluminada
    x = cx(1) + 40; y = cy(f) + 60; w = 176; h = 120;
    a.fillStyle = '#d6dadd'; a.fillRect(x - 6, y - 6, w + 12, h + 12); sinTinte(x - 6, y - 6, w + 12, h + 12);
    interiorIluminado(x, y, w, h); a.fillStyle = '#aab0b5'; a.fillRect(x + w / 2 - 2, y, 4, h);
    // v2: dos ventanas pequeñas
    for (const xx of [cx(2) + 36, cx(2) + 150]) {
      a.fillStyle = '#d6dadd'; a.fillRect(xx - 5, cy(f) + 70 - 5, 80, 100); sinTinte(xx - 5, cy(f) + 65, 80, 100);
      vidrioOscuro(xx, cy(f) + 70, 70, 90);
    }
    // v3: ventana con baranda
    x = cx(3) + 50; y = cy(f) + 40; w = 156; h = 170;
    a.fillStyle = '#d6dadd'; a.fillRect(x - 6, y - 6, w + 12, h + 12); sinTinte(x - 6, y - 6, w + 12, h + 12);
    vidrioOscuro(x, y, w, h);
    a.strokeStyle = '#25282c'; a.lineWidth = 3;
    a.strokeRect(x - 8, y + h - 70, w + 16, 66);
    for (let xx = x; xx < x + w; xx += 12) { a.beginPath(); a.moveTo(xx, y + h - 70); a.lineTo(xx, y + h - 4); a.stroke(); }
  }

  // ---------- Columna 4: muros lisos (laterales y traseras) ----------
  // fila 1 y 2 conservan zócalo; nada más que agregar

  const map = tex(cA), mascara = tex(cM, { srgb: false }), emisivo = tex(cE);
  return { map, mascara, emisivo };
}

// ---------- Tejas de barro ----------
export function texturaTejas() {
  // Cada teja con su tono (±10 % de luminosidad, ±6° de matiz), hileras con musgo y manchas de lluvia.
  const S = 256;
  const [c, x] = lienzo(S, S);
  const [cb, b] = lienzo(S, S);
  const az = crearAzar(11);
  x.fillStyle = '#6a3320'; x.fillRect(0, 0, S, S);
  b.fillStyle = '#000'; b.fillRect(0, 0, S, S);
  const filas = 8, cols = 8, fh = S / filas, cw = S / cols;
  for (let f = 0; f < filas; f++) {
    for (let k = 0; k < cols; k++) {
      const off = (f % 2) * cw * 0.5;
      const x0 = k * cw + off - cw * 0.5;
      for (const xx of [x0, x0 + S]) {
        const h = 15 + (az() - 0.5) * 12;                 // matiz base ~15° ±6°
        const s = 52 + az() * 14;
        const l = 38 * (0.9 + az() * 0.2);                // ±10 % de luminosidad
        const g = x.createLinearGradient(xx, 0, xx + cw, 0);
        g.addColorStop(0, `hsl(${h}, ${s}%, ${l * 0.55}%)`);
        g.addColorStop(0.45, `hsl(${h}, ${s}%, ${l}%)`);
        g.addColorStop(1, `hsl(${h}, ${s}%, ${l * 0.5}%)`);
        x.fillStyle = g; rectRedondo(x, xx + 1, f * fh, cw - 2, fh + 3, 6); x.fill();
        // borde inferior más claro (teja asoleada)
        x.fillStyle = 'rgba(255,205,160,0.10)'; x.fillRect(xx + 5, f * fh + fh - 3, cw - 10, 3);
        const gb = b.createLinearGradient(xx, 0, xx + cw, 0);
        gb.addColorStop(0, '#222'); gb.addColorStop(0.45, '#eee'); gb.addColorStop(1, '#222');
        b.fillStyle = gb; b.fillRect(xx + 1, f * fh, cw - 2, fh + 3);
      }
    }
    x.fillStyle = 'rgba(0,0,0,0.38)'; x.fillRect(0, f * fh, S, 3);
  }
  // hileras con musgo (verde #5c6b3a al ~12 %)
  for (const f of [1, 4, 6]) {
    for (let k = 0; k < 14; k++) {
      const px = az() * S, w = 10 + az() * 30;
      x.fillStyle = `rgba(92,107,58,${0.10 + az() * 0.08})`; x.fillRect(px, f * fh + 2, w, fh - 2);
    }
  }
  // manchas de lluvia verticales
  for (let k = 0; k < 22; k++) {
    const px = az() * S, py = az() * S * 0.7, h = 30 + az() * 90;
    const g = x.createLinearGradient(0, py, 0, py + h);
    g.addColorStop(0, 'rgba(35,26,22,0)'); g.addColorStop(0.3, 'rgba(35,26,22,0.2)'); g.addColorStop(1, 'rgba(35,26,22,0)');
    x.fillStyle = g; x.fillRect(px, py, 3 + az() * 6, h);
  }
  manchas(x, S, S, 30, az, 'rgba(60,70,40,A)', 6, 20, 0.22);
  manchas(x, S, S, 18, az, 'rgba(210,170,130,A)', 8, 26, 0.12);
  grano(x, S, S, 14, az);
  return { map: tex(c), bump: tex(cb, { srgb: false }) };
}

// ---------- Piedra coralina de la muralla ----------
export function texturaPiedra() {
  const S = 512;
  const [c, x] = lienzo(S, S);
  const [cb, b] = lienzo(S, S);
  const az = crearAzar(23);
  x.fillStyle = '#9c8a6a'; x.fillRect(0, 0, S, S);
  b.fillStyle = '#202020'; b.fillRect(0, 0, S, S);
  const fh = 64;
  for (let y = 0; y < S; y += fh) {
    let xx = -az() * 60;
    while (xx < S) {
      const w = 70 + az() * 80;
      const t = az();
      x.fillStyle = `rgb(${190 + t * 30},${172 + t * 28},${136 + t * 24})`;
      x.fillRect(xx + 3, y + 3, w - 6, fh - 6);
      b.fillStyle = `rgb(${170 + t * 60},${170 + t * 60},${170 + t * 60})`;
      b.fillRect(xx + 3, y + 3, w - 6, fh - 6);
      if (xx + w > S) { x.fillRect(xx - S + 3, y + 3, w - 6, fh - 6); b.fillRect(xx - S + 3, y + 3, w - 6, fh - 6); }
      xx += w;
    }
  }
  // poros del coral
  for (let i = 0; i < 2600; i++) {
    const px = az() * S, py = az() * S, r = 0.8 + az() * 2.2;
    x.fillStyle = 'rgba(70,58,40,0.45)'; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
    b.fillStyle = 'rgba(0,0,0,0.6)'; b.beginPath(); b.arc(px, py, r, 0, 7); b.fill();
  }
  manchas(x, S, S, 50, az, 'rgba(50,55,40,A)', 20, 70, 0.22);
  grano(x, S, S, 16, az);
  return { map: tex(c), bump: tex(cb, { srgb: false }) };
}

// ---------- Asfalto ----------
export function texturaAsfalto() {
  // 1024 px = 8 m. Asfalto medio con parches de bacheo, grietas, manchas de aceite y roce de neumáticos.
  const S = 1024;
  const [c, x] = lienzo(S, S);
  const az = crearAzar(31);
  x.fillStyle = '#86786a'; x.fillRect(0, 0, S, S);
  grano(x, S, S, 34, az);
  manchas(x, S, S, 70, az, 'rgba(40,36,30,A)', 30, 130, 0.16);
  manchas(x, S, S, 50, az, 'rgba(170,158,138,A)', 25, 120, 0.14);
  // bandas de roce (aprox. dos huellas por carril)
  for (const px of [150, 360, 660, 870]) {
    const g = x.createLinearGradient(px - 40, 0, px + 40, 0);
    g.addColorStop(0, 'rgba(30,28,24,0)'); g.addColorStop(0.5, 'rgba(30,28,24,0.14)'); g.addColorStop(1, 'rgba(30,28,24,0)');
    x.fillStyle = g; x.fillRect(px - 40, 0, 80, S);
  }
  for (let k = 0; k < 11; k++) {
    const w = 60 + az() * 240, h = 40 + az() * 170, px = az() * (S - w), py = az() * (S - h);
    const claro = az() < 0.5;
    x.fillStyle = claro ? `rgba(190,176,152,${0.06 + az() * 0.06})` : `rgba(28,26,24,${0.08 + az() * 0.07})`;
    x.fillRect(px, py, w, h);
    x.strokeStyle = 'rgba(20,18,16,0.38)'; x.lineWidth = 2; x.strokeRect(px, py, w, h);
  }
  for (let k = 0; k < 18; k++) {
    const px = az() * S, py = az() * S, r = 8 + az() * 26;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(14,14,16,0.5)'); g.addColorStop(0.6, 'rgba(30,22,40,0.18)'); g.addColorStop(1, 'rgba(14,14,16,0)');
    x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  x.lineWidth = 1.6;
  for (let i = 0; i < 34; i++) {
    let px = az() * S, py = az() * S;
    x.strokeStyle = az() < 0.5 ? 'rgba(18,17,16,0.6)' : 'rgba(30,28,26,0.4)';
    x.beginPath(); x.moveTo(px, py);
    for (let k = 0; k < 10; k++) { px += (az() - 0.5) * 70; py += (az() - 0.5) * 70; x.lineTo(px, py); }
    x.stroke();
  }
  return tex(c);
}

// ---------- Adoquines de la ciudad vieja ----------
export function texturaAdoquin() {
  // 480 px = 4 m (piedras de 20 cm). Juntas oscuras con musgo y relieve marcado.
  const S = 480;
  const [c, x] = lienzo(S, S);
  const [cb, b] = lienzo(S, S);
  const az = crearAzar(41);
  x.fillStyle = '#3a332c'; x.fillRect(0, 0, S, S);
  b.fillStyle = '#000'; b.fillRect(0, 0, S, S);
  const t = 24;
  for (let fy = 0; fy < S / t; fy++) {
    const off = (fy % 2) * t / 2;
    for (let fx = -1; fx < S / t + 1; fx++) {
      const px = fx * t + off, py = fy * t, k = az();
      x.fillStyle = `rgb(${118 + k * 54},${106 + k * 46},${92 + k * 38})`;
      rectRedondo(x, px + 2, py + 2, t - 4, t - 4, 6); x.fill();
      x.fillStyle = 'rgba(255,245,225,0.10)'; rectRedondo(x, px + 4, py + 3, t - 10, 5, 2); x.fill();
      const gb = b.createRadialGradient(px + t / 2, py + t / 2, 1, px + t / 2, py + t / 2, t * 0.62);
      gb.addColorStop(0, '#fff'); gb.addColorStop(1, '#222');
      b.fillStyle = gb; rectRedondo(b, px + 2, py + 2, t - 4, t - 4, 6); b.fill();
      if (az() < 0.18) { x.fillStyle = 'rgba(70,85,40,0.25)'; x.fillRect(px, py + t - 3, t, 3); }
    }
  }
  grano(x, S, S, 16, az);
  manchas(x, S, S, 24, az, 'rgba(30,26,20,A)', 10, 40, 0.18);
  return { map: tex(c), bump: tex(cb, { srgb: false }) };
}

// ---------- Andén (baldosa) ----------
export function texturaAnden() {
  // 8x8 baldosas de la misma gama (variación sutil por baldosa) con juntas oscuras de 2 px
  const S = 256;
  const [c, x] = lienzo(S, S);
  const az = crearAzar(53);
  x.fillStyle = 'rgba(60,55,50,1)'; x.fillRect(0, 0, S, S);
  const t = 32;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    const k = az();
    x.fillStyle = `rgb(${184 + k * 8},${170 + k * 7},${150 + k * 6})`;
    x.fillRect(i * t + 1, j * t + 1, t - 2, t - 2);
    x.fillStyle = 'rgba(255,250,240,0.05)'; x.fillRect(i * t + 1, j * t + 1, t - 2, 3);
  }
  grano(x, S, S, 14, az);
  manchas(x, S, S, 10, az, 'rgba(40,40,40,A)', 10, 30, 0.10);
  return tex(c);
}

// ---------- Muro cortina de vidrio (24 m x 28 m por repetición) ----------
export function texturaVidrio() {
  const S = 1024, cols = 8, filas = 8, cw = S / cols, fh = S / filas;
  const [c, x] = lienzo(S, S);
  const [ce, e] = lienzo(S, S);
  const [cr, r] = lienzo(S, S);
  const az = crearAzar(61);
  e.fillStyle = '#000'; e.fillRect(0, 0, S, S);
  r.fillStyle = '#fff'; r.fillRect(0, 0, S, S); // rugosidad (se multiplica)
  for (let f = 0; f < filas; f++) for (let k = 0; k < cols; k++) {
    const px = k * cw, py = f * fh;
    // vidrio
    const g = x.createLinearGradient(px, py, px + cw, py + fh);
    const t = az() * 0.25;
    g.addColorStop(0, `rgb(${120 + t * 50},${142 + t * 50},${166 + t * 40})`);
    g.addColorStop(1, `rgb(${70 + t * 40},${88 + t * 40},${110 + t * 40})`);
    x.fillStyle = g; x.fillRect(px, py, cw, fh);
    r.fillStyle = '#1a1a1a'; r.fillRect(px, py, cw, fh);
    // antepecho opaco
    x.fillStyle = '#2a3036'; x.fillRect(px, py + fh - 22, cw, 22);
    r.fillStyle = '#777'; r.fillRect(px, py + fh - 22, cw, 22);
    // luces interiores
    const p = az();
    if (p < 0.15) {
      const calida = az() < 0.65;
      const gl = e.createLinearGradient(px, py, px, py + fh);
      gl.addColorStop(0, calida ? '#ffd79a' : '#d8ecff');
      gl.addColorStop(1, calida ? '#c27a3c' : '#7fa3c7');
      e.fillStyle = gl; e.globalAlpha = 0.45 + az() * 0.55; e.fillRect(px + 4, py + 4, cw - 8, fh - 28); e.globalAlpha = 1;
      // persianas parciales
      if (az() < 0.5) { e.fillStyle = '#000'; e.fillRect(px + 4, py + 4, cw - 8, (fh - 28) * az() * 0.6); }
      x.fillStyle = 'rgba(255,220,170,0.25)'; x.fillRect(px + 4, py + 4, cw - 8, fh - 28);
    }
  }
  // montantes
  x.fillStyle = '#1b1f24';
  for (let k = 0; k <= cols; k++) x.fillRect(k * cw - 3, 0, 6, S);
  for (let f = 0; f <= filas; f++) x.fillRect(0, f * fh - 3, S, 6);
  r.fillStyle = '#555';
  for (let k = 0; k <= cols; k++) r.fillRect(k * cw - 3, 0, 6, S);
  return { map: tex(c), emisivo: tex(ce), rugosidad: tex(cr, { srgb: false }) };
}

// ---------- Oficinas: franjas de concreto con ventanas corridas (12 m x 14 m) ----------
export function texturaOficinas() {
  // 512 px = 12 m x 14 m. Paneles de hormigón con juntas cada 3 m, manchas de lluvia bajo las ventanas.
  const S = 512, filas = 4, fh = S / filas;
  const [c, x] = lienzo(S, S);
  const [ce, e] = lienzo(S, S);
  const az = crearAzar(67);
  x.fillStyle = '#d9d3c6'; x.fillRect(0, 0, S, S);
  e.fillStyle = '#000'; e.fillRect(0, 0, S, S);
  grano(x, S, S, 18, az);
  manchas(x, S, S, 40, az, 'rgba(90,80,65,A)', 10, 50, 0.1);
  for (let f = 0; f < filas; f++) {
    const py = f * fh + 30, h = fh - 62;
    const g = x.createLinearGradient(0, py, 0, py + h);
    g.addColorStop(0, '#7f90a2'); g.addColorStop(0.55, '#4d5c6c'); g.addColorStop(1, '#2f3a46');
    x.fillStyle = g; x.fillRect(0, py, S, h);
    x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(0, py, S, 4);
    for (let k = 0; k < 8; k++) {
      const px = k * 64;
      x.fillStyle = '#b9b3a6'; x.fillRect(px - 2, py, 4, h);
      if (az() < 0.2) {
        const calida = az() < 0.7;
        e.fillStyle = calida ? '#ffcf8f' : '#d6e8ff';
        e.globalAlpha = 0.5 + az() * 0.5; e.fillRect(px + 3, py + 2, 58, h - 4); e.globalAlpha = 1;
      } else if (az() < 0.25) { x.fillStyle = 'rgba(235,225,200,0.5)'; x.fillRect(px + 3, py + 2, 58, 10 + az() * (h - 14)); }
      // mancha de lluvia bajo cada ventana
      if (az() < 0.7) {
        const gl = x.createLinearGradient(0, py + h, 0, py + h + 28 + az() * 18);
        gl.addColorStop(0, 'rgba(60,52,40,0.35)'); gl.addColorStop(1, 'rgba(60,52,40,0)');
        x.fillStyle = gl; x.fillRect(px + 8 + az() * 8, py + h, 14 + az() * 24, 46);
      }
    }
    x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(0, py + h, S, 4);
  }
  // juntas de paneles cada 3 m (128 px)
  x.fillStyle = 'rgba(40,36,30,0.32)';
  for (let i = 0; i < S; i += 128) { x.fillRect(i, 0, 2, S); x.fillRect(0, i, S, 2); }
  return { map: tex(c), emisivo: tex(ce) };
}

// ---------- Lámina corrugada (bodegas y contenedores) ----------
export function texturaCorrugada() {
  const S = 256;
  const [c, x] = lienzo(S, S);
  const [cb, b] = lienzo(S, S);
  const az = crearAzar(71);
  for (let i = 0; i < S; i++) {
    const t = 0.5 + 0.5 * Math.sin(i / S * Math.PI * 2 * 16);
    const v = 170 + t * 70;
    x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, 0, 1, S);
    b.fillStyle = `rgb(${t * 255},${t * 255},${t * 255})`; b.fillRect(i, 0, 1, S);
  }
  manchas(x, S, S, 20, az, 'rgba(110,70,40,A)', 6, 30, 0.2);
  grano(x, S, S, 12, az);
  return { map: tex(c), bump: tex(cb, { srgb: false }) };
}

// ---------- Techo plano de concreto ----------
export function texturaTecho() {
  // 512 px = 4 m. Impermeabilizante gastado, juntas de dilatación, sumideros y chorreados de óxido.
  const S = 512;
  const [c, x] = lienzo(S, S);
  const az = crearAzar(83);
  x.fillStyle = '#978d80'; x.fillRect(0, 0, S, S);
  grano(x, S, S, 38, az);
  manchas(x, S, S, 40, az, 'rgba(38,36,32,A)', 12, 60, 0.35);
  manchas(x, S, S, 26, az, 'rgba(190,180,165,A)', 10, 40, 0.18);
  x.fillStyle = 'rgba(0,0,0,0.3)';
  for (let i = 0; i < S; i += 128) { x.fillRect(i, 0, 3, S); x.fillRect(0, i, S, 3); }
  x.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < S; i += 128) { x.fillRect(i + 3, 0, 1, S); x.fillRect(0, i + 3, S, 1); }
  for (let k = 0; k < 6; k++) {
    const px = 30 + az() * (S - 60), py = 30 + az() * (S - 60);
    const g = x.createRadialGradient(px, py, 2, px, py, 20);
    g.addColorStop(0, 'rgba(20,18,15,0.6)'); g.addColorStop(1, 'rgba(20,18,15,0)');
    x.fillStyle = g; x.fillRect(px - 20, py - 20, 40, 40);
    x.fillStyle = '#1d1b18'; x.beginPath(); x.arc(px, py, 6, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#5a554d'; x.lineWidth = 1.5; x.stroke();
  }
  // manchas de humedad (verdosas) y eflorescencias claras
  manchas(x, S, S, 14, az, 'rgba(42,60,52,A)', 20, 70, 0.22);
  manchas(x, S, S, 10, az, 'rgba(225,220,205,A)', 12, 34, 0.18);
  for (let k = 0; k < 18; k++) {
    const px = az() * S, py = az() * S, h = 20 + az() * 70;
    const g = x.createLinearGradient(0, py, 0, py + h);
    g.addColorStop(0, 'rgba(110,70,40,0.15)'); g.addColorStop(1, 'rgba(110,70,40,0)');
    x.fillStyle = g; x.fillRect(px, py, 3 + az() * 5, h);
  }
  return tex(c);
}

// ---------- Detalle del terreno (se multiplica por el color por vértice) ----------
export function texturaTerreno() {
  const S = 512;
  const [c, x] = lienzo(S, S);
  const az = crearAzar(97);
  x.fillStyle = '#e6e6e6'; x.fillRect(0, 0, S, S);
  grano(x, S, S, 40, az);
  manchas(x, S, S, 90, az, 'rgba(255,255,255,A)', 10, 50, 0.18);
  manchas(x, S, S, 90, az, 'rgba(90,90,90,A)', 10, 40, 0.14);
  return tex(c);
}

// ---------- Césped ----------
export function texturaCesped() {
  const S = 256;
  const [c, x] = lienzo(S, S);
  const az = crearAzar(101);
  x.fillStyle = '#5f8a3a'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 5000; i++) {
    const t = az();
    x.fillStyle = `rgba(${60 + t * 70},${110 + t * 60},${30 + t * 30},0.55)`;
    x.fillRect(az() * S, az() * S, 1.5, 3 + az() * 3);
  }
  manchas(x, S, S, 18, az, 'rgba(140,120,60,A)', 8, 30, 0.2);
  return tex(c);
}

// ---------- Cancha deportiva ----------
export function texturaCancha() {
  const [c, x] = lienzo(512, 256);
  x.fillStyle = '#2f7a6c'; x.fillRect(0, 0, 512, 256);
  x.fillStyle = '#c4573f'; x.fillRect(24, 20, 464, 216);
  x.strokeStyle = '#f3f3f3'; x.lineWidth = 4;
  x.strokeRect(24, 20, 464, 216);
  x.beginPath(); x.moveTo(256, 20); x.lineTo(256, 236); x.stroke();
  x.beginPath(); x.arc(256, 128, 34, 0, 7); x.stroke();
  x.strokeRect(24, 78, 60, 100); x.strokeRect(428, 78, 60, 100);
  x.beginPath(); x.arc(84, 128, 30, -1.57, 1.57); x.stroke();
  x.beginPath(); x.arc(428, 128, 30, 1.57, 4.71); x.stroke();
  return tex(c, { repetir: false });
}

// ---------- Degradado radial (sombra de contacto, charcos de luz) ----------
export function texturaRadial(interior = 'rgba(0,0,0,0.55)', exterior = 'rgba(0,0,0,0)') {
  const [c, x] = lienzo(128, 128);
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, interior); g.addColorStop(1, exterior);
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return tex(c, { repetir: false, srgb: true });
}

// ---------- Esfera de reloj ----------
export function texturaReloj() {
  const [c, x] = lienzo(256, 256);
  x.fillStyle = '#e9e0c8'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill();
  x.strokeStyle = '#3a2e1c'; x.lineWidth = 8; x.stroke();
  x.fillStyle = '#2a2116';
  x.font = 'bold 26px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const rom = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  for (let i = 0; i < 12; i++) {
    const ang = i / 12 * Math.PI * 2 - Math.PI / 2;
    x.fillText(rom[i], 128 + Math.cos(ang) * 96, 128 + Math.sin(ang) * 96);
  }
  return tex(c, { repetir: false });
}

// ---------- Iconos (sprites) ----------
const cacheIconos = new Map();
export function iconoAlerta(color = '#ff3b30') {
  if (cacheIconos.has('a' + color)) return cacheIconos.get('a' + color);
  const [c, x] = lienzo(256, 256);
  x.shadowColor = color; x.shadowBlur = 30;
  x.fillStyle = color;
  x.beginPath();
  x.moveTo(128, 18); x.lineTo(234, 210); x.lineTo(22, 210); x.closePath();
  x.lineJoin = 'round'; x.lineWidth = 22; x.strokeStyle = color; x.stroke(); x.fill();
  x.shadowBlur = 0;
  const g = x.createLinearGradient(0, 40, 0, 210);
  g.addColorStop(0, '#2a0e0c'); g.addColorStop(1, '#120505');
  x.fillStyle = g;
  x.beginPath(); x.moveTo(128, 52); x.lineTo(204, 194); x.lineTo(52, 194); x.closePath(); x.fill();
  x.fillStyle = '#fff'; x.shadowColor = color; x.shadowBlur = 16;
  x.font = '900 120px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('!', 128, 138);
  const t = tex(c, { repetir: false });
  cacheIconos.set('a' + color, t);
  return t;
}

export function iconoEscudo() {
  if (cacheIconos.has('escudo')) return cacheIconos.get('escudo');
  const [c, x] = lienzo(256, 256);
  x.shadowColor = '#3dff8a'; x.shadowBlur = 26;
  x.beginPath();
  x.moveTo(128, 20); x.lineTo(216, 52); x.quadraticCurveTo(214, 170, 128, 236); x.quadraticCurveTo(42, 170, 40, 52); x.closePath();
  const g = x.createLinearGradient(0, 20, 0, 236);
  g.addColorStop(0, '#62ffa5'); g.addColorStop(1, '#0d8a48');
  x.fillStyle = g; x.fill();
  x.shadowBlur = 0; x.lineWidth = 8; x.strokeStyle = '#d9ffe9'; x.stroke();
  x.strokeStyle = '#ffffff'; x.lineWidth = 22; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(84, 128); x.lineTo(118, 162); x.lineTo(176, 96); x.stroke();
  const t = tex(c, { repetir: false });
  cacheIconos.set('escudo', t);
  return t;
}

// ---------- Atlas de letreros (neón y paneles) ----------
// Cada letrero: { clave, texto, sub?, estilo: 'neon'|'panel', color, fondo?, fuente? }
export function atlasLetreros(lista) {
  const W = 2048, H = 2048;
  const [c, x] = lienzo(W, H);
  x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  const rects = {};
  let px = 8, py = 8, filaAlto = 0;
  for (const L of lista) {
    const alto = L.alto ?? 120;
    x.font = `${L.peso ?? '800'} ${Math.round(alto * 0.62)}px ${L.fuente ?? 'Arial, sans-serif'}`;
    const ancho = Math.ceil(Math.max(L.anchoMin ?? 0, x.measureText(L.texto).width + alto * 0.7));
    if (px + ancho > W - 8) { px = 8; py += filaAlto + 12; filaAlto = 0; }
    filaAlto = Math.max(filaAlto, alto);
    x.save();
    if (L.estilo === 'panel') {
      x.fillStyle = L.fondo ?? '#1d2430';
      rectRedondo(x, px, py, ancho, alto, alto * 0.12); x.fill();
      x.strokeStyle = L.borde ?? L.color; x.lineWidth = alto * 0.05;
      rectRedondo(x, px + alto * 0.06, py + alto * 0.06, ancho - alto * 0.12, alto - alto * 0.12, alto * 0.1); x.stroke();
      x.fillStyle = L.color;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(L.texto, px + ancho / 2, py + alto / 2 + alto * 0.03);
    } else {
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.shadowColor = L.color; x.shadowBlur = alto * 0.25;
      x.strokeStyle = L.color; x.lineWidth = alto * 0.06;
      x.strokeText(L.texto, px + ancho / 2, py + alto / 2);
      x.shadowBlur = alto * 0.12;
      x.fillStyle = L.nucleo ?? '#ffffff';
      x.fillText(L.texto, px + ancho / 2, py + alto / 2);
      if (L.marco) {
        x.shadowBlur = alto * 0.2; x.strokeStyle = L.marco; x.lineWidth = alto * 0.04;
        rectRedondo(x, px + 6, py + 6, ancho - 12, alto - 12, alto * 0.2); x.stroke();
      }
    }
    x.restore();
    rects[L.clave] = { uv: [px / W, 1 - (py + alto) / H, (px + ancho) / W, 1 - py / H], aspecto: ancho / alto };
    px += ancho + 12;
  }
  const t = tex(c, { repetir: false });
  return { textura: t, rects };
}

// ---------- Pantallas holográficas (texto/datos) ----------
export function texturaHolograma(tipo = 'datos') {
  const [c, x] = lienzo(256, 256);
  x.fillStyle = 'rgba(0,0,0,0)'; x.clearRect(0, 0, 256, 256);
  x.strokeStyle = '#7ff6ff'; x.fillStyle = '#7ff6ff'; x.lineWidth = 3;
  rectRedondo(x, 6, 6, 244, 244, 16); x.stroke();
  const az = crearAzar(tipo.length * 7);
  if (tipo === 'escudo') {
    x.lineWidth = 8;
    x.beginPath(); x.moveTo(128, 40); x.lineTo(196, 64); x.quadraticCurveTo(194, 160, 128, 214); x.quadraticCurveTo(62, 160, 60, 64); x.closePath(); x.stroke();
    x.beginPath(); x.moveTo(96, 128); x.lineTo(120, 152); x.lineTo(164, 104); x.stroke();
  } else if (tipo === 'mapa') {
    for (let i = 0; i < 9; i++) { x.globalAlpha = 0.6; x.strokeRect(20 + az() * 150, 20 + az() * 150, 30 + az() * 60, 30 + az() * 60); }
    x.globalAlpha = 1; x.beginPath(); x.arc(150, 120, 10, 0, 7); x.fill();
  } else {
    x.font = 'bold 18px monospace';
    for (let i = 0; i < 9; i++) {
      x.globalAlpha = 0.5 + az() * 0.5;
      x.fillRect(22, 26 + i * 24, 40 + az() * 170, 8);
    }
    x.globalAlpha = 1;
  }
  return tex(c, { repetir: false });
}

// ---------- Marcador de la detective: rombo cian con lupa ----------
export function iconoDetective() {
  if (cacheIconos.has('detective')) return cacheIconos.get('detective');
  const [c, x] = lienzo(256, 256);
  x.shadowColor = '#3fe0ff'; x.shadowBlur = 24;
  x.beginPath(); x.moveTo(128, 14); x.lineTo(226, 112); x.lineTo(128, 244); x.lineTo(30, 112); x.closePath();
  const g = x.createLinearGradient(0, 14, 0, 244);
  g.addColorStop(0, '#8ff4ff'); g.addColorStop(1, '#0a8fa8');
  x.fillStyle = g; x.fill();
  x.shadowBlur = 0; x.lineWidth = 8; x.strokeStyle = '#e8fdff'; x.stroke();
  x.beginPath(); x.moveTo(128, 40); x.lineTo(200, 112); x.lineTo(128, 210); x.lineTo(56, 112); x.closePath();
  x.fillStyle = '#062a33'; x.fill();
  x.strokeStyle = '#ffffff'; x.lineWidth = 13; x.lineCap = 'round';
  x.beginPath(); x.arc(118, 104, 30, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.moveTo(140, 126); x.lineTo(166, 154); x.stroke();
  const t = tex(c, { repetir: false });
  cacheIconos.set('detective', t);
  return t;
}

// ---------- Emblemas de edificios jugables (disco oscuro con aro de color y glifo blanco) ----------
export function iconoEmblema(tipo, color) {
  const clave = 'emb' + tipo + color;
  if (cacheIconos.has(clave)) return cacheIconos.get(clave);
  const [c, x] = lienzo(128, 128);
  x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 8;
  x.beginPath(); x.arc(64, 64, 54, 0, Math.PI * 2);
  const g = x.createRadialGradient(54, 48, 6, 64, 64, 56);
  g.addColorStop(0, '#2c3442'); g.addColorStop(1, '#11151c');
  x.fillStyle = g; x.fill();
  x.shadowBlur = 0; x.lineWidth = 7; x.strokeStyle = color; x.stroke();
  x.lineWidth = 2; x.strokeStyle = '#d4a94c'; x.beginPath(); x.arc(64, 64, 59, 0, Math.PI * 2); x.stroke();
  x.fillStyle = '#ffffff'; x.strokeStyle = '#ffffff'; x.lineWidth = 6; x.lineCap = 'round'; x.lineJoin = 'round';
  const P = (pts) => { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) x.lineTo(p[0], p[1]); };
  switch (tipo) {
    case 'central': P([[64, 30], [92, 40], [90, 70], [64, 98], [38, 70], [36, 40]]); x.closePath(); x.fill(); break;
    case 'laboratorio': P([[54, 30], [54, 56], [36, 92], [92, 92], [74, 56], [74, 30]]); x.stroke(); P([[48, 30], [80, 30]]); x.stroke(); P([[44, 80], [84, 80], [92, 92], [36, 92]]); x.closePath(); x.fill(); break;
    case 'banco': P([[34, 48], [64, 30], [94, 48]]); x.closePath(); x.fill(); for (const px of [42, 56, 72, 86]) { P([[px, 54], [px, 84]]); x.stroke(); } P([[32, 92], [96, 92]]); x.stroke(); break;
    case 'colegio': P([[28, 52], [64, 36], [100, 52], [64, 68]]); x.closePath(); x.fill(); P([[44, 60], [44, 80], [64, 90], [84, 80], [84, 60]]); x.stroke(); break;
    case 'cibercafe': x.beginPath(); x.ellipse(64, 66, 34, 22, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#11151c'; x.fillRect(42, 63, 16, 6); x.fillRect(47, 58, 6, 16); x.beginPath(); x.arc(80, 60, 4, 0, 7); x.arc(88, 70, 4, 0, 7); x.fill(); break;
    case 'cafe': P([[38, 46], [82, 46], [78, 86], [42, 86]]); x.closePath(); x.fill(); x.beginPath(); x.arc(86, 62, 10, -1.5, 1.5); x.stroke(); P([[52, 26], [56, 38]]); x.stroke(); P([[66, 26], [70, 38]]); x.stroke(); break;
    case 'tienda': x.lineWidth = 7; x.strokeRect(46, 28, 36, 70); x.fillRect(58, 88, 12, 4); break;
    case 'torre': P([[64, 40], [50, 98]]); x.stroke(); P([[64, 40], [78, 98]]); x.stroke(); x.beginPath(); x.arc(64, 40, 14, -2.6, -0.5); x.stroke(); x.beginPath(); x.arc(64, 40, 26, -2.6, -0.5); x.stroke(); break;
    case 'alcaldia': x.fillRect(54, 26, 20, 30); x.fillRect(34, 56, 60, 36); x.fillStyle = '#11151c'; x.beginPath(); x.arc(64, 40, 6, 0, 7); x.fill(); break;
    case 'puerto': x.beginPath(); x.arc(64, 34, 8, 0, 7); x.stroke(); P([[64, 42], [64, 96]]); x.stroke(); P([[48, 56], [80, 56]]); x.stroke(); x.beginPath(); x.arc(64, 70, 28, 0.3, Math.PI - 0.3); x.stroke(); break;
    default: P([[30, 64], [64, 34], [98, 64]]); x.stroke(); x.fillRect(42, 62, 44, 32); x.fillStyle = '#11151c'; x.fillRect(58, 74, 12, 20);
  }
  const t = tex(c, { repetir: false });
  cacheIconos.set(clave, t);
  return t;
}

// ---------- Flecha de alerta fuera de cámara (para el borde de la pantalla) ----------
export function iconoFlecha(color = '#ff3b30') {
  const clave = 'flecha' + color;
  if (cacheIconos.has(clave)) return cacheIconos.get(clave);
  const [c, x] = lienzo(128, 128);
  x.shadowColor = color; x.shadowBlur = 18;
  x.beginPath(); x.moveTo(118, 64); x.lineTo(30, 18); x.lineTo(50, 64); x.lineTo(30, 110); x.closePath();
  x.fillStyle = color; x.fill();
  x.shadowBlur = 0; x.lineWidth = 5; x.strokeStyle = '#fff'; x.stroke();
  const t = tex(c, { repetir: false });
  cacheIconos.set(clave, t);
  return t;
}

// ---------- Tarjetas de hojas con recorte alfa (copas de árbol) ----------
export function texturaHojas() {
  if (cacheIconos.has('hojas')) return cacheIconos.get('hojas');
  const S = 256;
  const [c, x] = lienzo(S, S);
  const az = crearAzar(131);
  x.clearRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) {
    const r = Math.sqrt(az()) * 112, a = az() * Math.PI * 2;
    const px = 128 + Math.cos(a) * r, py = 128 + Math.sin(a) * r;
    const k = az();
    x.fillStyle = `rgb(${150 + k * 70},${190 + k * 50},${120 + k * 50})`;
    x.save(); x.translate(px, py); x.rotate(az() * Math.PI * 2);
    x.beginPath(); x.ellipse(0, 0, 16 + az() * 10, 7 + az() * 4, 0, 0, Math.PI * 2); x.fill();
    x.restore();
  }
  const t = tex(c, { repetir: false });
  t.premultiplyAlpha = false;
  cacheIconos.set('hojas', t);
  return t;
}
