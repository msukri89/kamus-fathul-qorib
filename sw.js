// UBAH VERSI DI SINI SETIAP KALI ADA PERUBAHAN FILE (HTML/JS/JSON)
const CACHE_NAME = 'kamus-fq-v130';

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
  './data-bab27.json',
  './data-bab28.json',
  './data-bab29.json',
  './data-bab30.json',
  './data-bab31.json',
  './data-bab32.json',
  './data-bab33.json',
  './data-bab34.json',
  './data-bab35.json',
  './data-bab36.json',
  './data-bab37.json',
  './data-bab38.json',
  './data-bab39.json',
  './data-bab40.json',
  './data-bab41.json',
  './data-bab42.json',
  './data-bab43.json',
  './data-bab44.json',
  './data-bab45.json',
  './data-bab46.json',
  './data-bab47.json',
  './data-bab48.json',
  './data-bab49.json',
  './data-bab50.json',
  './data-bab51.json',
  './data-bab52.json',
  './data-bab53.json',
  './data-bab54.json',
  './data-bab55.json',
  './data-bab56.json',
  './data-bab57.json',
  './data-bab58.json',
  './data-bab59.json',
  './data-bab60.json',
  './data-bab61.json',
  './data-bab62.json',
  './data-bab63.json',
  './data-bab64.json',
  './index-v2-prototype.html',
  './app-v2-prototype.js',
  './data-v2-thaharah-opening-test-v24.json',
  './manifest.json'
];

const DATA_FILES = new Set([
  'data.json',
  ...Array.from({ length: 63 }, (_, index) => `data-bab${index + 2}.json`),
  'data-v2-thaharah-opening-test-v24.json'
]);

const PROTOTYPE_FILES = new Set([
  'index-v2-prototype.html',
  'app-v2-prototype.js'
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

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const filename = url.pathname.split('/').pop();
  const isDataFile = DATA_FILES.has(filename);
  const isPrototypeFile = PROTOTYPE_FILES.has(filename);

  if (isDataFile || isPrototypeFile) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
