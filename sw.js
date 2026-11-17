/* NYC Guide Service Worker – offline shell + cache */
const CACHE = 'nyc-guide-v20261117b';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Network-first for APIs (weather, wiki, fx)
  if (
    url.hostname.includes('open-meteo') ||
    url.hostname.includes('wikipedia') ||
    url.hostname.includes('wikimedia') ||
    url.hostname.includes('frankfurter') ||
    url.hostname.includes('nominatim') ||
    url.hostname.includes('tile.openstreetmap')
  ) {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        if (r.ok && e.request.method === 'GET') {
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r.ok && e.request.method === 'GET' && url.origin === self.location.origin) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return r;
      }).catch(() => caches.match('./index.html'));
    })
  );
});


/* ניסיון למקד חלון קיים כשמגיעה בקשת ניווט חוזרת */
self.addEventListener('message', async (event) => {
  if (!event.data || event.data.type !== 'focus-existing') return;
  const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const c of all) {
    if (c.url && c.url.includes(self.registration.scope) && 'focus' in c) {
      try { await c.focus(); } catch (e) {}
    }
  }
});
