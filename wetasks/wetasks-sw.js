self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = {}; }
  event.waitUntil(self.registration.showNotification(payload.title || 'WeTasks', {
    body: payload.body || 'Você tem uma tarefa agendada.',
    tag: payload.tag || 'wetasks-scheduled',
    renotify: false,
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
