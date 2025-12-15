self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
self.addEventListener('install', (event) => {
  // Força o novo Service Worker a ativar imediatamente, sem esperar o antigo fechar
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Assume o controle de todas as abas/janelas abertas imediatamente
  event.waitUntil(self.clients.claim());
});
