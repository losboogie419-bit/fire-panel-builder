// service-worker.js - cache current game
const CACHE = 'fakeit-v2';
const ASSETS = ['./', './index.html', './js/game.js', './manifest.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
