// UBAH VERSI DI SINI SETIAP KALI ADA PERUBAHAN FILE (HTML/JS/JSON)
const CACHE_NAME = 'kamus-fq-v131';

const ASSETS_TO_CACHE = [
  './', './index.html', './app.js', './data.json',
  ...Array.from({ length: 63 }, (_, index) => `./data-bab${index + 2}.json`),
  './index-v2-prototype.html', './app-v2-prototype.js', './data-v2-thaharah-opening-test-v24.json',
  './index-v2-live-test-v3.html', './app-v2-live-test-v3.js', './manifest.json'
];

const DATA_FILES = new Set([
  'data.json',
  ...Array.from({ length: 63 }, (_, index) => `data-bab${index + 2}.json`),
  'data-v2-thaharah-opening-test-v24.json'
]);

const NETWORK_FIRST_FILES = new Set([
  'index.html',
  'index-v2-prototype.html',
  'app-v2-prototype.js',
  'index-v2-live-test-v3.html',
  'app-v2-live-test-v3.js',
  'manifest.json',
  'sw.js'
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((name) => name === CACHE_NAME ? undefined : caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const filename = url.pathname.split('/').pop();
  if (NETWORK_FIRST_FILES.has(filename) || DATA_FILES.has(filename)) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
