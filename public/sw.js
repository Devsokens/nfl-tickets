const CACHE_NAME = 'nfl-ga-pwa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.jpg',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/assets/Logo_NFL_fond_marron__écrits_jaune_-removebg-preview.png',
  '/assets/Logo_NFL_fond_blanc-removebg-preview.png'
];

// Phase d'installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Phase d'activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie de mise en cache : Network First avec secours Cache (Offline First pour assets)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Ignorer les appels API dynamiques Supabase / externes du cache SW direct pour données en direct
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept')?.includes('text/html')) {
            // Toute route SPA (ex: /admin) retombe sur l'index caché.
            return caches.match('/').then((indexResponse) => {
              if (indexResponse) return indexResponse;
              // Rien en cache non plus : jamais renvoyer `undefined` à
              // respondWith(), sous peine de "Failed to convert value to
              // 'Response'" côté navigateur. On répond une vraie erreur.
              return new Response('Hors ligne : contenu indisponible.', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
              });
            });
          }
          // Requête non-HTML (JS/CSS/image) sans version en cache : échec
          // réseau explicite plutôt qu'une réponse `undefined` invalide.
          return new Response(null, { status: 504, statusText: 'Gateway Timeout' });
        });
      })
  );
});
