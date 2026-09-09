const CACHE_NAME = 'kamus-fq-v2';

// Daftar file yang WAJIB disimpan di memori HP saat pertama kali diakses
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './data.json',
  './manifest.json'
];

// PROSES 1: Menyimpan file ke memori HP saat pertama kali dibuka
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Menyimpan aplikasi untuk mode offline...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// PROSES 2: Mencegat permintaan saat aplikasi mencari file
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika internet mati tapi file ada di memori HP, berikan file tersebut
      return cachedResponse || fetch(event.request);
    })
  );
});
