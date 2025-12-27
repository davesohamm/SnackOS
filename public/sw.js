const CACHE_NAME = 'snackos-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/assets/wallpapers/calm-forest-landscape-under-clouds-hu.jpg',
  '/assets/wallpapers/apple-chinese-new-year-mac-mt.jpg',
  '/assets/wallpapers/ghost-ol.jpg',
  '/assets/wallpapers/chamonix-mountains-5k-ih.jpg',
  '/assets/wallpapers/pilot-pikachu-journey-ar.jpg',
  '/assets/wallpapers/pikachu-seeing-fireworks-9r.jpg',
  '/assets/wallpapers/pikachu-beyond-the-horizon-42.jpg',
  '/assets/png-icons/icons8-github-50.png',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Cache-first strategy for images and assets
  if (event.request.destination === 'image' || event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response; // Return cached version immediately
          }
          
          // Not in cache, fetch from network and cache it
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Network-first strategy for HTML, JS, CSS
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache the new version
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          return new Response('Offline - SnackOS', {
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

