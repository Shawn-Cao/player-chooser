const CACHE_NAME = 'player-chooser-v2';
const STATIC_CACHE = 'player-chooser-static-v1';
const BASE_PATH = '/player-chooser';
const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/styles.css`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/ios-install.js`,
  `${BASE_PATH}/manifest.json`
];
const staticAssets = [
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets (icons) - these rarely change
      caches.open(STATIC_CACHE).then((cache) => {
        return Promise.allSettled(
          staticAssets.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache static ${url}:`, err);
              return null;
            })
          )
        );
      }),
      // Cache main files
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Opened cache');
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
    ]).then(() => {
      // Skip waiting to activate new service worker immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - network-first strategy for dynamic content, cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle requests within our scope (/player-chooser/)
  if (!url.pathname.startsWith('/player-chooser/')) {
    return; // Let browser handle requests outside our scope
  }
  
  const isStaticAsset = staticAssets.some(asset => url.pathname === asset || url.pathname.endsWith(asset));
  
  if (isStaticAsset) {
    // Cache-first for static assets (icons)
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          // Cache the fetched response for future use
          const responseToCache = fetchResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        });
      })
    );
  } else {
    // Network-first for dynamic content (HTML, JS, CSS)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If network request succeeds, update cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
  }
});

