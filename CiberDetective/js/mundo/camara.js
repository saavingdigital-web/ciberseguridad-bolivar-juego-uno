// Cámara estilo RTS clásico: perspectiva estrecha, inclinación fija, pan con teclado/bordes/botón central y zoom limitado
import * as THREE from 'three';
import { LIMITES_CAMARA } from './plano.js';
import { clamp } from './util.js';

const INCLINACION = THREE.MathUtils.degToRad(50);
const GIRO = Math.PI / 4;
const DIST_MIN = 42, DIST_MAX = 235;
const BORDE = 10; // px

export function crearControlCamara(camara, canvas) {
  const objetivo = new THREE.Vector3(-20, 0, 0);
  const destino = new THREE.Vector3().copy(objetivo);
  let dist = 150, distObj = 150;
  let suaveCentrar = false;
  let modoDemo = true;   // paneo cinematográfico detrás del menú hasta la primera orden de cámara
  let tDemo = 0;
  const teclas = new Set();
  const raton = { x: -1, y: -1, dentro: false, arrastre: false, ax: 0, ay: 0 };

  const adelante = () => new THREE.Vector3(-Math.sin(GIRO), 0, -Math.cos(GIRO));
  const derecha = () => new THREE.Vector3(Math.cos(GIRO), 0, -Math.sin(GIRO));

  const escribiendo = e => { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable); };
  const CODIGOS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  window.addEventListener('keydown', e => { if (!escribiendo(e) && CODIGOS.includes(e.code)) { teclas.add(e.code); if (e.code.startsWith('Arrow')) e.preventDefault(); } });
  window.addEventListener('keyup', e => teclas.delete(e.code));
  window.addEventListener('blur', () => { teclas.clear(); raton.dentro = false; });
  window.addEventListener('mousemove', e => { raton.x = e.clientX; raton.y = e.clientY; raton.dentro = true; });
  document.addEventListener('mouseleave', () => { raton.dentro = false; });
  window.addEventListener('mouseout', e => { if (!e.relatedTarget) raton.dentro = false; });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    modoDemo = false;
    distObj = clamp(distObj * Math.exp(e.deltaY * 0.0012), DIST_MIN, DIST_MAX);
  }, { passive: false });
  canvas.addEventListener('pointerdown', e => {
    if (e.button === 1) { e.preventDefault(); raton.arrastre = true; raton.ax = e.clientX; raton.ay = e.clientY; modoDemo = false; suaveCentrar = false; canvas.setPointerCapture?.(e.pointerId); }
  });
  canvas.addEventListener('auxclick', e => { if (e.button === 1) e.preventDefault(); });
  window.addEventListener('pointermove', e => {
    if (!raton.arrastre) return;
    const dx = e.clientX - raton.ax, dy = e.clientY - raton.ay;
    raton.ax = e.clientX; raton.ay = e.clientY;
    const mpp = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)) / Math.max(1, canvas.clientHeight);
    destino.addScaledVector(derecha(), -dx * mpp);
    destino.addScaledVector(adelante(), dy * mpp / Math.sin(INCLINACION));
    objetivo.copy(destino);
  });
  window.addEventListener('pointerup', e => { if (e.button === 1) raton.arrastre = false; });

  function limitar(v) {
    v.x = clamp(v.x, LIMITES_CAMARA.minX, LIMITES_CAMARA.maxX);
    v.z = clamp(v.z, LIMITES_CAMARA.minZ, LIMITES_CAMARA.maxZ);
  }

  function actualizar(dt) {
    dt = Math.min(dt, 0.05);
    if (modoDemo) {
      tDemo += dt;
      const a = tDemo * 0.045;
      destino.set(-10 + Math.cos(a) * 70, 0, -10 + Math.sin(a * 1.3) * 55);
      distObj = 120 + Math.sin(tDemo * 0.07) * 25;
      objetivo.lerp(destino, Math.min(1, dt * 0.6));
    } else {
      const mov = new THREE.Vector3();
      if (teclas.has('KeyW') || teclas.has('ArrowUp')) mov.add(adelante());
      if (teclas.has('KeyS') || teclas.has('ArrowDown')) mov.sub(adelante());
      if (teclas.has('KeyD') || teclas.has('ArrowRight')) mov.add(derecha());
      if (teclas.has('KeyA') || teclas.has('ArrowLeft')) mov.sub(derecha());
      if (raton.dentro && !raton.arrastre && document.hasFocus()) {
        const w = window.innerWidth, h = window.innerHeight;
        if (raton.x >= 0 && raton.x <= BORDE) mov.sub(derecha());
        if (raton.x >= w - BORDE && raton.x <= w) mov.add(derecha());
        if (raton.y >= 0 && raton.y <= BORDE) mov.add(adelante());
        if (raton.y >= h - BORDE && raton.y <= h) mov.sub(adelante());
      }
      if (mov.lengthSq() > 0) {
        suaveCentrar = false;
        mov.normalize().multiplyScalar(dist * 0.95 * dt);
        destino.add(mov);
        limitar(destino);
        objetivo.copy(destino);
      }
      if (suaveCentrar) {
        objetivo.lerp(destino, 1 - Math.exp(-dt * 5));
        if (objetivo.distanceTo(destino) < 0.05) { objetivo.copy(destino); suaveCentrar = false; }
      }
    }
    limitar(destino); limitar(objetivo);
    dist += (distObj - dist) * (1 - Math.exp(-dt * 8));
    const h = Math.sin(INCLINACION) * dist, r = Math.cos(INCLINACION) * dist;
    camara.position.set(objetivo.x + Math.sin(GIRO) * r, h, objetivo.z + Math.cos(GIRO) * r);
    camara.lookAt(objetivo);
  }

  function centrar(x, z, suave = true) {
    if (modoDemo) distObj = 125;   // al empezar la partida: encuadre de barrio centrado en la detective
    modoDemo = false;
    destino.set(x, 0, z);
    limitar(destino);
    if (suave) suaveCentrar = true; else { objetivo.copy(destino); suaveCentrar = false; }
  }

  // Cuatro esquinas del área visible proyectadas sobre el suelo (y = 0)
  const ray = new THREE.Raycaster(), plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p = new THREE.Vector3();
  const esquinas = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
  function vista() {
    camara.updateMatrixWorld();
    return esquinas.map(([x, y]) => {
      ray.setFromCamera({ x, y }, camara);
      if (!ray.ray.intersectPlane(plano, p)) { p.copy(ray.ray.origin).addScaledVector(ray.ray.direction, 1000); }
      return [p.x, p.z];
    });
  }

  return { objetivo, actualizar, centrar, vista, get distancia() { return dist; }, get demo() { return modoDemo; } };
}
