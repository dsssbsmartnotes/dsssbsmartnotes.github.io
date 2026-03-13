const CACHE_NAME = 'dsssb-pyq-main-v4'; // Version bumped to force update

const urlsToCache = [
  '/',
  '/index.html',
  '/cbt.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://telegram.org/js/telegram-web-app.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Install Event
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened Play Store cache main-v4');
        return Promise.allSettled(urlsToCache.map(url => cache.add(url).catch(e => console.log('Cache fail:', url)))); 
      })
  );
});

// Activate Event (Cleans up old versions)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event (SMART: Network First for HTML, Cache First for assets)
self.addEventListener('fetch', event => {
  const req = event.request;
  
  // Only apply to GET requests
  if (req.method !== 'GET') return;

  // For HTML files (index.html, cbt.html), ALWAYS try network first so they get updates
  if (req.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // For Images, CSS, JS - Cache First, then Network
  event.respondWith(
    caches.match(req).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(req).then(networkResponse => {
        // Optional: Can add new assets to cache dynamically here
        return networkResponse;
      });
    }).catch(() => {
      // Fallback if both cache and network fail
      console.log('Fetch failed for:', req.url);
    })
  );
});
