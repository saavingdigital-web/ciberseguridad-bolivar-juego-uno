// CiberDetective · texturas procedurales de la interfaz (canvas → data URL → variables CSS)
// Se generan una sola vez al crear la interfaz: grano, metal cepillado, fibra de pizarra y esquinas doradas.

function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

// Pseudoaleatorio determinista para que la textura sea siempre igual.
function semilla(s) {
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function grano() {
  const [c, x] = lienzo(160, 160);
  const img = x.createImageData(160, 160);
  const r = semilla(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + r() * 145;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = r() * 38;
  }
  x.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

function metal() {
  const [c, x] = lienzo(256, 256);
  const r = semilla(42);
  x.fillStyle = '#16191f';
  x.fillRect(0, 0, 256, 256);
  // Vetas horizontales de cepillado
  for (let i = 0; i < 900; i++) {
    const y = r() * 256, l = 30 + r() * 160, x0 = r() * 256;
    const claro = r() > 0.5;
    x.strokeStyle = claro ? `rgba(255,255,255,${0.015 + r() * 0.04})` : `rgba(0,0,0,${0.05 + r() * 0.1})`;
    x.lineWidth = 0.5 + r() * 0.8;
    x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + l, y + (r() - 0.5) * 0.6); x.stroke();
    if (x0 + l > 256) { x.beginPath(); x.moveTo(x0 - 256, y); x.lineTo(x0 + l - 256, y); x.stroke(); }
  }
  // Manchas sutiles de pátina
  for (let i = 0; i < 18; i++) {
    const g = x.createRadialGradient(r() * 256, r() * 256, 0, r() * 256, r() * 256, 40 + r() * 60);
    g.addColorStop(0, `rgba(${r() > 0.5 ? '90,70,40' : '30,60,80'},0.05)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  }
  return c.toDataURL('image/png');
}

function pizarra() {
  const [c, x] = lienzo(256, 256);
  const r = semilla(99);
  x.fillStyle = '#0c1218'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = `rgba(${r() > 0.5 ? '140,200,220' : '0,0,0'},${r() * 0.05})`;
    x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2);
  }
  // Rastros de borrado
  for (let i = 0; i < 14; i++) {
    x.strokeStyle = `rgba(160,220,235,${0.012 + r() * 0.02})`;
    x.lineWidth = 8 + r() * 22; x.lineCap = 'round';
    x.beginPath();
    const y = r() * 256;
    x.moveTo(r() * 80, y); x.quadraticCurveTo(128, y + (r() - 0.5) * 60, 176 + r() * 80, y + (r() - 0.5) * 40);
    x.stroke();
  }
  return c.toDataURL('image/png');
}

/** Corcho de tablón: gránulos ocres y oscuros, motas claras y alguna fibra. */
function corcho() {
  const [c, x] = lienzo(256, 256);
  const r = semilla(1234);
  x.fillStyle = '#6e4d2e';
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const t = r();
    const rad = 0.8 + r() * 3.2;
    x.fillStyle = t < 0.42 ? `rgba(40,22,8,${0.10 + r() * 0.22})`
      : t < 0.78 ? `rgba(168,120,70,${0.10 + r() * 0.22})`
        : `rgba(210,165,110,${0.06 + r() * 0.14})`;
    x.beginPath();
    x.ellipse(r() * 256, r() * 256, rad * (0.8 + r() * 0.8), rad, r() * 3, 0, Math.PI * 2);
    x.fill();
  }
  for (let i = 0; i < 70; i++) {          // poros oscuros
    x.fillStyle = `rgba(20,10,2,${0.25 + r() * 0.3})`;
    x.beginPath(); x.arc(r() * 256, r() * 256, 0.8 + r() * 1.6, 0, Math.PI * 2); x.fill();
  }
  // El patrón debe repetirse sin costuras: se copia el borde opuesto.
  x.globalAlpha = 0.5;
  x.drawImage(c, 0, 0, 256, 6, 0, 250, 256, 6);
  x.drawImage(c, 0, 0, 6, 256, 250, 0, 6, 256);
  x.globalAlpha = 1;
  return c.toDataURL('image/png');
}

/** Esquina dorada en filigrana (32×32), girada según la posición. */
function esquina(rot) {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'>
<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#fbe6a6'/><stop offset='.5' stop-color='#c8963a'/><stop offset='1' stop-color='#6b4710'/></linearGradient></defs>
<g transform='rotate(${rot} 17 17)'>
<path d='M1 1h20l-3 3H4v14l-3 3z' fill='url(#g)' stroke='#120a02' stroke-width='.8'/>
<path d='M7 7h9M7 7v9' stroke='#e9c779' stroke-width='1.1' stroke-linecap='round'/>
<path d='M4.5 4.5 11 11' stroke='#120a02' stroke-width='.8'/>
<rect x='9' y='9' width='4.2' height='4.2' transform='rotate(45 11.1 11.1)' fill='url(#g)' stroke='#120a02' stroke-width='.6'/>
<circle cx='24' cy='2.5' r='1.1' fill='#e9c779'/><circle cx='2.5' cy='24' r='1.1' fill='#e9c779'/>
</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
}

let hecho = false;
export function aplicarTexturas(destino = document.documentElement) {
  if (hecho) return;
  hecho = true;
  try {
    destino.style.setProperty('--cd-grano', `url(${grano()})`);
    destino.style.setProperty('--cd-metal', `url(${metal()})`);
    destino.style.setProperty('--cd-pizarra', `url(${pizarra()})`);
    destino.style.setProperty('--cd-corcho', `url(${corcho()})`);
    destino.style.setProperty('--cd-esquinas',
      `${esquina(0)} top left / 34px 34px no-repeat, ${esquina(90)} top right / 34px 34px no-repeat, ` +
      `${esquina(270)} bottom left / 34px 34px no-repeat, ${esquina(180)} bottom right / 34px 34px no-repeat`);
  } catch (e) {
    // Sin canvas (muy raro): el CSS tiene degradados de respaldo.
  }
}
