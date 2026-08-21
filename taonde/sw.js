const CACHE_NAME = "taonde-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./src/styles.css",
  "./src/main.js",
  "./src/data.js",
  "./src/state.js",
  "./src/utils.js",
  "./src/router.js",
  "./src/components.js",
  "./src/pages.js",
  "./src/push.js",
  "./src/admin.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "TáOnde", body: event.data?.text() || "Você recebeu uma nova notificação." };
  }

  const title = payload.title || "TáOnde";
  const options = {
    body: payload.body || "Nova atualização no guia da cidade.",
    icon: "./assets/icon.svg",
    badge: "./assets/icon.svg",
    data: { link: payload.link || "/eventos" }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/eventos";
  const url = new URL(`./index.html#${link}`, self.location.origin + self.location.pathname.replace(/sw\.js$/, ""));
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const client = clients.find((item) => "focus" in item);
      if (client) {
        client.navigate(url.href);
        return client.focus();
      }
      return self.clients.openWindow(url.href);
    })
  );
});
