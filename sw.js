// UBAH VERSI DI SINI SETIAP KALI ADA PERUBAHAN FILE (HTML/JS/JSON)
const CACHE_NAME = 'kamus-fq-v42';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './data.json',
  './data-corrections.json',
  './data-corrections-wudhu.json',
  './data-corrections-sunnah-wudhu.json',
  './data-corrections-nawaqidh-wudhu.json',
  './data-corrections-mujibat-ghusl.json',
  './data-corrections-fardhu-ghusl.json',
  './data-corrections-sunnah-ghusl.json',
  './data-corrections-aghsaal-sunnah.json',
  './data-corrections-khuff.json',
  './data-corrections-tayammum.json',
  './data-corrections-jabirah.json',
  './data-corrections-haid-nifas-istihadhah.json',
  './data-corrections-larangan-haid-junub-hadats.json',
  './data-corrections-thaharah-dasar.json',
  './data-corrections-thaharah-air.json',
  './data-corrections-thaharah-air-qc.json',
  './data-corrections-tathir-julud-maitah.json',
  './data-corrections-awani.json',
  './data-corrections-siwak.json',
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
