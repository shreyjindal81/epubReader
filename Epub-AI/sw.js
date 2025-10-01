// Service Worker for EPUB Reader PWA
// Version 1.0.0

const CACHE_VERSION = 'epub-reader-v1';
const CACHE_NAME = CACHE_VERSION;

// Files to cache for offline functionality
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './css/reader.css',
  './css/responsive.css',
  './js/app.js',
  './js/epub-handler.js',
  './js/reader.js',
  './js/navigation.js',
  './js/storage.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/jszip/dist/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Otherwise, fetch from network
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses for future use
            // Only cache responses from our origin or CDN
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              const url = event.request.url;
              
              // Cache if it's a static asset or from our allowed CDN
              if (url.includes(self.registration.scope) || 
                  url.includes('cdn.jsdelivr.net')) {
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
            }
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // If we're offline and the request is for the main page,
            // return the cached index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            throw error;
          });
      })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});