// UBAH VERSI DI SINI SETIAP KALI ADA PERUBAHAN FILE (HTML/JS/JSON)
const CACHE_NAME = 'kamus-fq-v17';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './data.json',
  './data-corrections.json',
  './data-corrections-wudhu.json',
  './manifest.json'
];

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
      })
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
