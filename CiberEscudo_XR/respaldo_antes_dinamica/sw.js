/* CiberEscudo XR - Service worker: guarda el juego completo para usarlo sin internet.
 * Si cambias algún archivo, sube el número de VERSION para que el casco descargue lo nuevo.
 */
const VERSION = 'ciberescudo-v4';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icono.svg',
  './vendor/aframe-v1.6.0.min.js',
  './js/datos.js',
  './js/audio.js',
  './js/juego.js',
  './fuentes/Orbitron.woff2',
  './fuentes/Rajdhani-600.woff2',
  './fuentes/Rajdhani-700.woff2',
  './modelos/mano_derecha.glb',
  './modelos/mano_izquierda.glb',
  './modelos/dron_mensaje.glb',
  './modelos/portal_marco.glb',
  './modelos/blaster_cian.glb',
  './modelos/blaster_naranja.glb',
  './modelos/amigo_holo.glb',
  './modelos/burbuja_acoso.glb',
  './modelos/escudo_amigo.glb',
  './modelos/accion_tarjeta.glb',
  './modelos/scifi/alien_cyclop.glb',
  './modelos/scifi/plataforma_mando.glb',
  './modelos/scifi/sala_mando.glb'
];

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(VERSION).then(cache => cache.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(c => c !== VERSION).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

// Primero la red (así llegan las actualizaciones); sin conexión, se usa la copia guardada.
self.addEventListener('fetch', evento => {
  if (evento.request.method !== 'GET') return;
  evento.respondWith(
    fetch(evento.request)
      .then(respuesta => {
        if (respuesta.ok && new URL(evento.request.url).origin === self.location.origin) {
          const copia = respuesta.clone();
          caches.open(VERSION).then(cache => cache.put(evento.request, copia));
        }
        return respuesta;
      })
      .catch(() => caches.match(evento.request, { ignoreSearch: true }))
  );
});
