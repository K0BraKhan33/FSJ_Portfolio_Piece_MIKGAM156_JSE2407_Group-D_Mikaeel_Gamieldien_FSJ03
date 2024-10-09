// public/service-worker.js

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activated.');
  });
  
  self.addEventListener('fetch', (event) => {
    // Cache image requests
    if (event.request.destination === 'image') {
      event.respondWith(
        caches.open('image-cache').then((cache) => {
          return cache.match(event.request).then((response) => {
            // If found in cache, return the cached version
            return response || fetch(event.request).then((fetchResponse) => {
              // Cache the new image for future use
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          });
        })
      );
    }
  });
  