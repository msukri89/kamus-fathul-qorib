// UBAH VERSI DI SINI SETIAP KALI ADA PERUBAHAN FILE (HTML/JS/JSON)
const CACHE_NAME = 'kamus-fq-v83';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './data.json',
  './data-bab2.json',
  './data-bab3.json',
  './data-bab4.json',
  './data-bab5.json',
  './data-bab6.json',
  './data-bab7.json',
  './data-bab8.json',
  './data-bab9.json',
  './data-bab10.json',
  './data-bab11.json',
  './data-bab12.json',
  './data-bab13.json',
  './data-bab14.json',
  './data-bab15.json',
  './data-bab16.json',
  './data-bab17.json',
  './data-bab18.json',
  './data-bab19.json',
  './data-bab20.json',
  './data-bab21.json',
  './data-bab22.json',
  './data-bab23.json',
  './data-bab24.json',
  './data-bab25.json',
  './data-bab26.json',
  './manifest.json'
];

const DATA_FILES = new Set([
  'data.json',
  'data-bab2.json',
  'data-bab3.json',
  'data-bab4.json',
  'data-bab5.json',
  'data-bab6.json',
  'data-bab7.json',
  'data-bab8.json',
  'data-bab9.json',
  'data-bab10.json',
  'data-bab11.json',
  'data-bab12.json',
  'data-bab13.json',
  'data-bab14.json',
  'data-bab15.json',
  'data-bab16.json',
  'data-bab17.json',
  'data-bab18.json',
  'data-bab19.json',
  'data-bab20.json',
  'data-bab21.json',
  'data-bab22.json',
  'data-bab23.json',
  'data-bab24.json',
  'data-bab25.json',
  'data-bab26.json'
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Menyimpan aplikasi versi baru...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cache) => {
        if (cache !== CACHE_NAME) return caches.delete(cache);
        return undefined;
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isDataFile = DATA_FILES.has(url.pathname.split('/').pop());

  if (isDataFile) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) =>
                cache.put(event.request, networkResponse.clone())
              )
            );
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
