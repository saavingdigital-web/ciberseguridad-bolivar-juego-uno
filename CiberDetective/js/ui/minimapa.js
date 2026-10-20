// CiberDetective · minimapa romboidal estilo AoE2
// El mundo (cuadrado en X/Z) se dibuja girado 45°: +X baja hacia la derecha y +Z baja hacia la izquierda,
// igual que la cámara isométrica. La capa estática (terreno, agua, calles, edificios) se cachea en un
// lienzo aparte; cada frame solo se pintan alertas, edificios asegurados, la detective y la vista de cámara.

const COLOR_TIPO = {
  central: '#3fd2ff', laboratorio: '#a98bff', banco: '#e7b23c', colegio: '#ff9a5a', cibercafe: '#ff5fb0',
  cafe: '#c99566', tienda: '#5fd0a0', torre: '#9fb4c8', alcaldia: '#e8d9b0', puerto: '#7e8fa3', casa: '#c7a98a'
};

export function crearMinimapa(contenedor, alElegir) {
  const canvas = document.createElement('canvas');
  canvas.className = 'cd-minimapa-lienzo';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Minimapa de Puerto Nexo. Haz clic para mover la cámara.');
  contenedor.append(canvas);
  const ctx = canvas.getContext('2d');
  const capa = document.createElement('canvas');
  const cctx = capa.getContext('2d');

  let W = 0, H = 0, dpr = 1;
  let firma = '';
  let datosRef = null;
  let tr = null;               // transformación actual
  let porId = new Map();       // id → edificio del minimapa
  let arrastrando = false;
  let pendiente = null;

  function medir() {
    const r = contenedor.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(40, Math.round(r.width * dpr)), hh = Math.max(30, Math.round(r.height * dpr));
    if (w !== W || hh !== H) {
      W = canvas.width = capa.width = w;
      H = canvas.height = capa.height = hh;
      firma = '';               // fuerza redibujar la capa estática
    }
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
  ro?.observe(contenedor);
  medir();

  function crearTransformacion(lim) {
    const minX = +lim?.minX || -100, maxX = +lim?.maxX || 100, minZ = +lim?.minZ || -100, maxZ = +lim?.maxZ || 100;
    const span = Math.max(maxX - minX, maxZ - minZ) || 1;
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    const k = 0.94;
    const sx = (W / 2) * k, sy = (H / 2) * k;
    return {
      span, cx, cz, minX, maxX, minZ, maxZ,
      escala: Math.min(sx, sy) * 2 / span,
      a(x, z) {
        const u = (x - cx) / span, v = (z - cz) / span;
        return [W / 2 + (u - v) * sx, H / 2 + (u + v) * sy];
      },
      inv(px, py) {
        const a = (px - W / 2) / sx, b = (py - H / 2) / sy;
        const u = (a + b) / 2, v = (b - a) / 2;
        return [cx + u * span, cz + v * span];
      }
    };
  }

  function caminoRombo(c) {
    const t = tr;
    const p = [t.a(t.cx - t.span / 2, t.cz - t.span / 2), t.a(t.cx + t.span / 2, t.cz - t.span / 2),
      t.a(t.cx + t.span / 2, t.cz + t.span / 2), t.a(t.cx - t.span / 2, t.cz + t.span / 2)];
    c.beginPath();
    p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.closePath();
  }

  function poligono(c, puntos, cerrar) {
    let ok = false;
    c.beginPath();
    for (const p of puntos || []) {
      if (!Array.isArray(p) || p.length < 2) continue;
      const [x, y] = tr.a(+p[0], +p[1]);
      if (!ok) { c.moveTo(x, y); ok = true; } else c.lineTo(x, y);
    }
    if (cerrar) c.closePath();
    return ok;
  }

  function rectEdificio(c, e, margen = 0) {
    const w = (+e.w || 6) / 2 + margen, d = (+e.d || 6) / 2 + margen, x = +e.x || 0, z = +e.z || 0;
    const p = [[x - w, z - d], [x + w, z - d], [x + w, z + d], [x - w, z + d]].map(([a, b]) => tr.a(a, b));
    c.beginPath();
    p.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py));
    c.closePath();
  }

  function dibujarEstatico(datos) {
    tr = crearTransformacion(datos?.limites);
    const c = cctx;
    c.clearRect(0, 0, W, H);
    c.save();
    caminoRombo(c);
    // Terreno: degradado cálido de tierra caribeña con viñeta
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#2c3a2a'); g.addColorStop(0.5, '#25311f'); g.addColorStop(1, '#1b2418');
    c.fillStyle = g; c.fill();
    c.clip();
    // Grano de terreno
    for (let i = 0; i < (W * H) / 90; i++) {
      c.fillStyle = Math.random() > 0.5 ? 'rgba(255,240,200,0.035)' : 'rgba(0,0,0,0.06)';
      c.fillRect(Math.random() * W, Math.random() * H, dpr, dpr);
    }
    // Agua
    for (const pol of datos?.agua || []) {
      if (!poligono(c, pol, true)) continue;
      const ga = c.createLinearGradient(0, 0, 0, H);
      ga.addColorStop(0, '#0f4f73'); ga.addColorStop(1, '#073047');
      c.fillStyle = ga; c.fill();
      c.strokeStyle = 'rgba(120,220,255,0.35)'; c.lineWidth = 1.2 * dpr; c.stroke();
    }
    // Calles
    const anchoCalle = Math.max(1.4 * dpr, tr.escala * 3.2);
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (const linea of datos?.calles || []) {
      if (!poligono(c, linea, false)) continue;
      c.strokeStyle = 'rgba(10,10,8,0.55)'; c.lineWidth = anchoCalle + 1.6 * dpr; c.stroke();
      c.strokeStyle = '#8f8673'; c.lineWidth = anchoCalle; c.stroke();
    }
    // Edificios
    porId = new Map();
    for (const e of datos?.edificios || []) {
      if (e.id) porId.set(e.id, e);
      rectEdificio(c, e);
      c.fillStyle = e.color || COLOR_TIPO[e.tipo] || '#b9a98c';
      c.globalAlpha = e.id ? 1 : 0.75;
      c.fill();
      c.globalAlpha = 1;
      c.strokeStyle = 'rgba(0,0,0,0.65)'; c.lineWidth = 0.8 * dpr; c.stroke();
    }
    c.restore();
    // Sombra interior del rombo
    c.save();
    caminoRombo(c);
    c.clip();
    c.shadowColor = 'rgba(0,0,0,0.9)'; c.shadowBlur = 14 * dpr;
    c.lineWidth = 6 * dpr; c.strokeStyle = 'rgba(0,0,0,0.6)';
    caminoRombo(c); c.stroke();
    c.restore();
    // Filete dorado
    caminoRombo(c);
    c.lineWidth = 1.6 * dpr; c.strokeStyle = '#c8963a'; c.stroke();
  }

  function dibujar(datos, extra = {}) {
    if (!W || !H) return;
    if (!tr || datos !== datosRef || !firma) {
      const f = datos ? `${W}x${H}|${JSON.stringify(datos.limites || {})}|${datos.calles?.length}|${datos.edificios?.length}|${datos.agua?.length}` : `${W}x${H}|vacio`;
      datosRef = datos;
      if (f !== firma) { firma = f; dibujarEstatico(datos); }
    }
    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(capa, 0, 0);
    ctx.save();
    caminoRombo(ctx);
    ctx.clip();

    // Edificios asegurados
    for (const id of extra.seguros || []) {
      const e = porId.get(id); if (!e) continue;
      rectEdificio(ctx, e, 1.5);
      ctx.fillStyle = 'rgba(46,229,157,0.55)'; ctx.fill();
      ctx.lineWidth = 1.4 * dpr; ctx.strokeStyle = '#7dffc8'; ctx.stroke();
    }
    // Alertas pulsantes
    for (const id of extra.alertas || []) {
      const e = porId.get(id); if (!e) continue;
      const [x, y] = tr.a(+e.x || 0, +e.z || 0);
      const fase = (t * 1.2) % 1;
      ctx.beginPath(); ctx.arc(x, y, (4 + fase * 12) * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,59,48,${0.9 * (1 - fase)})`; ctx.lineWidth = 2 * dpr; ctx.stroke();
      rectEdificio(ctx, e, 1);
      ctx.fillStyle = `rgba(255,59,48,${0.65 + 0.35 * Math.sin(t * 8)})`; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 2.6 * dpr, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    }
    // Vista de cámara
    const v = extra.vista;
    if (Array.isArray(v) && v.length >= 3) {
      ctx.beginPath();
      v.forEach((p, i) => { const [x, y] = tr.a(+p[0], +p[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
      ctx.lineWidth = 1.4 * dpr; ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      ctx.shadowColor = 'rgba(0,229,255,0.8)'; ctx.shadowBlur = 4 * dpr;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    // Detective
    const d = extra.detective;
    if (d && Number.isFinite(+d.x) && Number.isFinite(+d.z)) {
      const [x, y] = tr.a(+d.x, +d.z);
      const pul = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.beginPath(); ctx.arc(x, y, (5 + pul * 2.5) * dpr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,255,0.25)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 3.2 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5ff'; ctx.fill();
      ctx.lineWidth = 1.2 * dpr; ctx.strokeStyle = '#fff'; ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- Interacción: clic y arrastre ----------
  function aMundo(ev) {
    if (!tr) return null;
    const r = canvas.getBoundingClientRect();
    const px = (ev.clientX - r.left) * (W / r.width), py = (ev.clientY - r.top) * (H / r.height);
    let [x, z] = tr.inv(px, py);
    x = Math.max(tr.minX, Math.min(tr.maxX, x));
    z = Math.max(tr.minZ, Math.min(tr.maxZ, z));
    return { x, z };
  }
  function emitir(ev) {
    const p = aMundo(ev);
    if (!p) return;
    pendiente = p;
    requestAnimationFrame(() => { if (pendiente) { alElegir(pendiente); pendiente = null; } });
  }
  canvas.addEventListener('pointerdown', ev => {
    if (ev.button !== 0) return;
    arrastrando = true;
    canvas.setPointerCapture?.(ev.pointerId);
    emitir(ev);
  });
  canvas.addEventListener('pointermove', ev => { if (arrastrando) emitir(ev); });
  const soltar = ev => { arrastrando = false; canvas.releasePointerCapture?.(ev.pointerId); };
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('contextmenu', ev => ev.preventDefault());

  return { dibujar, medir };
}
