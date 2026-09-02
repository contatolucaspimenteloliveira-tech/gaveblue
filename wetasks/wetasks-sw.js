// Cache public app assets only. Never intercept Supabase or user data requests.
const APP_CACHE = 'wetasks-shell-20260902-4';
const APP_ASSETS = [
  './', './index.html', './wetasks.css', './wetasks-app.css?v=20260902-3',
  './wetasks.js?v=20260902-app-3', './wetasks-app.js?v=20260902-3',
  './wetasks-cloud.js', './supabase-config.js', './manifest.webmanifest',
  './icons/wetasks-180-v2.png', './icons/wetasks-192-v2.png', './icons/wetasks-512-v2.png',
  './vendor/tailwind-3.4.17.js', './vendor/lucide-0.263.0.min.js'
];
const APP_URLS = new Set(APP_ASSETS.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(APP_ASSETS)));
  // Updates activate when old windows close, avoiding a reload during task editing.
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('wetasks-shell-') && key !== APP_CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith('/wetasks/')) return;
  const navigation = request.mode === 'navigate';
  if (!navigation && !APP_URLS.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(APP_CACHE);
    try {
      const response = await fetch(request);
      if (response.ok && !response.redirected) {
        const cacheKey = navigation ? new URL('./', self.registration.scope).href : request;
        await cache.put(cacheKey, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await cache.match(navigation ? new URL('./', self.registration.scope).href : request);
      if (cached) return cached;
      throw error;
    }
  })());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = {}; }
  event.waitUntil(self.registration.showNotification(payload.title || 'WeTasks', {
    body: payload.body || 'Você tem uma tarefa agendada.',
    tag: payload.tag || 'wetasks-scheduled',
    renotify: false,
    icon: '/wetasks/icons/wetasks-192-v2.png',
    data: { url: payload.url || '/wetasks/', taskId: payload.taskId || '' }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/wetasks/', self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => client.url.startsWith(`${self.location.origin}/wetasks`));
    if (existing) {
      existing.navigate(targetUrl);
      return existing.focus();
    }
    return clients.openWindow(targetUrl);
  }));
});
