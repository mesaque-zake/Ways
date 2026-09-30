const CACHE_NAME = 'ways-v17';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './MesaLogo.png',
  './Icons/Favicon.png',
  './Icons/Icon180.png',
  './Icons/Icon192.png',
  './Icons/Icon512.png',
  './Icons/IconShare.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Fazendo cache dos arquivos da casca PWA...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Força o novo SW a assumir imediatamente
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => {
        console.log('Limpando cache antigo:', key);
        return caches.delete(key);
      })
    ))
  );
  self.clients.claim(); // Garante que a aba atual já use o novo SW
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => {
      // Retorna do cache se existir, senão busca na rede
      return res || fetch(e.request);
    })
  );
});
