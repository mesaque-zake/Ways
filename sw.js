const CACHE_NAME = 'ways-v20';

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

const NETWORK_TIMEOUT = 3000; // Tempo-limite (ms) para considerar a rede fraca

// Busca na rede ignorando o cache intermediário e atualiza o cache com a versão nova
function fetchAndCache(req) {
  return fetch(req, { cache: 'no-cache' }).then(res => {
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    }
    return res;
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Só trata GET do próprio site. GAS e fontes do Google vão direto para a rede
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  const networkPromise = fetchAndCache(req);
  e.waitUntil(networkPromise.catch(() => {})); // Mantém a atualização do cache viva em segundo plano

  e.respondWith(
    new Promise((resolve) => {
      const fromCache = () => caches.match(req, { ignoreSearch: true });

      // Rede fraca: passou do tempo-limite, responde com o cache (se existir)
      const timer = setTimeout(() => {
        fromCache().then(cached => { if (cached) resolve(cached); });
      }, NETWORK_TIMEOUT);

      // Rede respondeu a tempo: usa a versão nova
      networkPromise.then(res => {
        clearTimeout(timer);
        resolve(res);
      }).catch(() => {
        // Sem rede: usa o cache
        clearTimeout(timer);
        fromCache().then(cached => resolve(cached || Response.error()));
      });
    })
  );
});
