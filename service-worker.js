// service-worker.js - basic offline cache
const CACHE = 'fakeit-v1';
const ASSETS = [
  './',
  './index.html',
  './js/main.js',
  './js/wiring.js',
  './js/progress.js',
  './js/simulation.js',
  './js/floorMap.js',
  './js/store.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
