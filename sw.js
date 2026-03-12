self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) { self.clients.claim(); });
self.addEventListener('fetch', function(e) {
  // basic offline fallback strategy
  e.respondWith(fetch(e.request).catch(function() { return caches.match(e.request); }));
});
