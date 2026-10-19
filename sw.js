// Copia de la web dentro del móvil: primero intenta la versión de internet (así llegan los cambios);
// si no hay internet o GitHub falla, abre la última copia guardada.
var C = 'rutina-v1';
var FILES = ['./', './index.html', './manifest.json', './apple-touch-icon.png'];
self.addEventListener('install', function (e) { self.skipWaiting(); e.waitUntil(caches.open(C).then(function (c) { return c.addAll(FILES); }).catch(function () {})); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return;
  var key = r.mode === 'navigate' ? './' : r;
  e.respondWith(new Promise(function (resolve) {
    var done = false;
    function fromCache() { return caches.match(key, { ignoreSearch: true }).then(function (m) { return m || caches.match('./'); }); }
    var t = setTimeout(function () { fromCache().then(function (m) { if (m && !done) { done = true; resolve(m); } }); }, 6000);
    fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).then(function (res) {
      if (res && res.ok) {
        var cp = res.clone(); caches.open(C).then(function (c) { c.put(key, cp); });
        if (!done) { done = true; clearTimeout(t); resolve(res); }
      } else {
        fromCache().then(function (m) { if (!done) { done = true; clearTimeout(t); resolve(m || res); } });
      }
    }, function () {
      fromCache().then(function (m) { if (!done) { done = true; clearTimeout(t); resolve(m || Response.error()); } });
    });
  }));
});
