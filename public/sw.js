// Service Worker for Face Academy PWA
// Provides offline functionality, caching, and performance improvements

const CACHE_NAME = 'face-academy-v1.0.0';
const STATIC_CACHE = 'face-academy-static-v1';
const DYNAMIC_CACHE = 'face-academy-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.url.includes('/api/') || request.url.includes('supabase.co')) {
    // API requests - network first, cache as fallback
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === 'image') {
    // Image requests - cache first
    event.respondWith(handleImageRequest(request));
  } else {
    // Other requests - cache first, network as fallback
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle API requests (network first)
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📡 Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for API failures
    return new Response(
      JSON.stringify({
        error: 'Offline - API not available',
        message: 'Please check your internet connection and try again.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle image requests (cache first)
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache images for future use
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('🖼️ Image load failed:', request.url);
    
    // Return placeholder image
    return new Response(
      '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">📷</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle static requests (cache first)
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📄 Static resource failed:', request.url);
    
    // Return offline fallback
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/') || new Response(
        '<!DOCTYPE html><html><head><title>Face Academy - Offline</title></head><body><h1>🔌 You\'re Offline</h1><p>Please check your internet connection.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-training-data') {
    event.waitUntil(syncTrainingData());
  }
});

// Sync training data when back online
async function syncTrainingData() {
  try {
    console.log('📤 Syncing training data...');
    
    // Get pending sync data from IndexedDB
    const pendingData = await getPendingSyncData();
    
    if (pendingData.length > 0) {
      for (const data of pendingData) {
        try {
          await fetch('/api/sync-training', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          // Remove from pending sync
          await removePendingSyncData(data.id);
        } catch (error) {
          console.error('Sync failed for item:', data.id, error);
        }
      }
    }
    
    console.log('✅ Training data sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Face Academy notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Face Academy',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Face Academy', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync triggered:', event.tag);
  
  if (event.tag === 'model-update-check') {
    event.waitUntil(checkForModelUpdates());
  }
});

// Check for model updates
async function checkForModelUpdates() {
  try {
    console.log('🔍 Checking for model updates...');
    
    const response = await fetch('/api/model-version');
    const { version } = await response.json();
    
    // Compare with cached version
    const cache = await caches.open(STATIC_CACHE);
    const cachedVersion = await cache.match('/model-version');
    
    if (!cachedVersion || version !== await cachedVersion.text()) {
      console.log('📥 New model version available:', version);
      
      // Notify all clients about update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'MODEL_UPDATE_AVAILABLE',
          version
        });
      });
    }
  } catch (error) {
    console.error('❌ Model update check failed:', error);
  }
}

// Utility functions for IndexedDB operations
async function getPendingSyncData() {
  // Implementation would use IndexedDB to get pending sync data
  return [];
}

async function removePendingSyncData(id) {
  // Implementation would remove synced data from IndexedDB
  console.log('Removed pending sync data:', id);
}

// Message handling
self.addEventListener('message', (event) => {
  console.log('💬 SW received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎓 Face Academy Service Worker loaded');
