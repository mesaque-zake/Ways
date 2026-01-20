const CACHE_NAME = 'ways-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './MesaLogo.png',
  './Favicon.png',
  './icon-512.png',
  './icon-192.png' // Lembre-se de subir este arquivo!
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
