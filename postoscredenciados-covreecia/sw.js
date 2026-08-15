const CACHE_NAME = 'central-registros-static-v20260815-push-native-1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css?v=20260815-push-native-1',
  './app.js?v=20260815-push-native-1',
  './manifest.webmanifest',
  './assets/home/hero-posto.png',
  './assets/home/hero-revisao-km-desktop.jpeg',
  './assets/home/hero-revisao-km-mobile.jpeg',
  './assets/home/hero-posto-proximo-desktop.jpeg',
  './assets/home/hero-posto-proximo-mobile.jpeg',
  './assets/home/agro-show-2026.jpeg',
  './assets/home/mobile-alerta-painel.jpeg',
  './assets/home/mobile-placa-suja.jpeg',
  './assets/home/mobile-sinistro.jpeg',
  './assets/home/mobile-sinalizacao.jpeg',
  './assets/home/mobile-celular-volante.jpeg',
  './assets/home/mobile-agosto-lilas.jpg',
  './assets/home/buscar-postos.jpeg',
  './assets/home/registro-rapido.jpeg',
  './assets/home/registro-completo.jpeg',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png',
  './assets/pwa/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    payload = { body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Central de Registros';
  const options = {
    body: payload.body || 'Você recebeu um novo comunicado.',
    icon: './assets/pwa/icon-192.png',
    badge: './assets/pwa/icon-192.png',
    tag: payload.tag || 'central-comunicado',
    renotify: true,
    data: {
      url: payload.url || './'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification?.data?.url || './', self.location.href).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.registration.scope));
      if (existing) {
        existing.navigate(targetUrl);
        return existing.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => caches.match(request).then((cachedResponse) => cachedResponse || caches.match('./index.html')))
  );
});
