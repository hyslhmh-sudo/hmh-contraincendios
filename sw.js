/* HMH Contraincendios — funcionamiento sin conexión.
   Cada vez que publiques cambios en index.html, subí también este archivo
   cambiando el número de VERSION (v1 → v2 → v3...). */
const VERSION = 'hmh-v1';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(ARCHIVOS.map(a => c.add(a).catch(() => null))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // videos, formulario y Buzón van directo a internet
  if (req.mode === 'navigate') {
    // Primero intenta la versión más nueva; sin señal, usa la guardada.
    e.respondWith(fetch(req)
      .then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copia)); return r; })
      .catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
