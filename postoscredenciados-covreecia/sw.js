const CENTRAL_RELEASE = '20260824-install-progress-1';
const CACHE_NAME = `central-registros-static-v${CENTRAL_RELEASE}`;
const APPWRITE_AUTH_CACHE = 'central-registros-appwrite-auth-v1';
const APPWRITE_ENDPOINT_ORIGIN = 'https://nyc.cloud.appwrite.io';
const APPWRITE_PROJECT_ID = '6a68cb3e00312ec0a3fd';
const APPWRITE_CENTRAL_ROWS_PATH = '/v1/tablesdb/6a68ce8c000a36a44d98/tables/central_registros_pendentes/rows';
const APPWRITE_FALLBACK_CACHE_KEY = new URL('./__central_appwrite_fallback_cookie__', self.location.href).href;
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css?v=20260824-install-progress-1',
  './app.js?v=20260824-install-progress-1',
  './manifest.webmanifest',
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
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png',
  './assets/pwa/icon-maskable-512.png'
];

const CENTRAL_NOTIFICATIONS_DB = 'central-registros-notifications-v1';
const CENTRAL_NOTIFICATIONS_STORE = 'notifications';

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
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== APPWRITE_AUTH_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => Promise.all(clients.map((client) => {
        const clientUrl = new URL(client.url);
        if (!clientUrl.href.startsWith(self.registration.scope)) {
          return null;
        }

        // Atualiza também páginas antigas que ainda não possuem o listener de
        // controllerchange. A navegação acontece uma única vez por release.
        clientUrl.searchParams.set('central-release', CENTRAL_RELEASE);
        return client.navigate(clientUrl.href).catch(() => null);
      })))
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
    read: false
  };
  const options = {
    body: storedNotification.body,
    icon: './assets/pwa/icon-192.png',
    badge: './assets/pwa/icon-192.png',
    tag: payload.tag || 'central-comunicado',
    renotify: true,
    data: {
      url: storedNotification.url,
      notificationId
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification?.data?.url || './', self.location.href).href;
  event.waitUntil(
    markCentralNotificationRead(event.notification?.data?.notificationId).catch(() => null).then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true })).then((clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.registration.scope));
      if (existing) {
        existing.navigate(targetUrl);
        return existing.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

async function readAppwriteFallbackCookie() {
  try {
    const cache = await caches.open(APPWRITE_AUTH_CACHE);
    const response = await cache.match(APPWRITE_FALLBACK_CACHE_KEY);
    return response ? await response.text() : '';
  } catch (error) {
    console.warn('Central: não foi possível recuperar a sessão anônima do Appwrite.', error);
    return '';
  }
}

async function writeAppwriteFallbackCookie(value) {
  if (!value) return;
  try {
    const cache = await caches.open(APPWRITE_AUTH_CACHE);
    await cache.put(
      APPWRITE_FALLBACK_CACHE_KEY,
      new Response(value, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      })
    );
  } catch (error) {
    console.warn('Central: não foi possível persistir a sessão anônima do Appwrite.', error);
  }
}

async function clearAppwriteFallbackCookie() {
  try {
    const cache = await caches.open(APPWRITE_AUTH_CACHE);
    await cache.delete(APPWRITE_FALLBACK_CACHE_KEY);
  } catch (error) {
    console.warn('Central: não foi possível limpar a sessão anônima do Appwrite.', error);
  }
}

function buildAppwriteRequest(request, fallbackCookie = '') {
  const headers = new Headers(request.headers);

  // O formato de resposta é opcional. Não congelamos a Central em uma versão
  // antiga do protocolo do Appwrite; deixamos o Cloud responder no formato atual.
  headers.delete('X-Appwrite-Response-Format');

  if (fallbackCookie) {
    headers.set('X-Fallback-Cookies', fallbackCookie);
  }

  return new Request(request, {
    headers,
    credentials: 'include'
  });
}

async function createAnonymousAppwriteSession() {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Appwrite-Project': APPWRITE_PROJECT_ID
  });

  const storedFallbackCookie = await readAppwriteFallbackCookie();
  if (storedFallbackCookie) {
    headers.set('X-Fallback-Cookies', storedFallbackCookie);
  }

  const response = await fetch(`${APPWRITE_ENDPOINT_ORIGIN}/v1/account/sessions/anonymous`, {
    method: 'POST',
    headers,
    body: '{}',
    credentials: 'include'
  });

  if (!response.ok && response.status !== 409) {
    throw new Error(`Falha ao criar sessão anônima no Appwrite (${response.status}).`);
  }

  const fallbackCookie = response.headers.get('X-Fallback-Cookies') || '';
  if (fallbackCookie) {
    await writeAppwriteFallbackCookie(fallbackCookie);
  }

  return fallbackCookie || storedFallbackCookie;
}

function isAppwriteAuthError(response) {
  return response && (response.status === 401 || response.status === 403);
}

async function handleCentralAppwriteWrite(request) {
  // 1) Mantém compatibilidade com a permissão antiga de visitante (Role.guests/any).
  const guestResponse = await fetch(buildAppwriteRequest(request.clone()));
  if (!isAppwriteAuthError(guestResponse)) {
    return guestResponse;
  }

  // 2) Se já há sessão anônima salva, tenta como Role.users antes de criar outra.
  let fallbackCookie = await readAppwriteFallbackCookie();
  if (fallbackCookie) {
    const authenticatedResponse = await fetch(buildAppwriteRequest(request.clone(), fallbackCookie));
    if (!isAppwriteAuthError(authenticatedResponse)) {
      return authenticatedResponse;
    }
    await clearAppwriteFallbackCookie();
    fallbackCookie = '';
  }

  // 3) Cria uma sessão anônima e repete a gravação. Role.users() no Appwrite
  // inclui usuários anônimos, preservando a Central sem exigir login do motorista.
  try {
    fallbackCookie = await createAnonymousAppwriteSession();
    return await fetch(buildAppwriteRequest(request.clone(), fallbackCookie));
  } catch (error) {
    console.error('Central: falha no fallback de autenticação do Appwrite.', error);
    return guestResponse;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (
    request.method === 'POST'
    && requestUrl.origin === APPWRITE_ENDPOINT_ORIGIN
    && requestUrl.pathname === APPWRITE_CENTRAL_ROWS_PATH
  ) {
    event.respondWith(handleCentralAppwriteWrite(request));
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const isNavigation = request.mode === 'navigate';
  const networkRequest = isNavigation
    ? new Request(request, { cache: 'no-store' })
    : request;

  event.respondWith(
    fetch(networkRequest)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(isNavigation ? './index.html' : request, responseClone));
        return response;
      })
      .catch(() => caches.match(request).then((cachedResponse) => cachedResponse || caches.match('./index.html')))
  );
});

