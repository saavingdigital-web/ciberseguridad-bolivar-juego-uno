/* CiberEscudo XR - Service worker: guarda el juego completo para usarlo sin internet.
 * Si cambias algún archivo, sube el número de VERSION para que el casco descargue lo nuevo.
 */
const VERSION = 'ciberescudo-v14';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icono.svg',
  './marca/escudo.png',
  './marca/logo_secretaria.png',
  './texturas/skybox_ciber_command.jpg',
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
  './modelos/scifi/sala_mando.glb',
  './audio/bienvenida.mp3',
  './audio/instrucciones.mp3',
  './audio/dinamica_acoso.mp3',
  './audio/dinamica_decision.mp3',
  './audio/cierre_solidario.mp3',
  './audio/duraciones.json',
  './audio/mensajes/c01.mp3',
  './audio/mensajes/c02.mp3',
  './audio/mensajes/c03.mp3',
  './audio/mensajes/c04.mp3',
  './audio/mensajes/c05.mp3',
  './audio/mensajes/c06.mp3',
  './audio/mensajes/c07.mp3',
  './audio/mensajes/c08.mp3',
  './audio/mensajes/c09.mp3',
  './audio/mensajes/c10.mp3',
  './audio/mensajes/c11.mp3',
  './audio/mensajes/c12.mp3',
  './audio/mensajes/c13.mp3',
  './audio/mensajes/c14.mp3',
  './audio/mensajes/c15.mp3',
  './audio/mensajes/c16.mp3',
  './audio/mensajes/c17.mp3',
  './audio/mensajes/c18.mp3',
  './audio/mensajes/c19.mp3',
  './audio/mensajes/c20.mp3',
  './audio/retro/c01.mp3',
  './audio/retro/c02.mp3',
  './audio/retro/c03.mp3',
  './audio/retro/c04.mp3',
  './audio/retro/c05.mp3',
  './audio/retro/c06.mp3',
  './audio/retro/c07.mp3',
  './audio/retro/c08.mp3',
  './audio/retro/c09.mp3',
  './audio/retro/c10.mp3',
  './audio/retro/c11.mp3',
  './audio/retro/c12.mp3',
  './audio/retro/c13.mp3',
  './audio/retro/c14.mp3',
  './audio/retro/c15.mp3',
  './audio/retro/c16.mp3',
  './audio/retro/c17.mp3',
  './audio/retro/c18.mp3',
  './audio/retro/c19.mp3',
  './audio/retro/c20.mp3'
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
