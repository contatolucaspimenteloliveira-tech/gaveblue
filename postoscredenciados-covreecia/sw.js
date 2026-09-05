const CENTRAL_RELEASE = '20260905-central-reconfiguration-1';
const CENTRAL_SCOPE_KEY = new URL(self.registration.scope).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'root';
const CACHE_PREFIX = `central-registros-static-${CENTRAL_SCOPE_KEY}-v`;
const CACHE_NAME = `${CACHE_PREFIX}${CENTRAL_RELEASE}`;
const CENTRAL_ASSET_BASE_URL = new URL(self.CENTRAL_ASSET_BASE || './', self.location.href);
const CENTRAL_SHELL_URL = new URL(self.CENTRAL_SHELL_URL || './index.html', self.location.href).href;
const CENTRAL_SOURCE_SHELL_URL = new URL(self.CENTRAL_SOURCE_SHELL_URL || './index.html', self.location.href).href;
const CENTRAL_MANIFEST_URL = new URL(self.CENTRAL_MANIFEST_URL || './manifest.webmanifest', self.location.href).href;
const centralAssetUrl = (path) => new URL(path, CENTRAL_ASSET_BASE_URL).href;
const STATIC_ASSETS = Array.from(new Set([
  CENTRAL_SHELL_URL,
  CENTRAL_SOURCE_SHELL_URL,
  CENTRAL_MANIFEST_URL,
  './styles.css?v=20260905-central-reconfiguration-1',
  './app.js?v=20260905-central-reconfiguration-1',
  './assets/brand/covre-e-cia.png',
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
  './assets/cidades/boa-esperanca.jpeg',
  './assets/cidades/montanha.jpeg',
  './assets/cidades/nova-venecia.jpeg',
  './assets/cidades/pedro-canario.jpeg',
  './assets/cidades/pinheiros.jpeg',
  './assets/cidades/sao-mateus.jpeg',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png',
  './assets/pwa/icon-maskable-512.png',
  './assets/pwa/icon-central-192.png',
  './assets/pwa/icon-central-512.png',
  './assets/pwa/icon-central-maskable-512.png'
].map((asset) => /^https?:/i.test(asset) ? asset : centralAssetUrl(asset))));

const OPTIONAL_REMOTE_ASSETS = [
  'https://cdn.tailwindcss.com/3.4.17',
  'https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@7.3.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

const CENTRAL_NOTIFICATIONS_DB = 'central-registros-notifications-v1';
const CENTRAL_NOTIFICATIONS_STORE = 'notifications';

async function cacheOptionalRemoteAsset(cache, asset) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(asset, { signal: controller.signal });
    if (response.ok || response.type === 'opaque') await cache.put(asset, response);
  } catch (error) {
    // Recursos externos melhoram o visual, mas nunca podem bloquear a instalação.
  } finally {
    clearTimeout(timeoutId);
  }
}

function openCentralNotificationsDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CENTRAL_NOTIFICATIONS_DB, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CENTRAL_NOTIFICATIONS_STORE)) {
        const store = database.createObjectStore(CENTRAL_NOTIFICATIONS_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storeCentralNotification(notification) {
  const database = await openCentralNotificationsDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(CENTRAL_NOTIFICATIONS_STORE, 'readwrite');
    transaction.objectStore(CENTRAL_NOTIFICATIONS_STORE).put(notification);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function markCentralNotificationRead(id) {
  if (!id) return;
  const database = await openCentralNotificationsDb();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(CENTRAL_NOTIFICATIONS_STORE, 'readwrite');
    const store = transaction.objectStore(CENTRAL_NOTIFICATIONS_STORE);
    const request = store.get(id);
    request.onsuccess = () => {
      if (request.result) store.put({ ...request.result, read: true });
    };
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        await cache.addAll(STATIC_ASSETS);
        await Promise.allSettled(OPTIONAL_REMOTE_ASSETS.map((asset) => cacheOptionalRemoteAsset(cache, asset)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => clients.forEach((client) => {
        const clientUrl = new URL(client.url);
        if (!clientUrl.href.startsWith(self.registration.scope)) {
          return;
        }
        // A release must never reload a driver's in-progress form or discard
        // a receipt selected in memory. New navigation picks up this worker.
        client.postMessage({ type: 'CENTRAL_UPDATE_AVAILABLE', release: CENTRAL_RELEASE });
      }))
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
  const notificationId = payload.notificationId || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const storedNotification = {
    id: notificationId,
    title,
    body: payload.body || 'Você recebeu um novo comunicado.',
    url: payload.url || './',
    tag: payload.tag || 'central-comunicado',
    createdAt: new Date().toISOString(),
    read: false,
    workspaceId: String(payload.workspaceId || 'covre-e-cia')
  };
  const options = {
    body: storedNotification.body,
    icon: centralAssetUrl('./assets/pwa/icon-192.png'),
    badge: centralAssetUrl('./assets/pwa/icon-192.png'),
    tag: payload.tag || 'central-comunicado',
    renotify: true,
    data: {
      url: storedNotification.url,
      notificationId,
      workspaceId: storedNotification.workspaceId
    }
  };

  const persistAndNotifyClients = storeCentralNotification(storedNotification)
    .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
    .then((clients) => clients.forEach((client) => client.postMessage({ type: 'CENTRAL_NOTIFICATION_RECEIVED' })))
    .catch((error) => console.warn('Central: não foi possível salvar o aviso no histórico.', error));

  event.waitUntil(Promise.all([
    persistAndNotifyClients,
    self.registration.showNotification(title, options)
  ]));
});

self.addEventListener('sync', (event) => {
  if (event.tag !== 'central-offline-submissions') return;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => clients.forEach((client) => {
        client.postMessage({ type: 'CENTRAL_SYNC_OFFLINE_SUBMISSIONS' });
      }))
  );
});

function resolveCentralNotificationTarget(data = {}) {
  const scopeUrl = new URL(self.registration.scope);
  let targetUrl;
  try {
    targetUrl = new URL(String(data?.url || './'), scopeUrl);
    if (targetUrl.origin !== scopeUrl.origin || targetUrl.username || targetUrl.password ||
        !['https:', 'http:'].includes(targetUrl.protocol)) targetUrl = new URL(scopeUrl);
  } catch (error) {
    targetUrl = new URL(scopeUrl);
  }

  // The same Central is installed under two manifest identities. A notification
  // must stay in the receiving installation's scope instead of moving a legacy
  // PWA to /central/ and triggering the browser's out-of-scope address bar.
  const isCentralEntry = /^\/(?:central|postoscredenciados-covreecia)(?:\/(?:index\.html)?)?$/.test(targetUrl.pathname);
  const workspaceId = String(data?.workspaceId || '').trim();
  const hasWorkspace = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workspaceId);
  const targetWorkspace = hasWorkspace ? workspaceId : targetUrl.searchParams.get('empresa') || '';
  if (isCentralEntry) {
    // The legacy shell is Covre-only and ignores empresa. Other companies must
    // use the neutral shell; staying standalone never takes priority over tenant.
    targetUrl.pathname = scopeUrl.pathname === '/postoscredenciados-covreecia/' &&
      targetWorkspace && targetWorkspace !== 'covre-e-cia' ? '/central/' : scopeUrl.pathname;
  }
  if (isCentralEntry || targetUrl.pathname.startsWith(scopeUrl.pathname)) {
    if (hasWorkspace) targetUrl.searchParams.set('empresa', workspaceId);
  }
  return targetUrl;
}

async function openCentralNotificationTarget(targetUrl) {
  const scopeUrl = new URL(self.registration.scope);
  const targetWorkspace = targetUrl.searchParams.get('empresa') || '';
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true }).catch(() => []);
  const existing = clients.find((client) => {
    try {
      const clientUrl = new URL(client.url);
      // Never navigate another company's already-open Central or another app.
      const clientWorkspace = clientUrl.searchParams.get('empresa') ||
        (scopeUrl.pathname === '/postoscredenciados-covreecia/' ? 'covre-e-cia' : '');
      return targetUrl.origin === scopeUrl.origin && targetUrl.pathname.startsWith(scopeUrl.pathname) &&
        clientUrl.origin === scopeUrl.origin && clientUrl.pathname.startsWith(scopeUrl.pathname) &&
        clientWorkspace === targetWorkspace;
    } catch (error) { return false; }
  });
  if (existing) {
    try {
      // Focusing the same URL must not reload an in-progress form.
      const opened = existing.url === targetUrl.href ? existing : await existing.navigate(targetUrl.href);
      if (opened) return await opened.focus();
    } catch (error) {
      // A window may disappear between matchAll() and focus().
    }
  }
  return self.clients.openWindow(targetUrl.href);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = resolveCentralNotificationTarget(event.notification?.data);
  event.waitUntil(Promise.all([
    // Notification history cannot delay or prevent opening the installed app.
    markCentralNotificationRead(event.notification?.data?.notificationId).catch(() => null),
    openCentralNotificationTarget(targetUrl)
  ]));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    if (!['image', 'script', 'style', 'font'].includes(request.destination)) return;
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => cache.match(request)).then((cachedResponse) => {
        const networkResponse = fetch(request).then((response) => {
          if (response.ok || response.type === 'opaque') {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
        if (cachedResponse) {
          event.waitUntil(networkResponse.catch(() => null));
          return cachedResponse;
        }
        return networkResponse;
      })
    );
    return;
  }

  const isNavigation = request.mode === 'navigate';
  // /central/ fetches its shared HTML shell instead of navigating to it.
  // Treat that fetch and the manifest as documents too; stale-while-revalidate
  // could otherwise boot an old app from a different installation's cache.
  const documentUrl = [CENTRAL_SHELL_URL, CENTRAL_SOURCE_SHELL_URL, CENTRAL_MANIFEST_URL]
    .find((url) => new URL(url).pathname === requestUrl.pathname);
  const isAppDocument = isNavigation || !!documentUrl;
  const networkRequest = isAppDocument
    ? new Request(request, { cache: 'no-store' })
    : request;

  if (isAppDocument) {
    const cacheKey = isNavigation ? CENTRAL_SHELL_URL : documentUrl;
    event.respondWith(
      fetch(networkRequest)
        .then(async (response) => {
          if (!response.ok) throw new Error('Central app document unavailable');
          // A quota/storage failure must not discard a valid online page.
          try { await (await caches.open(CACHE_NAME)).put(cacheKey, response.clone()); } catch (error) {}
          return response;
        })
        .catch(async () => {
          const cached = await (await caches.open(CACHE_NAME)).match(cacheKey);
          return cached || new Response('', { status: 503, statusText: 'Offline app unavailable' });
        })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => cache.match(request)).then((cachedResponse) => {
      const networkResponse = fetch(networkRequest).then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        return response;
      });
      if (cachedResponse) {
        event.waitUntil(networkResponse.catch(() => null));
        return cachedResponse;
      }
      return networkResponse.catch(() => new Response('', {
        status: 503,
        statusText: 'Offline resource unavailable'
      }));
    })
  );
});

