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

// Notifications push (Web Push standard, indépendant du cache PWA ci-dessous).
// Le payload est envoyé par le backend en JSON : { title, body, url?, tag? }
// (voir nfl-backend/src/push/push.service.ts).
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'NFL Courtier & Service', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'NFL Courtier & Service', {
      body: payload.body,
      icon: '/favicon.jpg',
      badge: '/favicon.jpg',
      tag: payload.tag,
      data: { url: payload.url || '/admin' },
    })
  );
});

// Clic sur la notification : ouvre (ou refocus) l'onglet admin sur la bonne page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(new URL(targetUrl, self.location.origin).pathname) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clientList.length > 0 && 'focus' in clientList[0]) {
        clientList[0].navigate(targetUrl);
        return clientList[0].focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

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
